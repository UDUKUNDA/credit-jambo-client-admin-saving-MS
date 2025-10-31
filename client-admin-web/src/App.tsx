import { Routes, Route, Link } from 'react-router-dom';
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

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header switched to black; protected links removed from nav */}
      <header className="sticky top-0 z-50 bg-jamboBlack text-white border-b border-black">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex justify-between items-center">
          <Link to="/" className="font-semibold text-brand-600">Credit Jambo</Link>
          <div className="flex gap-4">
            {/* Only public links here */}
            <Link to="/login" className="text-sm hover:text-brand-600">Login</Link>
            <Link to="/register" className="text-sm hover:text-brand-600">Register</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">
        {/* Provide auth state to all routes */}
        <AuthProvider>
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
          </Routes>
        </AuthProvider>
      </main>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Credit Jambo
        </div>
      </footer>
      {/* Global toast hub */}
      <ToastHub />
    </div>
  );
}
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';