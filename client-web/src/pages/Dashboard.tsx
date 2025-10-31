import { useEffect, useState } from 'react';
import { getBalance, getTransactions } from '../lib/api';
import { notify } from '../lib/notify';

/**
 * Dashboard shows current balance and recent transactions.
 * Emits low-balance alerts when below threshold.
 */
export default function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const LOW_BALANCE_THRESHOLD = 20; // Adjust as desired

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const acc = await getBalance();
        setBalance(parseFloat(acc?.balance || 0));
        setCurrency(acc?.currency || 'USD');

        const tx = await getTransactions(20, 0);
        setTransactions(tx?.transactions || []);

        if (parseFloat(acc?.balance || 0) < LOW_BALANCE_THRESHOLD) {
          notify('Low balance warning', `Your balance is below ${LOW_BALANCE_THRESHOLD} ${currency}`);
        }
      } catch (e: any) {
        notify('Dashboard error', e?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg bg-white">
          <div className="text-sm text-gray-500">Current Balance</div>
          <div className="text-3xl font-bold text-jamboGreen mt-2">
            {isLoading ? '...' : `${balance?.toFixed(2)} ${currency}`}
          </div>
          {balance !== null && balance < LOW_BALANCE_THRESHOLD && (
            <div className="mt-2 text-sm text-brand-600">
              Heads up: Low balance! Consider depositing.
            </div>
          )}
        </div>

        <div className="p-6 border rounded-lg col-span-2 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
          </div>
          <div className="space-y-2">
            {isLoading && <div>Loading transactions…</div>}
            {!isLoading && transactions.length === 0 && <div className="text-sm text-gray-500">No transactions yet.</div>}
            {!isLoading && transactions.map((t) => (
              <div key={t.id} className="flex justify-between border rounded px-3 py-2">
                <div>
                  <div className="font-medium">{t.type}</div>
                  <div className="text-xs text-gray-500">{t.description}</div>
                </div>
                <div className={`font-semibold ${t.type === 'DEPOSIT' ? 'text-jamboGreen' : 'text-brand-600'}`}>
                  {t.type === 'DEPOSIT' ? '+' : '-'}{parseFloat(t.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}