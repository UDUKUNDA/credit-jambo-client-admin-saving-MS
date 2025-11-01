import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBalance, getTransactions } from '../lib/api';
import { notify } from '../lib/notify';
import DeviceVerificationBanner from '../components/DeviceVerificationBanner';

/**
 * Dashboard shows current balance and recent transactions.
 * Emits low-balance alerts when below threshold.
 */
/**
 * Dashboard
 * Shows the authenticated user's balance and their own recent transactions.
 * Adds helpful navigation links to the AppHome (Bento hub).
 */
export default function Dashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const LOW_BALANCE_THRESHOLD = 20; // Adjust as desired

  // Load current user's balance and transactions (user-scoped backend)
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const acc = await getBalance();
        setBalance(parseFloat(acc?.balance || 0));
        setCurrency(acc?.currency || 'USD');

        // getTransactions returns only the authenticated user's transactions
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        {/* Quick link to AppHome hub */}
        <Link to="/app" className="text-xs px-3 py-1 rounded-full text-white bg-brand-600 hover:bg-brand-700 shadow">
          Go to home
        </Link>
      </div>

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
            <Link to="/app" className="text-xs px-3 py-1 rounded-full text-white bg-brand-600 hover:bg-brand-700 shadow">
              AppHome
            </Link>
          </div>
          {/* Futuristic, brand-styled timeline of user transactions */}
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 border-l border-brand-500/20"></div>
            <div className="space-y-3">
              {isLoading && <div className="text-sm text-brand-700">Loading transactions…</div>}
              {!isLoading && transactions.length === 0 && (
                <div className="text-sm text-jamboBlack/60">No transactions yet.</div>
              )}
              {!isLoading && transactions.map((t) => (
                <div key={t.id} className="relative pl-8">
                  {/* Accent dot indicating transaction type */}
                  <span className={`absolute left-2 top-3 h-2 w-2 rounded-full ${t.type === 'DEPOSIT' ? 'bg-jamboGreen' : 'bg-brand-600'}`}></span>
                  {/* Transaction card: type, time, description, amount */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-brand-500/20 bg-brand-50 hover:bg-brand-50/70 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-brand-600">
                          {t.type}
                        </span>
                        {/* Transaction time shown in local format */}
                        <span className="text-xs text-jamboBlack/60">{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-jamboBlack mt-1">{t.description || '—'}</div>
                    </div>
                    <div className={`text-lg font-semibold ${t.type === 'DEPOSIT' ? 'text-jamboGreen' : 'text-brand-700'}`}>
                      {t.type === 'DEPOSIT' ? '+' : '-'}{parseFloat(t.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}