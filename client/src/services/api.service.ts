import axios from 'axios';

// Use empty base URL for proxy routes
const API_URL = '';

// Create a configured Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
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
    const response = await api.post('/api/login', {
      email: credentials.email,
      password: credentials.password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // 2. User Registration (Signup)
  register: async (userData: any) => {
    // Split name into first and last name for the form
    const nameParts = userData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('country', userData.country);

    const response = await api.post('/api/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    const response = await api.get('/api/proxy/groups');
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
    console.log("🚀 API Service - Creating MT5 account with data:", accountData);
    console.log("🚀 API Service - Request URL: /api/proxy/users");
    console.log("🚀 API Service - Request method: POST");

    try {
      // Create a direct axios instance for this specific request
      const directApi = axios.create({
        baseURL: '',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      // Format payload according to external API requirements
      const payload = {
        request: "create_mt5_account",
        name: accountData.name,
        group: accountData.group,
        leverage: accountData.leverage || 100,
        masterPassword: accountData.masterPassword,
        investorPassword: accountData.investorPassword,
        email: accountData.email || "",
        country: accountData.country || "",
        city: accountData.city || "",
        phone: accountData.phone || "",
        comment: accountData.comment || "Created from CRM"
      };

      console.log("🚀 API Service - Formatted payload:", payload);

      const response = await directApi.post('/api/proxy/users', payload);
      console.log("🚀 API Service - Response status:", response.status);
      console.log("🚀 API Service - Response data:", response.data);
      console.log("🚀 API Service - Response data type:", typeof response.data);
      console.log("🚀 API Service - Full response:", response);
      return response;
    } catch (error: any) {
      console.error("🚀 API Service - Error:", error);
      console.error("🚀 API Service - Error response:", error.response);
      console.error("🚀 API Service - Error data:", error.response?.data);
      console.error("🚀 API Service - Error status:", error.response?.status);
      throw error;
    }
  },

  // Deposit to MT5 account
  depositToMt5: async (data: {
    login: number;
    balance: number;
    comment?: string;
  }) => {
    const response = await api.post(`/api/proxy/users/${data.login}/balance-adjustment`, {
      type: 'BALANCE',
      amount: data.balance,
      comment: data.comment || 'Deposit'
    });
    return response.data;
  },

  // Withdraw from MT5 account
  withdrawFromMt5: async (data: {
    login: number;
    balance: number;
    comment?: string;
  }) => {
    const response = await api.post(`/api/proxy/users/${data.login}/balance-adjustment`, {
      type: 'BALANCE',
      amount: -data.balance,
      comment: data.comment || 'Withdrawal'
    });
    return response.data;
  },

  // Get MT5 user profile
  getMt5UserProfile: async (login: number) => {
    const response = await api.get(`/api/proxy/users/${login}`);
    return response.data;
  },

  // Get all MT5 accounts for current user
  getUserMt5Accounts: async () => {
    // For .NET Core API, we need to get all users and filter by current user
    // Since we don't have a direct "get my accounts" endpoint, we'll get all users
    // and the frontend will filter them based on authentication
    const response = await api.get('/api/proxy/users');
    return response.data;
  }
};

export { authService, api, mt5Service };