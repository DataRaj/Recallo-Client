import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

/**
 * Reusable API client instance
 * Configured with base URL and default headers
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor
 * Add auth tokens, modify requests, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  async (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor
 * Handle errors globally, transform responses, etc.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // Handle errors globally
    // if (error.response?.status === 401) {
    //   // Handle unauthorized
    // }
    // if (error.response?.status === 500) {
    //   // Handle server errors
    // }
    return Promise.reject(error);
  },
);

/**
 * Type-safe API client methods
 */
export const api = {
  get: async <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then(response => response.data),

  post: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then(response => response.data),

  put: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then(response => response.data),

  patch: async <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then(response => response.data),

  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then(response => response.data),
};
