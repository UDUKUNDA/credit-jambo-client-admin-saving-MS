/**
 * Tests partial access functionality for unverified devices
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Deposit from '../pages/Deposit';
import Withdraw from '../pages/Withdraw';
import React from 'react';

// Mock notify to avoid side effects
vi.mock('../lib/notify', () => ({
  notify: vi.fn(),
}));

// Mock API calls
vi.mock('../lib/api', () => ({
  deposit: vi.fn(),
  withdraw: vi.fn(),
}));

describe('Access for Unverified Devices (updated policy: allowed)', () => {
  describe('Deposit Page', () => {
    it('allows unverified users to deposit without restriction', async () => {
      // Mock useAuth to return unverified user
      vi.mock('../context/AuthContext', () => ({
        useAuth: () => ({
          isDeviceVerified: false,
          user: { role: 'user', firstName: 'John' },
        }),
      }));

      const { notify } = await import('../lib/notify');
      const { deposit } = await import('../lib/api');
      // Allow deposit call to succeed
      (deposit as any).mockResolvedValue({ amount: '100' });
      
      render(<Deposit />);

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Amount'), {
        target: { value: '100' },
      });

      // Submit form
      fireEvent.submit(screen.getByRole('button'));

      // Expect no restriction message and normal button
      await waitFor(() => {
        expect(screen.getByText('Deposit')).toBeInTheDocument();
        expect(screen.queryByText('Device verification required for deposits')).not.toBeInTheDocument();
        expect(notify).not.toHaveBeenCalledWith(
          'Deposit Restricted',
          expect.any(String)
        );
      });
    });

    it('allows verified users to deposit normally', async () => {
      // Mock useAuth to return verified user
      vi.mock('../context/AuthContext', () => ({
        useAuth: () => ({
          isDeviceVerified: true,
          user: { role: 'user', firstName: 'Jane' },
        }),
      }));

      render(<Deposit />);

      // Check button shows normal deposit text
      expect(screen.getByText('Deposit')).toBeInTheDocument();
      
      // Should not show verification warning
      expect(screen.queryByText('Device verification required for deposits')).not.toBeInTheDocument();
    });

    it('allows admin users to bypass verification check', async () => {
      // Mock useAuth to return unverified admin
      vi.mock('../context/AuthContext', () => ({
        useAuth: () => ({
          isDeviceVerified: false,
          user: { role: 'admin', firstName: 'Admin' },
        }),
      }));

      render(<Deposit />);

      // Admin should see normal deposit button even with unverified device
      expect(screen.getByText('Deposit')).toBeInTheDocument();
      
      // Should not show verification warning for admin
      expect(screen.queryByText('Device verification required for deposits')).not.toBeInTheDocument();
    });
  });

  describe('Withdraw Page', () => {
    it('allows unverified users to withdraw without restriction', async () => {
      // Mock useAuth to return unverified user
      vi.mock('../context/AuthContext', () => ({
        useAuth: () => ({
          isDeviceVerified: false,
          user: { role: 'user', firstName: 'John' },
        }),
      }));

      const { notify } = await import('../lib/notify');
      const { withdraw } = await import('../lib/api');
      // Allow withdraw call to succeed
      (withdraw as any).mockResolvedValue({ amount: '50' });
      
      render(<Withdraw />);

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('Amount'), {
        target: { value: '50' },
      });

      // Submit form
      fireEvent.submit(screen.getByRole('button'));

      // Expect no restriction message and normal button
      await waitFor(() => {
        expect(screen.getByText('Withdraw')).toBeInTheDocument();
        expect(screen.queryByText('Device verification required for withdrawals')).not.toBeInTheDocument();
        expect(notify).not.toHaveBeenCalledWith(
          'Withdrawal Restricted',
          expect.any(String)
        );
      });
    });
  });
});