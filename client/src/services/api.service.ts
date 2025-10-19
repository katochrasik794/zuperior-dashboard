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
  },

  // 4. Helper to clear session data (Logout)
  clearAuthData: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('clientId');
  }
};

export { authService, api };