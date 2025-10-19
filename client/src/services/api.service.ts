// zuperior-dashboard/client/src/services/api.service.ts

import axios from 'axios';

// Get the backend URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';

// Create a configured Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// --- Authentication Service Functions ---
const authService = {

  // 1. User Login
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);
    // The backend should return { token, clientId, user }
    return response.data;
  },

  // 2. User Registration (Signup)
  register: async (userData: any) => {
    const response = await api.post('/register', userData);
    // The backend should return { token, clientId, user }
    return response.data;
  },

  // 3. Helper to store credentials in local storage
  setAuthData: (token: string, clientId: string) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('clientId', clientId);
    console.log('Auth data stored:', { token: token.substring(0, 20) + '...', clientId });
  },

  // 4. Helper to clear session data (Logout)
  clearAuthData: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('clientId');
    localStorage.removeItem('user');
    console.log('Auth data cleared');
  },

  // 7. Logout function
  logout: () => {
    authService.clearAuthData();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // 5. Helper to check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    const clientId = localStorage.getItem('clientId');
    return !!(token && clientId);
  },

  // 6. Helper to get stored auth data
  getAuthData: () => {
    return {
      token: localStorage.getItem('userToken'),
      clientId: localStorage.getItem('clientId')
    };
  }
};

// --- MT5 Service Functions ---
const mt5Service = {
  // Get available MT5 groups
  getMt5Groups: async () => {
    const response = await api.get('/mt5/groups');
    return response.data;
  },

  // Create new MT5 account
  createMt5Account: async (accountData: {
    name: string;
    group: string;
    leverage?: number;
    masterPassword: string;
    investorPassword: string;
    email?: string;
    country?: string;
    city?: string;
    phone?: string;
    comment?: string;
  }) => {
    const response = await api.post('/mt5/create-account', accountData);
    return response.data;
  },

  // Deposit to MT5 account
  depositToMt5: async (data: {
    login: number;
    balance: number;
    comment?: string;
  }) => {
    const response = await api.post('/mt5/deposit', data);
    return response.data;
  },

  // Withdraw from MT5 account
  withdrawFromMt5: async (data: {
    login: number;
    balance: number;
    comment?: string;
  }) => {
    const response = await api.post('/mt5/withdraw', data);
    return response.data;
  },

  // Get MT5 user profile
  getMt5UserProfile: async (login: number) => {
    const response = await api.get(`/mt5/user-profile/${login}`);
    return response.data;
  },

  // Get all MT5 accounts for current user
  getUserMt5Accounts: async () => {
    const response = await api.get('/mt5/user-accounts');
    return response.data;
  }
};

export { authService, api, mt5Service };