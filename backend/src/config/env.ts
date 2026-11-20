import dotenv from 'dotenv';
import path from 'path';

// Load .env if present
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/doomsday_ready?schema=public',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  STORAGE_MODE: process.env.STORAGE_MODE || 'auto', // 'auto', 'prisma', or 'memory'
};
