import { useEffect, useState } from 'react';
import { withdraw, getBalance } from '../lib/api';
import { notify } from '../lib/notify';
import { Link } from 'react-router-dom';
// Device verification is no longer required for withdrawals (policy update)

/**
 * Withdraw form posts an amount and shows alert notification.
 */
export default function Withdraw() {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('Withdrawal');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  /**
   * Load current account balance and currency on mount.
   */
  useEffect(() => {
    (async () => {
      try {
        setIsBalanceLoading(true);
        const acc = await getBalance();
        const b = parseFloat(acc?.balance || 0);
        setBalance(b);
        setCurrency(acc?.currency || 'USD');
      } catch (e: any) {
        notify('Balance load error', e?.message || 'Failed to load balance');
      } finally {
        setIsBalanceLoading(false);
      }
    })();
  }, []);

  /**
   * Handle amount input changes with validation against available balance.
   */
  function onAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const val = parseFloat(raw);
    const clean = isNaN(val) ? 0 : Math.max(0, val);
    setAmount(clean);

    if (clean <= 0) {
      setAmountError('Enter a valid amount greater than 0');
    } else if (balance !== null && clean > balance) {
      setAmountError('Amount exceeds available balance');
    } else {
      setAmountError(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Prevent overdraw or invalid amount
    if (amount <= 0) {
      setMsg('Enter a valid amount greater than 0');
      return;
    }
    if (balance !== null && amount > balance) {
      setMsg('Insufficient funds: amount exceeds available balance');
      return;
    }
    
    setIsLoading(true);
    setMsg(null);
    try {
      const tx = await withdraw(amount, description);
      setMsg(`Withdrew ${parseFloat(tx?.amount).toFixed(2)} successfully`);
      notify('Withdrawal alert', `Amount: ${parseFloat(tx?.amount).toFixed(2)}`);
      
      // Refresh balance after successful withdrawal
      try {
        const acc = await getBalance();
        const b = parseFloat(acc?.balance || 0);
        setBalance(b);
        setCurrency(acc?.currency || 'USD');
      } catch {}
    } catch (err: any) {
      const m = err?.response?.data?.error || 'Withdrawal failed';
      setMsg(m);
      notify('Withdrawal failed', m);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <h2 className="text-3xl font-extrabold mb-4 text-brand-600">Withdraw</h2>
      {/* Available balance panel */}
      {/* Current Balance panel with quick navigation to Dashboard */}
      <div className="mb-4 p-4 rounded-xl bg-brand-50 border border-brand-500/20 shadow flex items-center justify-between">
        <div>
          <div className="text-xs text-jamboBlack/60">Current Balance</div>
          <div className="text-2xl font-bold text-brand-600">
            {isBalanceLoading ? '…' : balance !== null ? `${balance.toFixed(2)} ${currency}` : '—'}
          </div>
        </div>
        {/* Link to Dashboard for quick overview */}
        <div>
          <Link to="/dashboard" className="text-xs px-3 py-1 rounded-full text-white bg-brand-600 hover:bg-brand-700 shadow">
            Go to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Device verification indicator removed per policy change */}
      
      <form className="space-y-4 p-5 rounded-xl bg-brand-50 border border-brand-500/20 shadow-xl" onSubmit={onSubmit}>
        <input
          className="w-full border border-brand-500/30 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={onAmountChange}
          placeholder="Amount"
          required
        />
        {amountError && (
          <p className="text-sm text-jamboBlack/60">{amountError}</p>
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
          disabled={isLoading || !!amountError}
        >
          {isLoading ? 'Processing…' : 'Withdraw'}
        </button>
      </form>
      {msg && (
        <div className="mt-4 p-4 rounded-xl bg-brand-50 border border-brand-500/20 shadow">
          <p className="text-sm text-jamboBlack mb-2">{msg}</p>
          {/* Helpful navigation after action */}
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