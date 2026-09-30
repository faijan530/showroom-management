import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://user:pass@localhost:5432/db'),
  JWT_SECRET: z.string().default('super_secret_jwt_key_that_is_at_least_32_characters_long'),
  JWT_EXPIRY: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  SUPERADMIN_PHONE: z.string().default('9155889133'),
  SUPERADMIN_PASSWORD: z.string().default('SuperAdminPassword'),
  SUPERADMIN_NAME: z.string().default('Super Admin'),
  SUPERADMIN_EMAIL: z.string().email().optional().or(z.literal('')),
});

export const env = envSchema.parse(process.env);

