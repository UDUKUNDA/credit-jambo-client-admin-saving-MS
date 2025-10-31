import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Route guard component that protects children and redirects unauthenticated users.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Friendly loading state while verifying token
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse text-brand-600">Loading secure content…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}