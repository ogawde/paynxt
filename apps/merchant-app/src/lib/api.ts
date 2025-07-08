import {
  ApiResponse,
  LoginInput,
  RegisterInput,
  TransferInput,
  CreatePayRequestInput,
} from "@paynxt/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

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

export const userApi = {
  getProfile: () => apiRequest("/api/user/profile"),
  getBalance: () => apiRequest("/api/user/balance"),
};

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

export const payRequestApi = {
  create: (input: CreatePayRequestInput) =>
    apiRequest("/api/pay-requests/create", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getSent: () => apiRequest("/api/pay-requests/sent"),
};

