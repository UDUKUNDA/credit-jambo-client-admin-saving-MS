import { useEffect, useState } from 'react';
import { getAdminUsers, denyAdminUserAccess, restoreAdminUserAccess, getAdminAccounts, deleteAdminUser } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { confirmAction } from '../../lib/confirm';
import { formatAmount } from '../../lib/format';

/**
 * AdminUsers
 * Fetches and displays a paginated list of users (admin-only).
 */
export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminUsers(50, 0);
        setUsers(data.users || []);
        setTotal(data.total || 0);
        const accounts = await getAdminAccounts();
        const map: Record<string, number> = {};
        (accounts || []).forEach((acc: any) => {
          const uid = acc.user?.id ?? acc.userId;
          if (uid !== undefined && uid !== null) {
            map[String(uid)] = Number(acc.balance ?? 0);
          }
        });
        setBalances(map);
      } catch (err: any) {
        console.error('Failed to load users/accounts:', getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * toggleAccess
   * Allows admin to deny or restore access directly from the users list.
   */
  async function toggleAccess(userId: string, nextActive: boolean) {
    try {
      setSavingId(userId);
      setError(null);
      setActionMsg(null);
      const resp = nextActive ? await restoreAdminUserAccess(userId) : await denyAdminUserAccess(userId);
      // Update the users list state
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: resp.user?.isActive } : u)));
      setActionMsg(resp.message || (nextActive ? 'Access restored' : 'Access denied'));
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  /**
   * handleDeleteUser
   * Deletes a user (and related data) with confirmation, updates list.
   */
  async function handleDeleteUser(userId: string) {
    if (!confirmAction('Delete this user and all related data?')) return;
    try {
      setSavingId(userId);
      setError(null);
      setActionMsg(null);
      await deleteAdminUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setActionMsg('User deleted successfully.');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-semibold mb-3">Users ({total})</h2>
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}
      {actionMsg && <div className="mb-4 p-3 rounded bg-green-50 text-green-700">{actionMsg}</div>}
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
                <th className="text-left p-2">Balance</th>
                <th className="text-left p-2">Active</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.firstName}</td>
                  <td className="p-2">{u.lastName}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2 font-mono text-xs">{formatAmount(balances[String(u.id)] ?? 0)}</td>
                  <td className="p-2">{String(u.isActive)}</td>
                  <td className="p-2">{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {u.isActive ? (
                        <button
                          disabled={savingId === u.id}
                          onClick={() => toggleAccess(u.id, false)}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {savingId === u.id ? 'Applying…' : 'Deny Access'}
                        </button>
                      ) : (
                        <button
                          disabled={savingId === u.id}
                          onClick={() => toggleAccess(u.id, true)}
                          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {savingId === u.id ? 'Applying…' : 'Restore Access'}
                        </button>
                      )}
                      <button
                        disabled={savingId === u.id}
                        onClick={() => handleDeleteUser(u.id)}
                        className="px-3 py-1 rounded bg-black text-white hover:bg-jamboBlack disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}