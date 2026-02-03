import { User, StampEvent } from '../types';

/**
 * GOOGLE SHEETS / LOCAL STORAGE HYBRID LAYER
 */

const SESSION_KEY = 'stamplink_current_session_v4';
const ADMIN_SESSION_KEY = 'stamplink_admin_authenticated_v4';
const ADMIN_LOGS_KEY = 'stamplink_admin_history_v4';
const SYNC_CHANNEL = new BroadcastChannel('stamplink_global_sync');

// --- STATIC CONFIGURATION ---
const STATIC_API_URL = 'https://script.google.com/macros/s/AKfycbwJUABZ9PsGEv91FjlB33kOAsYsMm6oz77isOwtvw2JQQNSpvtwkBdby2EzyZgB7qcmVg/exec';

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
  const { phone, id } = JSON.parse(sessionJson);


  const res = await callApi('getUser', { id });
  return res?.success ? res.user : null;
};

// Normalize phone number to handle various formats (for matching/login)
// Database stores as: 6287783856480 (no + sign)
// Examples: 
// - "0877 8323 5189" -> "6287783235189"
// - "+62 877-8323-5189" -> "6287783235189"
// - "62877 8323 5189" -> "6287783235189"
// - "6287783235189" -> "6287783235189"
const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // Convert 0-prefix to 62
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.substring(1);
  }

  // If it doesn't start with a country code and is long enough, prepend 62
  if (!normalized.startsWith('62') && !normalized.startsWith('1') && !normalized.startsWith('44') && normalized.length >= 8) {
    normalized = '62' + normalized;
  }

  return normalized;
};

// Standardize phone number to clean CountryCodeDigits format for storage (no + sign)
// Examples:
// - "0877 8323 5189" -> "6287783235189"
// - "62 877 8323 5189" -> "6287783235189"
// - "+62 877-8323-5189" -> "6287783235189"
// - "6287783235189" -> "6287783235189" (already clean)
const standardizePhone = (phone: string): string => {
  // Remove all non-digit characters (including +)
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, convert to 62
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.substring(1);
  }

  // If already starts with country code, return as is
  if (cleaned.length >= 10) {
    return cleaned;
  }

  // If it's a short local number, prepend 62
  if (cleaned.length >= 8) {
    return '62' + cleaned;
  }

  return cleaned;
};

export const loginUser = async (phone: string, birthDate: string): Promise<User> => {
  // Admin check - if phone field contains 'admin', treat as admin login
  if (phone.toLowerCase().includes('admin')) {
    throw new Error("Admin login is handled client-side.");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  // Debug: Log what we're sending
  console.log('=== LOGIN DEBUG ===');
  console.log('Phone (raw):', phone);
  console.log('Phone (normalized):', normalizedPhone);
  console.log('BirthDate (raw):', birthDate);

  // Send phone as 'username' and birthDate as 'password' to match backend expectations
  // The backend will look up the user by phone number in the spreadsheet
  const res = await callApi('login', {}, {
    username: normalizedPhone.trim(),  // Backend expects 'username' field
    password: birthDate.trim()  // Backend expects 'password' field
  });

  console.log('API Response:', res);

  if (res?.success) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ phone: res.user.phone, id: res.user.id }));
    return res.user;
  } else {
    throw new Error(res?.error || 'Login failed. Please check your phone number and birth date.');
  }
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const registerUser = async (details: {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
}): Promise<User> => {
  // Standardize phone number to +62 format before registration
  const standardizedPhone = standardizePhone(details.phone);
  const payload = { ...details, phone: standardizedPhone, id: `user-${Date.now()}` };
  const res = await callApi('register', {}, payload);

  if (res?.success) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ phone: res.user.phone, id: res.user.id }));
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