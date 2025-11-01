import { useEffect, useState } from 'react';
import { getAdminDevices, verifyAdminDevice, deleteAdminDevice } from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { confirmAction } from '../../lib/confirm';

/**
 * AdminDevices
 * Lists registered devices and allows verifying by deviceId.
 * Friendly UI with clear loading, error, and success feedback.
 */
export default function AdminDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load devices on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await getAdminDevices();
        setDevices(list || []);
      } catch (err: any) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * verifyDevice
   * Calls backend to mark the device as verified and updates UI optimistically.
   */
  async function verifyDevice(deviceId: string) {
    try {
      setVerifyingId(deviceId);
      setError(null);
      await verifyAdminDevice(deviceId);
      // Optimistic update: flip isVerified for the deviceId
      setDevices((prev) => prev.map((d) => (d.deviceId === deviceId ? { ...d, isVerified: true } : d)));
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setVerifyingId(null);
    }
  }

  /**
   * deleteDevice
   * Removes a device from the system with confirmation.
   */
  async function deleteDevice(deviceId: string) {
    if (!confirmAction('Delete this device?')) return;
    try {
      setDeletingId(deviceId);
      setError(null);
      await deleteAdminDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-semibold mb-3 text-jamboBlack">Devices</h2>
      <p className="text-jamboBlack/60 mb-6">
        Manage registered device IDs. Verify devices to unlock full access for customers. 🌟
      </p>

      {loading && <div className="animate-pulse text-brand-600">Loading devices…</div>}
      {error && <div className="mb-4 p-3 rounded bg-brand-50 text-brand-700 border border-brand-500/20">{error}</div>}

      {!loading && (
        <div className="overflow-x-auto border border-brand-500/20 rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-50">
              <tr>
                <th className="text-left p-2 text-jamboBlack">User ID</th>
                <th className="text-left p-2 text-jamboBlack">Device ID</th>
                <th className="text-left p-2 text-jamboBlack">Verified</th>
                <th className="text-left p-2 text-jamboBlack">Created</th>
                <th className="text-left p-2 text-jamboBlack">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={`${d.userId}_${d.deviceId}`} className="border-t border-brand-500/20">
                  <td className="p-2 text-jamboBlack">{d.userId}</td>
                  <td className="p-2 font-mono text-xs text-jamboBlack">{d.deviceId}</td>
                  <td className="p-2 text-jamboBlack">{d.isVerified ? 'Yes' : 'No'}</td>
                  <td className="p-2 text-jamboBlack">{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={d.isVerified || verifyingId === d.deviceId}
                        onClick={() => verifyDevice(d.deviceId)}
                        className="px-3 py-1 rounded bg-brand-600 text-white disabled:bg-brand-500/30 disabled:text-jamboBlack/50"
                      >
                        {verifyingId === d.deviceId ? 'Verifying…' : d.isVerified ? 'Verified' : 'Verify'}
                      </button>
                      <button
                        disabled={deletingId === d.deviceId}
                        onClick={() => deleteDevice(d.deviceId)}
                        className="px-3 py-1 rounded bg-black text-white hover:bg-jamboBlack disabled:opacity-50"
                      >
                        {deletingId === d.deviceId ? 'Deleting…' : 'Delete'}
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