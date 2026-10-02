import axios from 'axios';

/**
 * Axios instance pre-configured for the SkillSync API.
 * - Base URL points to backend (proxied by Vite in dev)
 * - Request interceptor injects JWT token from localStorage
 * - Response interceptor handles 401 → clears token → redirect to login
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillsync_token');
      localStorage.removeItem('skillsync_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
