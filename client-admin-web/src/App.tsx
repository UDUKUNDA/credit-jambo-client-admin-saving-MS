import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Transactions from './pages/Transactions';
import ToastHub from './components/ToastHub';
import { AuthProvider } from './context/AuthContext';
import RequireAuth from './context/RequireAuth';
import RequireAdmin from './context/RequireAdmin';
import AppHome from './pages/AppHome'; // New: Bento grid hub
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDevices from './pages/admin/AdminDevices';
import AdminUserDetails from './pages/admin/AdminUserDetails';
import { useAuth } from './context/AuthContext';

/**
 * HeaderBar
 * Renders the top navigation. Shows Login/Register for guests and Sign Out when
 * authenticated. Uses context inside provider.
 */
function HeaderBar() {
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  /**
   * handleSignOut
   * Logs the user out and navigates back to the public landing page.
   */
  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-jamboBlack text-white border-b border-black">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
        <Link to="/" className="font-semibold text-brand-600">Credit Jambo</Link>
        <div className="flex gap-4">
          {/* Show public links for guests; Sign Out for authenticated users */}
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="text-sm bg-brand-600 text-white px-3 py-1 rounded hover:bg-brand-500 transition"
              title="Sign out of your account"
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:text-brand-600">Login</Link>
              <Link to="/register" className="text-sm hover:text-brand-600">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

/**
 * App
 * Root layout and routing. Header shows Login/Register for guests, and
 * switches to a Sign Out button when the user is authenticated.
 */
export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header switched to black; protected links removed from nav */}
        <HeaderBar />
        <main className="flex-1">
          {/* Provide auth state to all routes */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected Bento hub page */}
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppHome />
                </RequireAuth>
              }
            />
            {/* Protected finance routes remain, but not visible in header */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/deposit"
              element={
                <RequireAuth>
                  <Deposit />
                </RequireAuth>
              }
            />
            <Route
              path="/withdraw"
              element={
                <RequireAuth>
                  <Withdraw />
                </RequireAuth>
              }
            />
            <Route
              path="/transactions"
              element={
                <RequireAuth>
                  <Transactions />
                </RequireAuth>
              }
            />
            {/* Admin routes (double-protected) */}
            <Route
              path="/admin/dashboard"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminDashboard />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminUsers />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/users/:id"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminUserDetails />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/devices"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AdminDevices />
                  </RequireAdmin>
                </RequireAuth>
              }
            />
          </Routes>
        </main>
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Credit Jambo
          </div>
        </footer>
        {/* Global toast hub */}
        <ToastHub />
      </div>
    </AuthProvider>
  );
}