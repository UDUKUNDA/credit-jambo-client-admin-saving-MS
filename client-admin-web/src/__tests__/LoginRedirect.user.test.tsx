/**
 * Validates that a normal user login redirects to /app.
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
        // Return a normal user to trigger app hub redirect
        return {
          token: 'fake.jwt.token',
          user: {
            id: 'u-2',
            email,
            firstName: 'Jane',
            lastName: 'Doe',
            role: 'user',
          },
          device: { id: 'd-2' },
        };
      },
    }),
  };
});

describe('Login redirection for user', () => {
  it('redirects user to /app after successful login', async () => {
    render(<Login />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }));

    // Expect navigation to app hub
    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/app');
    });
  });
});