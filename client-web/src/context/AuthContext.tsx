import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login, setAuthToken, verifyToken } from '../lib/api';
import { notify, requestPushPermission } from '../lib/notify';

/**
 * Shape of the authenticated user stored in context.
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
}

/**
 * Context value for authentication state and actions.
 */
interface AuthContextValue {
  user: AuthUser | null;
  device: any | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  // Return data so caller can branch on role for redirects
  signIn: (email: string, password: string) => Promise<{ token: string; user: AuthUser; device: any }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider bootstraps token from localStorage, verifies it with backend,
 * and exposes login/logout actions along with current auth state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [device, setDevice] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Bootstraps auth state on app start by verifying saved token.
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const saved = localStorage.getItem('token');
        if (saved) {
          setAuthToken(saved); // Important: apply Authorization header globally
          const data = await verifyToken(); // Calls /api/auth/verify-token
          setUser({
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: data.user.role, // include role from backend
          });
          setDevice(data.device);
          setToken(saved);
        }
      } catch {
        // If token invalid, clear it silently
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setDevice(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Signs in the user by calling backend, saving token, and notifying.
  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      await requestPushPermission();
      const data = await login(email, password);
      setAuthToken(data?.token);
      localStorage.setItem('token', data?.token);
      setToken(data?.token);
      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role, // include role from backend
      });
      setDevice(data.device);

      // Gentle encouragement and success notifications
      notify('Login successful', `Welcome ${data?.user?.firstName || ''}!`);
      notify('Device verified', 'This device is approved.');

      // Return data so caller can decide redirect based on role
      return { token: data?.token, user: { 
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
      }, device: data.device };
    } finally {
      setLoading(false);
    }
  }

  // Signs out, clears token and state; resets app to public mode.
  function signOut() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setDevice(null);
    notify('Signed out', 'You are now logged out.');
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      device,
      token,
      isAuthenticated: !!token && !!user,
      loading,
      signIn,
      signOut,
    }),
    [user, device, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Helper hook to access auth state/actions.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}