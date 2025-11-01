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
 * getDeviceId
 * Generates or retrieves a stable device identifier for this browser.
 * Stored in localStorage so registration can associate this device with the user.
 */
/**
 * getDeviceId
 * Returns a stable device identifier for this browser/session.
 * If none exists, it creates one and stores it in localStorage.
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    // Create a simple deterministic id: prefix + timestamp + random chunk
    deviceId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
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

/**
 * Request password reset by email.
 * POST /api/auth/request-password-reset
 * Returns a generic message. In non-production, may include a tempPassword for demo.
 */
export async function requestPasswordReset(email: string): Promise<{ message: string; tempPassword?: string }> {
  const res = await api.post('/api/auth/request-password-reset', { email });
  return res.data;
}

export async function getAdminUsers(limit = 50, offset = 0) {
  const res = await api.get('/api/admin/users', { params: { limit, offset } });
  return res.data;
}

/**
 * Admin: Fetch detailed user info including account, devices, transactions.
 */
export async function getAdminUserDetails(userId: string) {
  const res = await api.get(`/api/admin/users/${userId}/details`);
  return res.data;
}

/**
 * Admin: Fetch devices (optional filter by userId).
 */
export async function getAdminDevices(userId?: string) {
  const res = await api.get('/api/admin/devices', { params: userId ? { userId } : {} });
  return res.data;
}

/**
 * Admin: Verify a device by its deviceId.
 */
export async function verifyAdminDevice(deviceId: string) {
  const res = await api.post(`/api/admin/devices/${encodeURIComponent(deviceId)}/verify`);
  return res.data;
}

/**
 * Admin: Delete a device by deviceId.
 */
export async function deleteAdminDevice(deviceId: string) {
  const res = await api.delete(`/api/admin/devices/${encodeURIComponent(deviceId)}`);
  return res.data;
}

/**
 * Admin: Fetch global stats for dashboard.
 */
export async function getAdminStats() {
  const res = await api.get('/api/admin/stats');
  return res.data;
}

/**
 * Admin: Fetch all accounts (with user email).
 */
export async function getAdminAccounts() {
  const res = await api.get('/api/admin/accounts');
  return res.data;
}

/**
 * Admin: Fetch transactions with optional filters.
 */
export async function getAdminTransactions(filters?: { type?: string; status?: string; userId?: string }) {
  const res = await api.get('/api/admin/transactions', { params: filters || {} });
  return res.data;
}

/**
 * Admin: Toggle user access (deny/restore) by setting isActive.
 * PATCH /api/admin/users/:id/access
 */
export async function setAdminUserAccess(userId: string, isActive: boolean) {
  const res = await api.patch(`/api/admin/users/${encodeURIComponent(userId)}/access`, { isActive });
  return res.data;
}

/** Convenience wrappers */
export async function denyAdminUserAccess(userId: string) {
  return setAdminUserAccess(userId, false);
}

export async function restoreAdminUserAccess(userId: string) {
  return setAdminUserAccess(userId, true);
}

/**
 * Admin: Assign a new device to a user. If deviceId is omitted, backend generates.
 */
export async function assignAdminDevice(userId: string, deviceId?: string, isVerified?: boolean) {
  const res = await api.post(`/api/admin/users/${encodeURIComponent(userId)}/devices`, { deviceId, isVerified });
  return res.data;
}

/**
 * Admin: Delete a user and related data.
 */
export async function deleteAdminUser(userId: string) {
  const res = await api.delete(`/api/admin/users/${encodeURIComponent(userId)}`);
  return res.data;
}