/**
 * API Client
 * 
 * Centralized HTTP client for communicating with the backend API
 * 
 * Features:
 * - Automatic token attachment from localStorage
 * - Standardized error handling
 * - Type-safe responses using shared types
 */

import {
  ApiResponse,
  LoginInput,
  RegisterInput,
  TransferInput,
  CreatePayRequestInput,
} from "@paynxt/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Get authentication token from localStorage
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Save authentication token to localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

/**
 * Remove authentication token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem("token");
}

/**
 * Make authenticated API request
 * 
 * Flow:
 * 1. Retrieve token from localStorage
 * 2. Set Authorization header if token exists
 * 3. Make fetch request
 * 4. Parse JSON response
 * 5. Check for errors and throw if needed
 * 6. Return data
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Attach token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Handle HTTP errors
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Authentication API
export const authApi = {
  login: (input: LoginInput) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  register: (input: RegisterInput) =>
    apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};

// User API
export const userApi = {
  getProfile: () => apiRequest("/api/user/profile"),
  getBalance: () => apiRequest("/api/user/balance"),
};

// Transaction API
export const transactionApi = {
  transfer: (input: TransferInput) =>
    apiRequest("/api/transactions/transfer", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getHistory: (params?: { limit?: number; offset?: number; status?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/api/transactions/history?${query}`);
  },

  getById: (id: string) => apiRequest(`/api/transactions/${id}`),
};

// Pay Request API
export const payRequestApi = {
  getReceived: () => apiRequest("/api/pay-requests/received"),

  approve: (id: string) =>
    apiRequest(`/api/pay-requests/${id}/approve`, {
      method: "PATCH",
    }),

  reject: (id: string) =>
    apiRequest(`/api/pay-requests/${id}/reject`, {
      method: "PATCH",
    }),
};

