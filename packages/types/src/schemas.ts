import { z } from "zod";
import { UserType, TransactionType, PayRequestStatus } from "@paynxt/database";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
  userType: z.nativeEnum(UserType, {
    message: "User type must be CONSUMER or MERCHANT",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const transferSchema = z.object({
  toEmail: z.string().email("Invalid recipient email"),
  amount: z
    .number()
    .int("Amount must be an integer (cents)")
    .positive("Amount must be greater than 0")
    .max(1000000000, "Amount too large"),
});

export type TransferInput = z.infer<typeof transferSchema>;

export const createPayRequestSchema = z.object({
  consumerEmail: z.string().email("Invalid consumer email"),
  amount: z
    .number()
    .int("Amount must be an integer (cents)")
    .positive("Amount must be greater than 0")
    .max(1000000000, "Amount too large"),
  message: z.string().max(500, "Message too long").optional(),
});

export type CreatePayRequestInput = z.infer<typeof createPayRequestSchema>;

export const payRequestActionSchema = z.object({
  action: z.enum(["approve", "reject"], {
    message: "Action must be 'approve' or 'reject'",
  }),
});

export type PayRequestActionInput = z.infer<typeof payRequestActionSchema>;

export const transactionQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  status: z.string().optional(),
});

export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
