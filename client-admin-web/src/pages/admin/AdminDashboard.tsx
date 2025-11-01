import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getAdminStats } from '../../lib/api';

/**
 * AdminDashboard
 * Simple admin landing page with quick links to admin features.
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load stats for the dashboard
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const s = await getAdminStats();
        setStats(s);
      } catch (err: any) {
        setError(err?.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-3xl font-bold mb-2 text-jamboBlack">Admin Dashboard</h2>
      <p className="text-jamboBlack/60 mb-6">
        Welcome {user?.firstName}! You've got the keys. Let's keep things running smoothly. 😄
      </p>

      {/* Stats summary */}
      {loading && <div className="animate-pulse text-brand-600 mb-6">Loading stats…</div>}
      {error && <div className="mb-6 p-3 rounded bg-brand-50 text-brand-700 border border-brand-500/20">{error}</div>}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 rounded border border-brand-500/20">
            <div className="text-sm text-jamboBlack/60">Users</div>
            <div className="text-2xl font-semibold text-jamboBlack">{stats.usersCount ?? 0}</div>
          </div>
          <div className="p-4 rounded border border-brand-500/20">
            <div className="text-sm text-jamboBlack/60">Devices</div>
            <div className="text-2xl font-semibold text-jamboBlack">{stats.devices?.total ?? 0}</div>
            <div className="text-xs text-jamboBlack/50">Verified: {stats.devices?.verified ?? 0}</div>
          </div>
          <div className="p-4 rounded border border-brand-500/20">
            <div className="text-sm text-jamboBlack/60">Accounts</div>
            <div className="text-2xl font-semibold text-jamboBlack">{stats.accounts?.total ?? 0}</div>
            <div className="text-xs text-jamboBlack/50">Balance Sum: {stats.accounts?.balanceSum ?? 0}</div>
          </div>
          <div className="p-4 rounded border border-brand-500/20">
            <div className="text-sm text-jamboBlack/60">Transactions</div>
            <div className="text-2xl font-semibold text-jamboBlack">{stats.transactions?.total ?? 0}</div>
            <div className="text-xs text-jamboBlack/50">Deposits: {stats.transactions?.depositsTotal ?? 0}</div>
            <div className="text-xs text-jamboBlack/50">Withdrawals: {stats.transactions?.withdrawalsTotal ?? 0}</div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="block p-6 rounded-lg border border-brand-500/20 hover:border-brand-600 transition">
          <h3 className="text-xl font-semibold text-jamboBlack">Users</h3>
          <p className="text-jamboBlack/60">Browse and review registered users.</p>
        </Link>

        <Link to="/admin/devices" className="block p-6 rounded-lg border border-brand-500/20 hover:border-brand-600 transition">
          <h3 className="text-xl font-semibold text-jamboBlack">Devices</h3>
          <p className="text-jamboBlack/60">Manage and verify registered device IDs.</p>
        </Link>

        <Link to="/app" className="block p-6 rounded-lg border border-brand-500/20 hover:border-brand-600 transition">
          <h3 className="text-xl font-semibold text-jamboBlack">Back to App Home</h3>
          <p className="text-jamboBlack/60">Visit the regular user hub.</p>
        </Link>
      </div>
    </section>
  );
}