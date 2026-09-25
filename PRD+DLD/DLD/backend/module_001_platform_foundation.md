# DLD — Backend — Module 001: Platform Foundation
## Showroom Management + Bike Service Management SaaS

**Layer:** Backend (Next.js)
**Mapped To:**
- Frontend: DLD/frontend/module_001_platform_foundation.md
- Mobile:   DLD/mobile/module_001_platform_foundation.md

---

## 1. Purpose
Establish the base technical infrastructure for the entire backend:
Turborepo setup, Next.js backend app, Prisma, PostgreSQL connection,
shared error handling, API response format, health check, and logging foundation.

---

## 2. Directory Structure

```
backend/
+-- prisma/
|   +-- schema.prisma
|   +-- migrations/
|       +-- 20260925090000_platform_foundation/
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
|   |   |   +-- conflict.error.ts
|   |   +-- response/
|   |       +-- api-response.ts
|   |       +-- pagination.ts
|   +-- infrastructure/
|   |   +-- prisma/
|   |       +-- prisma.client.ts
|   +-- lib/
|       +-- logger.ts
|       +-- crypto.ts
|       +-- date.ts
+-- .env.example
+-- next.config.ts
+-- package.json
+-- tsconfig.json
```

---

## 3. Environment Configuration

### src/config/env.ts
Validates all environment variables at startup using Zod.
If any required variable is missing, the app fails to start.

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  SUPER_ADMIN_JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  EMAIL_FROM: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
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

## 5. Base Error Classes

### src/shared/errors/app.error.ts
```typescript
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

Derived errors:
- NotFoundError(code, message)       -> statusCode: 404
- ValidationError(code, details)     -> statusCode: 422
- UnauthorizedError(code, message)   -> statusCode: 401
- ForbiddenError(code, message)      -> statusCode: 403
- ConflictError(code, message)       -> statusCode: 409

---

## 6. API Response Builder

### src/shared/response/api-response.ts
```typescript
import { NextResponse } from 'next/server';

export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }

  static created<T>(data: T) {
    return NextResponse.json({ success: true, data }, { status: 201 });
  }

  static paginated<T>(data: T[], pagination: PaginationMeta) {
    return NextResponse.json({ success: true, data, pagination }, { status: 200 });
  }

  static error(error: AppError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }

  static internalError() {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}
```

---

## 7. Health Check Route

### src/app/api/health/route.ts
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/prisma/prisma.client';

export async function GET() {
  let dbStatus = 'ok';
  try {
    await prisma.SELECT 1;
  } catch {
    dbStatus = 'error';
  }

  return NextResponse.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: { database: dbStatus },
    version: process.env.npm_package_version ?? '1.0.0',
  });
}
```

---

## 8. First Prisma Migration

### prisma/migrations/20260925090000_platform_foundation/migration.sql
```sql
-- Create tenants table (skeleton)
CREATE TABLE "tenants" (
  "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
  "name"       TEXT NOT NULL,
  "slug"       TEXT NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'TRIAL',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tenants_slug_key" UNIQUE ("slug")
);

-- Create showrooms table (skeleton)
CREATE TABLE "showrooms" (
  "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id"  UUID NOT NULL,
  "name"       TEXT NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "showrooms_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "showrooms_tenant_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_showrooms_tenant_id" ON "showrooms"("tenant_id");
```

---

## 9. Logger

### src/lib/logger.ts
```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  // Never log passwords, tokens, secrets
  console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
}

export const logger = {
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  info:  (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};
```

---

## 10. API: Endpoints Provided by This Module

| Method | Path          | Auth | Description          |
|--------|---------------|------|----------------------|
| GET    | /api/health   | None | Platform health check|
| GET    | /api/v1/version| None| API version info     |

---

## 11. Cross-Layer Mapping

| Layer    | Consumes From This Module                              |
|----------|--------------------------------------------------------|
| Frontend | Calls GET /api/health to show system status on admin   |
| Mobile   | Calls GET /api/health on app startup to check API      |

---

## 12. Testing

| Test Type   | What to Test                                         |
|-------------|------------------------------------------------------|
| Unit        | ApiResponse builder output shapes                    |
| Unit        | AppError subclasses (code, statusCode, message)      |
| Unit        | env.ts throws on missing required vars               |
| Integration | GET /api/health returns 200 with database: ok        |
| Integration | GET /api/health returns degraded when DB unreachable |

---

## 13. Security Notes
- No auth required for /api/health
- Never expose stack traces in API responses
- env.ts validates secrets exist at startup
- Prisma singleton prevents connection pool exhaustion

---
*Backend DLD | Module 001 | Platform Foundation*
