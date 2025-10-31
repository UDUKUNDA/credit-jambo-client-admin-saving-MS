import { useEffect, useState } from 'react';
import { getTransactions } from '../lib/api';

/**
 * Transactions list page with simple pagination support.
 */
export default function Transactions() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getTransactions(100, 0);
        setItems(data?.transactions || []);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
      {isLoading && <div>Loading…</div>}
      {!isLoading && items.length === 0 && <div className="text-sm text-gray-500">No transactions yet.</div>}
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="flex justify-between border rounded px-3 py-2 bg-white">
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
    </section>
  );
}