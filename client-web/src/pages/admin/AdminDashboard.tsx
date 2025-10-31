import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminDashboard
 * Simple admin landing page with quick links to admin features.
 */
export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
      <p className="text-gray-600 mb-6">
        Welcome {user?.firstName}! You’ve got the keys. Let’s keep things running smoothly. 😄
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="block p-6 rounded-lg border hover:border-brand-600 transition">
          <h3 className="text-xl font-semibold">Users</h3>
          <p className="text-gray-600">Browse and review registered users.</p>
        </Link>

        <Link to="/app" className="block p-6 rounded-lg border hover:border-brand-600 transition">
          <h3 className="text-xl font-semibold">Back to App Home</h3>
          <p className="text-gray-600">Visit the regular user hub.</p>
        </Link>
      </div>
    </section>
  );
}