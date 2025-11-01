import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notify } from '../lib/notify';
import { requestPasswordReset } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Controls whether the password is visible in the input for user convenience
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
 
  // Password reset UI state
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      // Sign in and get role to decide redirect
      const result = await signIn(email, password);
      setMsg('Welcome!');
      notify('You have Logined successfully');

      if (result?.user?.role === 'admin') {
        // Redirect admins to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // Normal users to the app hub
        navigate('/app');
      }
    } catch (err: any) {
      /**
       * Improve error reporting:
       * - Handle backend { error } and { errors: [] }
       * - Map common causes to clear messages
       */
      const status = err?.response?.status;
      const data = err?.response?.data || {};
      let message =
          data?.message ||
          data?.error ||
          (Array.isArray(data?.errors) ? data.errors.map((e: any) => e.msg || e.message).join(', ') : null) ||
          'Login failed';
  
      // Friendly mapping for known backend messages
      if (message === 'Invalid credentials') {
          message = 'Email or password is incorrect.';
      }
      
      // Device registration/verification is no longer required for login.
      // Remove special-case messaging to avoid confusion.
      if (message === 'Device pending verification') {
        message = 'Your Device is waiting to be verified- please wait patiently.';
      }
      // Rate limiter feedback
      if (status === 429) {
          message = 'Too many login attempts. Please try again after a short break.';
      }
  
      setMsg(message);
      notify('Login failed', message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <div>
          <input
            className="w-full border p-2 rounded"
            placeholder="Password"
            // Toggle between "password" and "text" to allow viewing the password
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <label className="mt-1 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>
        </div>
        {/* Device info note removed; login no longer gates on device verification */}
        <button
          className="w-full bg-brand-600 text-white p-2 rounded hover:bg-brand-500 transition disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}

      {/* Password Reset Panel */}
      <div className="mt-8 border rounded p-4 bg-white">
        <h3 className="text-sm font-semibold mb-2">Forgot your password?</h3>
        <p className="text-xs text-gray-600 mb-3">Enter your registered email to request a reset.</p>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setResetLoading(true);
            setResetMsg(null);
            try {
              const res = await requestPasswordReset(resetEmail || email);
              setResetMsg(res.message + (res.tempPassword ? ` Temporary password (dev): ${res.tempPassword}` : ''));
              notify('Password reset requested', res.message);
            } catch (err: any) {
              const message = err?.response?.data?.error || err?.message || 'Reset request failed';
              setResetMsg(message);
              notify('Reset request failed', message);
            } finally {
              setResetLoading(false);
            }
          }}
        >
          <input
            className="w-full border p-2 rounded"
            placeholder="Registered email"
            type="email"
            value={resetEmail || email}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button
            className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition disabled:opacity-60"
            disabled={resetLoading}
          >
            {resetLoading ? 'Requesting…' : 'Request Password Reset'}
          </button>
        </form>
        {resetMsg && <p className="mt-2 text-xs text-gray-600">{resetMsg}</p>}
      </div>
    </section>
  );
}