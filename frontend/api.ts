// ============================================================================
//  CampusGPT — Centralized API Client Architecture
//  Single Source of Truth for Network Requests & Global Interceptors
// ============================================================================

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// CRITICAL: Point directly to '/api' so it routes through our same-domain Vercel rewrite
export const API_BASE: string = import.meta.env.VITE_API_URL || '/api';

/**
 * Centralized Axios instance configuration for JSON transaction payloads
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000, // 30-second boundary threshold guard
});

/**
 * Global Request Interceptor Pipeline
 * Automatically injects the bearer token from local storage into request headers
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Global Response Interceptor Pipeline
 * Automatically captures 401 Unauthorized faults and forces session routing
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // If a token comes back from a successful login or signup response body, store it safely
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error: AxiosError) => {
    // If user token is completely invalid or expired, drop back to gateway onboarding
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

/**
 * Formats data paths cleanly for the native window.fetch stream interfaces
 */
export const streamURL = (path: string): string => {
  // If path already includes /api, don't duplicate it
  const cleanPath = path.startsWith('/api') ? path : `/api${path}`;
  return cleanPath;
};