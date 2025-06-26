import { UserType, TransactionStatus, TransactionType, PayRequestStatus } from "@paynxt/database";

export { UserType, TransactionStatus, TransactionType, PayRequestStatus };

export interface User {
  id: string;
  email: string;
  userType: UserType;
  balance: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  createdAt: Date | string;
  completedAt?: Date | string | null;
  failureReason?: string | null;
  fromUser?: Partial<User>;
  toUser?: Partial<User>;
}

export interface PayRequest {
  id: string;
  merchantId: string;
  consumerId: string;
  amount: number;
  status: PayRequestStatus;
  message?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  merchant?: Partial<User>;
  consumer?: Partial<User>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  userType: UserType;
  iat?: number;
  exp?: number;
}

