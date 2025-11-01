import { useEffect, useState } from 'react';
import { deposit, getBalance } from '../lib/api';
import { notify } from '../lib/notify';
// Device verification is no longer required for deposits (policy update)
import { Link } from 'react-router-dom';

/**
 * Deposit form posts an amount and shows confirmation.
 *
 * UX rules:
 * - Admins bypass device verification checks.
 * - Unverified users can see the form, but submission is blocked with a friendly notice.
 * - Amount must be a positive number; invalid input disables the submit button.
 */
export default function Deposit() {
  // Keep amount as a string to avoid NaN state while typing; parse on submit
  const [amountInput, setAmountInput] = useState<string>('');
  const [description, setDescription] = useState('Deposit');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(true);

  // Derived validity state for the amount field
  const parsedAmount = parseFloat(amountInput);
  const isAmountValid = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  // Load current balance on mount
  useEffect(() => {
    (async () => {
      try {
        setIsBalanceLoading(true);
        const acc = await getBalance();
        setBalance(parseFloat(acc?.balance || 0));
        setCurrency(acc?.currency || 'USD');
      } catch (e: any) {
        notify('Balance error', e?.message || 'Failed to load balance');
      } finally {
        setIsBalanceLoading(false);
      }
    })();
  }, []);

  /**
   * Handle form submission.
   * - Device verification is NOT required anymore per new policy.
   * - Validates amount before posting to API.
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate amount input before submission
    if (!isAmountValid) {
      setMsg('Please enter a valid positive amount');
      notify('Invalid amount', 'Oops! Please enter a positive amount to deposit.');
      return;
    }
    
    setIsLoading(true);
    setMsg(null);
    try {
      // Submit deposit using parsed numeric amount
      const tx = await deposit(parsedAmount, description);
      setMsg(`Deposited ${parseFloat(tx?.amount).toFixed(2)} successfully`);
      notify('Deposit confirmation', `Amount: ${parseFloat(tx?.amount).toFixed(2)}`);
      // Refresh balance after successful deposit (use server source of truth)
      try {
        const acc = await getBalance();
        setBalance(parseFloat(acc?.balance || 0));
        setCurrency(acc?.currency || 'USD');
      } catch {}
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
      <h2 className="text-3xl font-extrabold mb-4 text-brand-600">Deposit</h2>
      {/* Current Balance panel */}
      <div className="mb-4 p-4 rounded-xl bg-brand-50 border border-brand-500/20 shadow flex items-center justify-between">
        <div>
          <div className="text-xs text-jamboBlack/60">Current Balance</div>
          <div className="text-2xl font-bold text-brand-600">
            {isBalanceLoading ? '…' : balance !== null ? `${balance.toFixed(2)} ${currency}` : '—'}
          </div>
        </div>
        <div>
          <Link to="/dashboard" className="text-xs px-3 py-1 rounded-full text-white bg-brand-600 hover:bg-brand-700 shadow">
            Go to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Device verification indicator removed per policy change */}
      
      <form className="space-y-4 p-5 rounded-xl bg-brand-50 border border-brand-500/20 shadow-xl" onSubmit={onSubmit}>
        {/* Amount input (string-based to avoid NaN during typing) */}
        <input
          className="w-full border border-brand-500/30 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          type="number"
          min="0.01"
          step="0.01"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          placeholder="Amount"
          required
        />
        {!isAmountValid && amountInput !== '' && (
          <p className="text-xs text-brand-600">Please enter a valid positive amount.</p>
        )}
        <input
          className="w-full border border-brand-500/30 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <button
          className={`w-full p-2 rounded transition disabled:opacity-60 text-white bg-brand-600 hover:bg-brand-700 shadow-lg`}
          disabled={isLoading || !isAmountValid}
        >
          {isLoading ? 'Processing…' : 'Deposit'}
        </button>
      </form>
      {msg && (
        <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-500/20 shadow">
          <p className="text-sm text-jamboBlack mb-2">{msg}</p>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="px-3 py-2 rounded text-white bg-brand-600 hover:bg-brand-700 shadow">
              View Dashboard
            </Link>
            <Link to="/transactions" className="px-3 py-2 rounded border border-brand-500/30 bg-white hover:bg-brand-50">
              View Transactions
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}