import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRY: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().default(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  SUPERADMIN_PHONE: z.string().optional().default(''),
  SUPERADMIN_PASSWORD: z.string().optional().default(''),
  SUPERADMIN_NAME: z.string().default('Super Admin'),
  SUPERADMIN_EMAIL: z.string().email().optional().or(z.literal('')),
});

export const env = envSchema.parse(process.env);


