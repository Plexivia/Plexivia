import { apiClient, API_BASE_URL } from '@/lib/api-client';

/**
 * VPS root console API.
 *
 * Two tokens live beside the normal dashboard session:
 *  - the *pending* token, held in memory only, bridging the password step and the code step
 *  - the *unlock* token, kept in sessionStorage so a refresh inside the 20-minute
 *    window does not force the operator to re-verify, and gone when the tab closes
 */

const UNLOCK_KEY = 'vpsUnlockToken';
const UNLOCK_EXPIRY_KEY = 'vpsUnlockExpiresAt';

let pendingToken = '';

export const vpsErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

/** True when the server told us the console is locked (HTTP 423). */
export const isLockedError = (error) => error?.response?.status === 423;

const readStore = (key) => {
  try {
    return sessionStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

const writeStore = (key, value) => {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {
    // Private mode or blocked storage: the token simply lives for this page view
  }
};

export const getUnlockToken = () => {
  const token = readStore(UNLOCK_KEY);
  const expiresAt = Number(readStore(UNLOCK_EXPIRY_KEY)) || 0;
  if (!token || expiresAt <= Date.now()) {
    if (token) clearUnlock();
    return '';
  }
  return token;
};

export const getUnlockExpiry = () => Number(readStore(UNLOCK_EXPIRY_KEY)) || 0;

export const setUnlock = (token, expiresInSeconds) => {
  writeStore(UNLOCK_KEY, token);
  writeStore(UNLOCK_EXPIRY_KEY, String(Date.now() + (Number(expiresInSeconds) || 0) * 1000));
};

export const clearUnlock = () => {
  writeStore(UNLOCK_KEY, '');
  writeStore(UNLOCK_EXPIRY_KEY, '');
};

const unlocked = () => ({ headers: { 'X-Vps-Token': getUnlockToken() } });
const pending = () => ({ headers: { 'X-Vps-Pending': pendingToken } });

const unwrap = (response) => response.data?.data ?? response.data;

// ---------------------------------------------------------------- unlock ----

export const fetchConsoleState = async () => unwrap(await apiClient.get('/api/vps/console/state'));

/** Step 1 — re-check the dashboard password. Keeps the pending token in memory. */
export const unlockWithPassword = async (password) => {
  const data = unwrap(await apiClient.post('/api/vps/console/unlock/password', { password }));
  pendingToken = data?.consoleToken || '';
  return data;
};

/** Step 2a — first-run authenticator setup: `deliver` is 'inline' (QR on screen) or 'email'. */
export const startEnrollment = async (deliver = 'inline') =>
  unwrap(await apiClient.post('/api/vps/console/unlock/authenticator', { deliver }, pending()));

/** Step 2b — mail a one-time unlock code instead of using the authenticator. */
export const sendEmailOtp = async () =>
  unwrap(await apiClient.post('/api/vps/console/unlock/email-otp', {}, pending()));

/** Step 3 — hand over the 6-digit code and store the unlock token. */
export const verifyCode = async (code, method = 'TOTP_AUTHENTICATOR') => {
  const data = unwrap(await apiClient.post('/api/vps/console/unlock/verify', { code, method }, pending()));
  if (data?.vpsToken) setUnlock(data.vpsToken, data.expiresInSeconds);
  pendingToken = '';
  return data;
};

export const lockConsole = async () => {
  try {
    await apiClient.post('/api/vps/console/lock', {});
  } finally {
    clearUnlock();
  }
};

// --------------------------------------------------------------- console ----

export const fetchTargets = async () => unwrap(await apiClient.get('/api/vps/console/targets', unlocked()));

export const fetchCommands = async () => unwrap(await apiClient.get('/api/vps/console/commands', unlocked()));

export const execCommand = async (targetId, commandId) =>
  unwrap(await apiClient.post('/api/vps/console/exec', { targetId, commandId }, unlocked()));

export const fetchLogs = async (limit = 50) =>
  unwrap(await apiClient.get(`/api/vps/console/logs?limit=${limit}`, unlocked()));

export const testConnection = async () => {
  const response = await apiClient.post('/api/vps/console/test', {}, unlocked());
  return { message: response.data?.message, ...(response.data?.data || {}) };
};

export const saveServer = async (payload) => {
  const response = await apiClient.put('/api/vps/console/server', payload, unlocked());
  return response.data;
};

export const resetEnrollment = async (adminId) => {
  const response = await apiClient.post('/api/vps/console/enrollment/reset', adminId ? { adminId } : {}, unlocked());
  return response.data;
};

// -------------------------------------------------------------- terminal ----

/** WebSocket URL for the interactive root shell, carrying both tokens. */
export const terminalSocketUrl = ({ rows = 30, cols = 110 } = {}) => {
  const accessToken = localStorage.getItem('accessToken') || '';
  const base = API_BASE_URL || window.location.origin;
  const url = new URL('/api/ws/vps-terminal', base.startsWith('http') ? base : window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('token', accessToken);
  url.searchParams.set('vps', getUnlockToken());
  url.searchParams.set('rows', String(rows));
  url.searchParams.set('cols', String(cols));
  return url.toString();
};
