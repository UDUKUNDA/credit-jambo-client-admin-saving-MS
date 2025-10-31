import { useEffect, useState } from 'react';
import { getAdminUsers } from '../../lib/api';

/**
 * AdminUsers
 * Fetches and displays a paginated list of users (admin-only).
 */
export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminUsers(50, 0);
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        console.error('Failed to load users:', err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-semibold mb-3">Users ({total})</h2>
      {loading ? (
        <div className="animate-pulse text-brand-600">Loading users…</div>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">First Name</th>
                <th className="text-left p-2">Last Name</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Active</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.firstName}</td>
                  <td className="p-2">{u.lastName}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{String(u.isActive)}</td>
                  <td className="p-2">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}