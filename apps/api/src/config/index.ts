
import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) {
    return ["http://localhost:3000", "http://localhost:3002"];
  }
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
  
  databaseUrl: requireEnv("DATABASE_URL"),
} as const;

