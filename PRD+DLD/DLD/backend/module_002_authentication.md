# DLD — Backend — Module 002: Authentication
**Layer:** Backend (Next.js)
**Mapped To:**
- Frontend: DLD/frontend/module_002_authentication.md
- Mobile:   DLD/mobile/module_002_authentication.md

---

## 1. Purpose
Secure multi-role authentication: Customer self-register, Worker invitation-only,
Admin login, Super Admin isolated login. JWT with refresh token rotation, HttpOnly cookies.

---

## 2. Files

```
src/modules/auth/
  auth.service.ts
  auth.repository.ts
  auth.validation.ts
  auth.types.ts
  token.service.ts
  password.service.ts
  tests/
    auth.service.test.ts
    auth.integration.test.ts
```

---

## 3. API Endpoints

| Method | Path                          | Auth     | Role      | Description              |
|--------|-------------------------------|----------|-----------|--------------------------|
| POST   | /api/v1/auth/register         | None     | Public    | Customer self-register   |
| POST   | /api/v1/auth/login            | None     | All roles | Login                    |
| POST   | /api/v1/auth/logout           | Required | All roles | Logout + revoke token    |
| POST   | /api/v1/auth/forgot-password  | None     | Public    | Send reset email         |
| POST   | /api/v1/auth/reset-password   | None     | Public    | Reset password via token |
| POST   | /api/v1/auth/refresh-token    | None     | All roles | Rotate refresh token     |
| GET    | /api/v1/auth/me               | Required | All roles | Get current user profile |
| POST   | /api/v1/auth/worker/setup     | None     | Public    | Worker sets password     |
| POST   | /api/superadmin/v1/auth/login | None     | Super     | Super Admin login only   |

---

## 4. Database Migration: authentication

```sql
CREATE TABLE "users" (
  "id"            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"     UUID REFERENCES "tenants"("id") ON DELETE CASCADE,
  "showroom_id"   UUID REFERENCES "showrooms"("id") ON DELETE SET NULL,
  "email"         TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role"          TEXT NOT NULL,
  "status"        TEXT NOT NULL DEFAULT 'ACTIVE',
  "first_name"    TEXT,
  "last_name"     TEXT,
  "created_at"    TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("email", "tenant_id")
);

CREATE TABLE "refresh_tokens" (
  "id"         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked"    BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "password_reset_tokens" (
  "id"         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used"       BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "worker_invitations" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "worker_id"   UUID NOT NULL,
  "token_hash"  TEXT NOT NULL,
  "expires_at"  TIMESTAMPTZ NOT NULL,
  "used"        BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX "idx_users_tenant_id"       ON "users"("tenant_id");
CREATE INDEX "idx_users_email"           ON "users"("email");
CREATE INDEX "idx_refresh_tokens_user"   ON "refresh_tokens"("user_id");
```

---

## 5. Zod Validation Schemas (auth.validation.ts)

```typescript
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(10).max(15).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const workerSetupSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});
```

---

## 6. Token Strategy

| Token         | Expiry | Storage (Web)   | Storage (Mobile)  |
|---------------|--------|-----------------|-------------------|
| Access Token  | 15min  | HttpOnly Cookie | Expo SecureStore  |
| Refresh Token | 7 days | HttpOnly Cookie | Expo SecureStore  |

Cookie Flags: HttpOnly=true, Secure=true, SameSite=Strict, Path=/

---

## 7. Auth Service (auth.service.ts) — Key Methods

```typescript
login(email, password, role?) -> { user, accessToken, refreshToken }
register(data) -> { user }
logout(userId, refreshToken) -> void
forgotPassword(email) -> void  (sends email, never reveals if user exists)
resetPassword(token, newPassword) -> void
refreshTokens(refreshToken) -> { accessToken, newRefreshToken }
workerSetup(token, password) -> void
```

---

## 8. Rate Limiting

| Endpoint             | Limit          | Window  |
|----------------------|----------------|---------|
| /auth/login          | 5 attempts     | 15 min  |
| /auth/register       | 3 attempts     | 1 hour  |
| /auth/forgot-password| 3 attempts     | 1 hour  |
| /auth/reset-password | 5 attempts     | 1 hour  |

---

## 9. Security Rules
- bcrypt cost factor: >= 12
- forgotPassword always returns 200 (never reveals if email exists)
- Reset tokens expire in 1 hour, single-use
- Refresh token stored as bcrypt hash in DB
- Super Admin JWT uses separate secret (SUPER_ADMIN_JWT_SECRET)

---

## 10. Testing

| Test          | Scenario                                                |
|---------------|---------------------------------------------------------|
| Unit          | password.service: hash and compare                      |
| Unit          | token.service: sign, verify, decode                     |
| Integration   | POST /auth/register -> creates user, returns 201        |
| Integration   | POST /auth/login -> sets HttpOnly cookies               |
| Integration   | POST /auth/login wrong password -> 401                  |
| Integration   | POST /auth/logout -> revokes refresh token              |
| Integration   | POST /auth/refresh-token -> rotates tokens              |
| Integration   | Brute force: 6th login attempt -> 429                   |

---

## 11. Cross-Layer API Contract

Frontend expects from login response:
  - HTTP 200 with cookies set (no tokens in body)
  - Body: { success: true, data: { user: { id, email, role, firstName } } }

Mobile expects from login response:
  - HTTP 200 with Bearer token in body (for SecureStore storage)
  - Body: { success: true, data: { user, accessToken, refreshToken } }

---
*Backend DLD | Module 002 | Authentication*
