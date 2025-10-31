/**
 * Validates that admin login redirects to /admin/dashboard.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import React from 'react';

// Mock notify to avoid side effects
vi.mock('../lib/notify', () => ({
  notify: vi.fn(),
  requestPushPermission: vi.fn(),
}));

// Mock navigation, capture navigate calls
const navigateSpy = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const orig = await importOriginal<any>();
  return {
    ...orig,
    useNavigate: () => navigateSpy,
  };
});

// Mock useAuth to control signIn behavior
vi.mock('../context/AuthContext', () => {
  return {
    useAuth: () => ({
      signIn: async (email: string, password: string) => {
        // Return an admin user to trigger admin redirect
        return {
          token: 'fake.jwt.token',
          user: {
            id: 'u-1',
            email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
          },
          device: { id: 'd-1' },
        };
      },
    }),
  };
});

describe('Login redirection for admin', () => {
  it('redirects admin to /admin/dashboard after successful login', async () => {
    render(<Login />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'admin@savings.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'admin123' },
    });

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    // Expect navigation to admin dashboard
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/admin/dashboard');
    });
  });
});