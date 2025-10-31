import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notify } from '../lib/notify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      notify('Login successful', 'Redirecting to your home…');

      if (result?.user?.role === 'admin') {
        // Redirect admins to admin dashboard
        navigate('/admin/dashboard');
      } else {
        // Normal users to the app hub
        navigate('/app');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed';
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
        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
        <button
          className="w-full bg-brand-600 text-white p-2 rounded hover:bg-brand-500 transition disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
    </section>
  );
}