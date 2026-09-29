import { env } from './env';

export const databaseConfig = {
  url: env.DATABASE_URL,
  maxConnections: 10,
  idleTimeoutMs: 30000,
};
