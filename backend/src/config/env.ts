import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  SUPERADMIN_PHONE: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian phone number'),
  SUPERADMIN_PASSWORD: z.string().min(6),
  SUPERADMIN_NAME: z.string().min(1),
  SUPERADMIN_EMAIL: z.string().email().optional().or(z.literal('')),
});

export const env = envSchema.parse(process.env);
