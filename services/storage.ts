import { User, StampEvent } from '../types';

/**
 * GOOGLE SHEETS / LOCAL STORAGE HYBRID LAYER
 */

const SESSION_KEY = 'stamplink_current_session_v4';
const ADMIN_SESSION_KEY = 'stamplink_admin_authenticated_v4';
const ADMIN_LOGS_KEY = 'stamplink_admin_history_v4';
const SYNC_CHANNEL = new BroadcastChannel('stamplink_global_sync');

// --- STATIC CONFIGURATION ---
const STATIC_API_URL = 'https://script.google.com/macros/s/AKfycbxBrn96cWsFD1QFYe65pTuF0rMfSLJ0XqHg2V9dDksGY-GjGl-FmyjRIxhU0j3YZ9oj/exec';

export const setApiUrl = (url: string) => {
  console.warn("API URL is static and cannot be changed via client.");
};

export const getApiUrl = (): string | null => {
  return STATIC_API_URL;
};

const callApi = async (action: string, params: Record<string, string> = {}, payload?: any) => {
  const baseUrl = getApiUrl();
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  url.searchParams.append('action', action);
  // Add cache buster to prevent browser caching of GET requests
  url.searchParams.append('_t', Date.now().toString()); 
  
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  try {
    const options: RequestInit = {
      method: payload ? 'POST' : 'GET',
      mode: 'cors',
      // Do NOT set Content-Type header for GAS Web Apps to avoid preflight OPTIONS issues
    };
    
    if (payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url.toString(), options);
    const text = await response.text();
    
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("API returned non-JSON:", text);
        return { success: false, fatal: true, error: 'Cannot connect to database. Check deployment permissions.' };
    }
  } catch (err) {
    console.error(`API Error (${action}):`, err);
    return { success: false, fatal: true, error: 'Network connection failed' };
  }
};

// --- AUTH SERVICES ---

export const setAdminSession = () => {
  localStorage.setItem(ADMIN_SESSION_KEY, 'true');
};

export const checkAdminSession = (): boolean => {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

export const getSessionUser = async (): Promise<User | null> => {
  const sessionJson = localStorage.getItem(SESSION_KEY);
  if (!sessionJson) return null;
  const { username, id } = JSON.parse(sessionJson);
  
  const res = await callApi('getUser', { id });
  return res?.success ? res.user : null;
};

export const loginUser = async (username: string, password?: string): Promise<User> => {
  if (username.toLowerCase() === 'admin') throw new Error("Admin login is handled client-side.");

  // Pass credentials as payload to force a POST request.
  const res = await callApi('login', {}, { 
      username: username.trim(), 
      password: (password || '').trim() 
  });
  
  if (res?.success) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: res.user.username, id: res.user.id }));
    return res.user;
  } else {
    throw new Error(res?.error || 'Login failed');
  }
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const registerUser = async (details: { 
  username: string; 
  name: string; 
  email: string; 
  phone: string; 
  address: string;
  birthDate: string;
  password?: string 
}): Promise<User> => {
  const payload = { ...details, id: `user-${Date.now()}` };
  const res = await callApi('register', {}, payload);
  
  if (res?.success) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: res.user.username, id: res.user.id }));
    return res.user;
  } else {
    throw new Error(res?.error || 'Registration failed');
  }
};

// --- STAMP OPERATIONS ---

export const applyStampToUser = async (userId: string, count: number = 1): Promise<User | null> => {
  let lastUser: User | null = null;
  
  // Loop to add multiple stamps since backend currently supports 1 at a time
  for (let i = 0; i < count; i++) {
    const res = await callApi('addStamp', {}, { userId });
    if (res?.success) {
      lastUser = res.user;
      SYNC_CHANNEL.postMessage({ type: 'DB_UPDATE' });
    } else {
      // If one fails (e.g. max stamps reached), stop and return what we have so far
      break; 
    }
  }
  
  return lastUser;
};

export const fetchUserById = async (userId: string): Promise<User | null> => {
  const res = await callApi('getUser', { id: userId });
  return res?.success ? res.user : null;
};

// --- ADMIN SERVICES ---

export const getAllUsersList = async (): Promise<User[]> => {
  const res = await callApi('getAll');
  return res?.users || [];
};

export const logAdminTransaction = (userId: string, userName: string, type: 'add' | 'redeem', amount: number = 1) => {
  const logs = JSON.parse(localStorage.getItem(ADMIN_LOGS_KEY) || '[]');
  logs.push({
    id: `tx-${Date.now()}`,
    timestamp: Date.now(),
    userId,
    userName,
    type,
    amount
  });
  localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(logs));
};

export const generateTransactionCSV = (): string => {
  const logs = JSON.parse(localStorage.getItem(ADMIN_LOGS_KEY) || '[]');
  if (logs.length === 0) return 'No transactions recorded.';
  
  const headers = ['Date', 'Time', 'Member Name', 'Member ID', 'Action', 'Amount'];
  const rows = logs.map((l: any) => {
    const d = new Date(l.timestamp);
    return [
      d.toLocaleDateString(),
      d.toLocaleTimeString(),
      l.userName,
      l.userId,
      l.type.toUpperCase(),
      l.amount || 1
    ].join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

export const generateMembersCSV = async (): Promise<string> => {
  const users = await getAllUsersList();
  if (users.length === 0) return 'No members registered.';

  const headers = ['Name', 'Username', 'Email', 'Phone', 'Address', 'Birth Date', 'Current Stamps', 'Member ID'];
  const rows = users.map((u: User) => [
    u.name,
    u.username,
    u.email,
    u.phone,
    `"${u.address || ''}"`,
    u.birthDate || '',
    u.stamps,
    u.id
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};

// --- SUBSCRIPTIONS ---

export const subscribeToGlobalUpdates = (callback: () => void) => {
  const handler = (msg: any) => {
    if (msg.data?.type === 'DB_UPDATE') callback();
  };
  SYNC_CHANNEL.addEventListener('message', handler);
  return () => {
    SYNC_CHANNEL.removeEventListener('message', handler);
  };
};