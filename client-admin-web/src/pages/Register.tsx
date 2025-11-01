import { useState } from 'react';
import { register } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { notify, requestPushPermission } from '../lib/notify';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Controls whether the password is visible in the input for user convenience
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handles registration and redirects to login page on success.
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMsg(null);
    try {
      await requestPushPermission();
      const data = await register(email, password, firstName, lastName);
      setMsg(`Registered! User: ${data?.user?.email || email}`);
      notify('Registration successful', 'Please login.');
      // Redirect to login after a short friendly pause
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      // Log the full error for debugging
      console.error('Registration error:', err);
      console.error('Error response:', err?.response?.data);
      
      // Better error reporting: show backend validation errors or network error
      let errorMessage = 'Registration failed';
      
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Show all validation errors
        errorMessage = err.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setMsg(errorMessage);
      notify('Registration failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h2 className="text-2xl font-semibold mb-4">Create account</h2>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full border p-2 rounded"
          placeholder="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required />
        <input
          className="w-full border p-2 rounded"
          placeholder="Last Name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required />
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required />
        <div>
          <input
            className="w-full border p-2 rounded"
            placeholder="Password (min 6 characters)"
            // Toggle between "password" and "text" to allow viewing the password
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
          <label className="mt-1 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>
        </div>
        <button
          className="w-full bg-brand-600 text-white p-2 rounded hover:bg-brand-500 transition disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
    </section>
  );
}