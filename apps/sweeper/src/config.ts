import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key}`);
  }
  return value;
}

export const config = {
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "5000", 10),
  batchSize: parseInt(process.env.BATCH_SIZE || "10", 10),
  databaseUrl: requireEnv("DATABASE_URL"),
} as const;

