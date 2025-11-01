import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAdminUserDetails, denyAdminUserAccess, restoreAdminUserAccess, assignAdminDevice } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { formatAmount } from '../../lib/format';

/**
 * AdminUserDetails
 * Displays a customer's profile, account, devices, and transactions for admin review.
 */
export default function AdminUserDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<boolean>(false);
  const [newDeviceId, setNewDeviceId] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const resp = await getAdminUserDetails(id);
        setData(resp);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /**
   * handleAccessToggle
   * Allows admin to deny or restore access by toggling isActive.
   */
  async function handleAccessToggle(nextActive: boolean) {
    if (!id) return;
    try {
      setSaving(true);
      setError(null);
      setActionMsg(null);
      const resp = nextActive ? await restoreAdminUserAccess(id) : await denyAdminUserAccess(id);
      // Update local state with returned user
      setData((prev: any) => ({ ...prev, user: resp.user }));
      setActionMsg(resp.message || (nextActive ? 'Access restored' : 'Access denied'));
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  /**
   * handleAssignDevice
   * Assigns a new device to the user. If no deviceId is provided, backend generates a random device.
   */
  async function handleAssignDevice() {
    if (!id) return;
    try {
      setAssigning(true);
      setError(null);
      setActionMsg(null);
      const resp = await assignAdminDevice(id, newDeviceId || undefined, false);
      const assigned = resp.device || resp;
      setData((prev: any) => ({
        ...prev,
        devices: Array.isArray(prev?.devices) ? [...prev.devices, assigned] : [assigned]
      }));
      setNewDeviceId('');
      setActionMsg('New device assigned successfully.');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-semibold mb-3">User Details</h2>
      <p className="text-gray-600 mb-6">Deep-dive into a customer's activity and device state. 🕵️‍♀️</p>

      {loading && <div className="animate-pulse text-brand-600">Loading user details…</div>}
      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}
      {actionMsg && <div className="mb-4 p-3 rounded bg-green-50 text-green-700">{actionMsg}</div>}

      {!loading && data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">Profile</h3>
            <div className="text-sm">Email: {data.user?.email}</div>
            <div className="text-sm">Name: {data.user?.firstName} {data.user?.lastName}</div>
            <div className="text-sm">Role: {data.user?.role}</div>
            <div className="text-sm">Active: {String(data.user?.isActive)}</div>
            <div className="text-xs text-gray-500 mt-1">Created: {new Date(data.user?.createdAt).toLocaleString()}</div>
            <div className="mt-4 flex gap-3">
              {data.user?.isActive ? (
                <button
                  disabled={saving}
                  onClick={() => handleAccessToggle(false)}
                  className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? 'Applying…' : 'Deny Full Access'}
                </button>
              ) : (
                <button
                  disabled={saving}
                  onClick={() => handleAccessToggle(true)}
                  className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Applying…' : 'Restore Access'}
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded border">
            <h3 className="text-lg font-semibold mb-2">Account</h3>
            {data.account ? (
              <>
                <div className="text-sm">Balance: {formatAmount(data.account.balance)}</div>
                <div className="text-sm">Currency: {data.account.currency}</div>
                <div className="text-xs text-gray-500 mt-1">Created: {new Date(data.account.createdAt).toLocaleString()}</div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No account found.</div>
            )}
          </div>

          <div className="p-4 rounded border md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Devices</h3>
            {data.devices?.length ? (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Device ID</th>
                      <th className="text-left p-2">Verified</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.devices.map((d: any) => (
                      <tr key={`${d.userId}_${d.deviceId}`} className="border-t">
                        <td className="p-2 font-mono text-xs">{d.deviceId}</td>
                        <td className="p-2">{d.isVerified ? 'Yes' : 'No'}</td>
                        <td className="p-2">{new Date(d.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No devices registered.</div>
            )}
            <div className="mt-4 p-3 rounded border">
              <h4 className="text-md font-medium mb-2">Assign New Device</h4>
              <p className="text-xs text-gray-500 mb-3">
                Provide a device ID or leave blank to generate a random one for development.
              </p>
              <div className="flex items-center gap-2">
                <input
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="Optional device ID"
                  className="px-3 py-2 border rounded w-64"
                />
                <button
                  disabled={assigning}
                  onClick={handleAssignDevice}
                  className="px-3 py-2 rounded bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {assigning ? 'Assigning…' : 'Assign Device'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded border md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Transactions</h3>
            {data.transactions?.length ? (
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((t: any) => (
                      <tr key={t.id} className="border-t">
                        <td className="p-2">{t.type}</td>
                        <td className="p-2">{formatAmount(t.amount)}</td>
                        <td className="p-2">{t.status}</td>
                        <td className="p-2">{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No transactions.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}