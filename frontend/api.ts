// ============================================================================
//  CampusGPT — Centralized API Client Architecture
//  Single Source of Truth for Network Requests & Global Interceptors
// ============================================================================

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// In development, Vite proxies /api → backend. In production, pulls VITE_API_URL.
export const API_BASE: string = import.meta.env.VITE_API_URL || '';

/**
 * Centralized Axios instance configuration for JSON transaction payloads
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 30000, // 30-second boundary threshold guard
});

/**
 * Global Response Interceptor Pipeline
 * Automatically captures 401 Unauthorized faults and forces session routing
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // If user token is completely invalid or expired, drop back to gateway onboarding
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

/**
 * Formats data paths cleanly for the native window.fetch stream interfaces
 */
export const streamURL = (path: string): string => `${API_BASE}${path}`;
