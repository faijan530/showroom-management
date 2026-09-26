# DLD — Backend — Module 001: Platform Foundation
## Showroom Application — Multi-Showroom Vehicle & Service Marketplace

**Layer:** Backend (Next.js)
**Mapped To:**
- Frontend: DLD/frontend/module_001_platform_foundation.md
- Mobile:   DLD/mobile/module_001_platform_foundation.md

---

## 1. Purpose
Establish base technical infrastructure for the Showroom Application backend:
Next.js API route handlers, Prisma ORM, PostgreSQL connection, Zod validation, shared error handling, standard API response wrapper, health check, and logger foundation.

---

## 2. Directory Structure

```
backend/
+-- prisma/
|   +-- schema.prisma
|   +-- migrations/
|       +-- 20260926000000_platform_foundation/
|           +-- migration.sql
+-- src/
|   +-- app/
|   |   +-- api/
|   |       +-- health/
|   |           +-- route.ts
|   +-- config/
|   |   +-- env.ts
|   |   +-- database.ts
|   +-- shared/
|   |   +-- errors/
|   |   |   +-- app.error.ts
|   |   |   +-- not-found.error.ts
|   |   |   +-- validation.error.ts
|   |   |   +-- forbidden.error.ts
|   |   |   +-- unauthorized.error.ts
|   |   +-- response/
|   |       +-- api-response.ts
|   +-- infrastructure/
|   |   +-- prisma/
|   |       +-- prisma.client.ts
|   +-- lib/
|       +-- logger.ts
+-- .env.example
+-- next.config.ts
+-- package.json
+-- tsconfig.json
```

---

## 3. Environment Configuration

### src/config/env.ts
```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default('7d'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

## 4. Prisma Client Singleton

### src/infrastructure/prisma/prisma.client.ts
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 5. Standard Schema Initialization

```sql
-- Create Showrooms Table
CREATE TABLE "showrooms" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "name"          TEXT NOT NULL,
  "code"          TEXT NOT NULL UNIQUE,
  "address"       TEXT NOT NULL,
  "contact_phone" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "logo_url"      TEXT,
  "status"        TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "showrooms_pkey" PRIMARY KEY ("id")
);

-- Create Users Table (5 Roles)
CREATE TYPE "user_role" AS ENUM ('SUPERADMIN', 'ADMIN', 'WORKER', 'INVENTORY_MANAGER', 'USER');

CREATE TABLE "users" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "showroom_id"   UUID,
  "full_name"     TEXT NOT NULL,
  "email"         TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "phone"         TEXT,
  "role"          "user_role" NOT NULL DEFAULT 'USER',
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_showroom_fkey" FOREIGN KEY ("showroom_id") REFERENCES "showrooms"("id") ON DELETE CASCADE
);
```

---

## 6. Health Check Endpoint

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/prisma/prisma.client';

export async function GET() {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  return NextResponse.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: { database: dbStatus },
  });
}
```
