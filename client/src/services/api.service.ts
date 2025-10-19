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
    return response.data;
  },

  // 2. User Registration (Signup)
  register: async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // 3. Store credentials
  setAuthData: (token: string, clientId: string) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('clientId', clientId);
    console.log('Auth data stored:', { token: token.substring(0, 20) + '...', clientId });
  },

  // 4. Clear session data
  clearAuthData: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('clientId');
    localStorage.removeItem('user');
    console.log('Auth data cleared');
  },

  // 5. Check authentication
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    const clientId = localStorage.getItem('clientId');
    return !!(token && clientId);
  },

  // 6. Get stored auth data
  getAuthData: () => {
    return {
      token: localStorage.getItem('userToken'),
      clientId: localStorage.getItem('clientId')
    };
  },

  // 7. Logout
  logout: () => {
    authService.clearAuthData();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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
    const response = await api.post('/Users', accountData);
    return response.data;
  },

  // Deposit to MT5 account
  depositToMt5: async (data: {
    login: number;
    balance: number;
    comment?: string;
  }) => {
    const response = await api.post(`/Users/${data.login}/AddClientBalance`, data);
    return response.data;
  },

  // Withdraw from MT5 account
  withdrawFromMt5: async (data: {
    login: number;
    balance: number;
    comment?: string;
  }) => {
    const response = await api.post(`/Users/${data.login}/DeductClientBalance`, data);
    return response.data;
  },

  // Get MT5 user profile
  getMt5UserProfile: async (login: number) => {
    const response = await api.get(`/Users/${login}/getClientProfile`);
    return response.data;
  },

  // Get all MT5 accounts for current user
  getUserMt5Accounts: async () => {
    const response = await api.get('/mt5/user-accounts');
    return response.data;
  }
};

export { authService, api, mt5Service };