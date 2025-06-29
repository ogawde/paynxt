import dotenv from "dotenv";

dotenv.config();

export const config = {
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "5000", 10),
  batchSize: parseInt(process.env.BATCH_SIZE || "10", 10),
  databaseUrl: process.env.DATABASE_URL,
} as const;

