
import { User, Transaction, PayRequest } from "./models";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}


export interface AuthResponse {
  user: User;
  token: string;  
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}



export interface UserProfileResponse {
  user: User;
}

export interface UserBalanceResponse {
  balance: number; 
  formattedBalance: string;  
}


export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface TransactionDetailResponse {
  transaction: Transaction;
}

export interface CreateTransactionResponse {
  transaction: Transaction;
  message: string;
}

export interface PayRequestListResponse {
  payRequests: PayRequest[];
  total: number;
}

export interface PayRequestDetailResponse {
  payRequest: PayRequest;
}

export interface CreatePayRequestResponse {
  payRequest: PayRequest;
  message: string;
}

export interface PayRequestActionResponse {
  payRequest: PayRequest;
  transaction?: Transaction; 
  message: string;
}


export interface ErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
  details?: unknown;
}

