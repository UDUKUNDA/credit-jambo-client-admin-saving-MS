import { useState } from 'react';
import { deposit } from '../lib/api';
import { notify } from '../lib/notify';

/**
 * Deposit form posts an amount and shows confirmation.
 */
export default function Deposit() {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('Deposit');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      const tx = await deposit(amount, description);
      setMsg(`Deposited ${parseFloat(tx?.amount).toFixed(2)} successfully`);
      notify('Deposit confirmation', `Amount: ${parseFloat(tx?.amount).toFixed(2)}`);
    } catch (err: any) {
      const m = err?.response?.data?.error || 'Deposit failed';
      setMsg(m);
      notify('Deposit failed', m);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h2 className="text-2xl font-semibold mb-4">Deposit</h2>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full border p-2 rounded"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          placeholder="Amount"
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <button className="w-full bg-brand-600 text-white p-2 rounded hover:bg-brand-500 transition disabled:opacity-60" disabled={isLoading}>
          {isLoading ? 'Depositing…' : 'Deposit'}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
    </section>
  );
}