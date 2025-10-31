// lib/api.ts - HTTP client for client-web
import axios from 'axios';

// IMPORTANT: Use relative base path in development so Vite dev proxy handles CORS.
// This makes requests go to http://localhost:5173/api/... which Vite forwards to http://localhost:3001/api/...
const baseURL = ''; // no absolute URL => same-origin with Vite dev server

// Create Axios instance with default JSON headers
export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Generate a unique device ID for this browser session.
 * Uses localStorage to persist the same deviceId across page reloads.
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    // Generate a simple unique ID: timestamp + random string
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

/**
 * Login user with email and password.
 * Returns: token and user data from backend on success.
 */
export async function login(email: string, password: string) {
  // Calls /api/auth/login via Vite proxy in dev
  const res = await api.post('/api/auth/login', { 
    email, 
    password, 
    deviceId: getDeviceId() 
  });
  return res.data;
}

/**
 * Register user with email, password, firstName, and lastName.
 * Returns: created user data and device info from backend on success.
 */
export async function register(email: string, password: string, firstName: string, lastName: string) {
  const payload = { 
    email, 
    password, 
    firstName, 
    lastName, 
    deviceId: getDeviceId() 
  };
  
  console.log('Sending registration payload:', payload);
  
  // Calls /api/auth/register via Vite proxy in dev
  const res = await api.post('/api/auth/register', payload);
  return res.data;
}

/**
 * Persist and apply auth token for authenticated endpoints.
 */
export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Initialize Authorization header if token exists.
 */
(function initAuthHeader() {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
})();

/**
 * Fetch current account balance for authenticated user.
 */
export async function getBalance() {
  const res = await api.get('/api/account/balance');
  return res.data;
}

/**
 * Fetch transaction history for authenticated user.
 */
export async function getTransactions(limit = 50, offset = 0) {
  const res = await api.get('/api/account/transactions', { params: { limit, offset } });
  return res.data;
}

/**
 * Make a deposit; returns created transaction.
 */
export async function deposit(amount: number, description = 'Deposit') {
  const res = await api.post('/api/account/deposit', { amount, description });
  return res.data;
}

/**
 * Make a withdrawal; returns created transaction.
 */
export async function withdraw(amount: number, description = 'Withdrawal') {
  const res = await api.post('/api/account/withdraw', { amount, description });
  return res.data;
}

/**
 * Verify current token and fetch normalized user/device.
 * Requires Authorization header set by setAuthToken/initAuthHeader.
 */
export async function verifyToken() {
  const res = await api.get('/api/auth/verify-token');
  return res.data;
}

export async function getAdminUsers(limit = 50, offset = 0) {
  const res = await api.get('/api/admin/users', { params: { limit, offset } });
  return res.data;
}