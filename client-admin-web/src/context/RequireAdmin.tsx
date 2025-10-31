import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * RequireAdmin
 * Route guard that ensures the current user has admin privileges.
 * Redirects non-admins to the app hub gracefully.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-pulse text-brand-600">Loading admin content…</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}