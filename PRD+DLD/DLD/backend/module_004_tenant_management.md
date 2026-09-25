# DLD — Backend — Module 004: Tenant Management
**Layer:** Backend (Next.js)
**Mapped To:**
- Frontend: DLD/frontend/module_004_tenant_management.md
- Mobile:   DLD/mobile/module_004_tenant_management.md

---

## 1. Purpose
Manage showroom businesses (tenants) on the platform. Each tenant represents
one showroom business that can own multiple showrooms.

---

## 2. Files
```
src/modules/tenant/
  tenant.service.ts
  tenant.repository.ts
  tenant.validation.ts
  tenant.types.ts
  tenant.mapper.ts
  tests/
```

---

## 3. Database Migration: tenant_management

```sql
ALTER TABLE "tenants" ADD COLUMN "email"     TEXT;
ALTER TABLE "tenants" ADD COLUMN "phone"     TEXT;
ALTER TABLE "tenants" ADD COLUMN "address"   TEXT;
ALTER TABLE "tenants" ADD COLUMN "logo_url"  TEXT;
ALTER TABLE "tenants" ADD COLUMN "plan_id"   UUID;
ALTER TABLE "tenants" ADD COLUMN "trial_ends_at" TIMESTAMPTZ;

CREATE TABLE "tenant_settings" (
  "id"        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id" UUID NOT NULL UNIQUE REFERENCES "tenants"("id"),
  "timezone"  TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  "currency"  TEXT NOT NULL DEFAULT 'INR',
  "tax_label" TEXT NOT NULL DEFAULT 'GST',
  "tax_rate"  DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "feature_flags" (
  "id"                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"            UUID NOT NULL UNIQUE REFERENCES "tenants"("id"),
  "enable_mobile_app"    BOOLEAN NOT NULL DEFAULT TRUE,
  "enable_finance"       BOOLEAN NOT NULL DEFAULT TRUE,
  "enable_reports"       BOOLEAN NOT NULL DEFAULT TRUE,
  "enable_deals"         BOOLEAN NOT NULL DEFAULT TRUE,
  "max_showrooms"        INTEGER NOT NULL DEFAULT 1,
  "max_workers"          INTEGER NOT NULL DEFAULT 10,
  "updated_at"           TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Tenant Lifecycle States

```
TRIAL -> ACTIVE -> SUSPENDED -> CANCELLED
  |                    ^
  +--------------------+  (reactivation by Super Admin)
```

---

## 5. Tenant Service Key Methods

```typescript
createTenant(data: CreateTenantInput): Promise<TenantDTO>
getTenantById(id: string): Promise<TenantDTO>
updateTenant(id: string, data: UpdateTenantInput): Promise<TenantDTO>
suspendTenant(id: string, reason: string): Promise<void>
reactivateTenant(id: string): Promise<void>
getTenantSettings(tenantId: string): Promise<TenantSettings>
updateTenantSettings(tenantId: string, data): Promise<TenantSettings>
```

---

## 6. Tenant Context Validation Middleware

```typescript
// Called in every showroom-level route
async function getTenantContext(request: NextRequest): Promise<TenantContext> {
  const payload = verifyAccessToken(request);
  const tenant = await tenantRepo.findById(payload.tenantId);
  if (!tenant) throw new NotFoundError('TENANT_NOT_FOUND', 'Tenant not found');
  if (tenant.status === 'SUSPENDED') throw new ForbiddenError('TENANT_SUSPENDED', 'Account suspended');
  if (tenant.status === 'CANCELLED') throw new ForbiddenError('TENANT_CANCELLED', 'Account cancelled');
  return { tenantId: tenant.id, userId: payload.userId, role: payload.role, showroomId: payload.showroomId };
}
```

---

## 7. Testing

| Test        | Scenario                                     |
|-------------|----------------------------------------------|
| Integration | Suspended tenant gets 403 on any API call    |
| Integration | Cancelled tenant gets 403 on any API call    |
| Integration | Active tenant can access APIs normally       |
| Unit        | createTenant sets TRIAL status by default    |

---
*Backend DLD | Module 004 | Tenant Management*
