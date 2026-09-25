# DLD — Backend — Module 019: Subscription Management
**Layer:** Backend | **Mapped To:** frontend/module_019 | mobile/module_019

## 1. Purpose
SaaS subscription plans, tenant billing cycles, trial management, feature gating.

## 2. Files
src/modules/subscription/: subscription.service.ts, subscription.repository.ts, tests/

## 3. API Endpoints
| Method | Path                                   | Role       | Description             |
|--------|----------------------------------------|------------|-------------------------|
| GET    | /api/v1/subscription                   | OWNER      | My subscription detail  |
| GET    | /api/v1/subscription/plans             | Public     | Available plans         |
| GET    | /api/superadmin/v1/subscriptions       | SUPER_ADMIN| All subscriptions       |
| POST   | /api/superadmin/v1/subscriptions/:id/upgrade| SUPER_ADMIN| Upgrade tenant plan |
| POST   | /api/superadmin/v1/subscriptions/:id/cancel | SUPER_ADMIN| Cancel subscription |

## 4. Database Migration: subscription_management
```sql
CREATE TABLE "subscription_plans" (
  "id"               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name"             TEXT NOT NULL,
  "description"      TEXT,
  "price"            DECIMAL(10,2) NOT NULL,
  "billing_cycle"    TEXT NOT NULL DEFAULT 'MONTHLY',
  "max_showrooms"    INTEGER NOT NULL DEFAULT 1,
  "max_workers"      INTEGER NOT NULL DEFAULT 10,
  "max_customers"    INTEGER,
  "features"         JSONB NOT NULL DEFAULT '{}',
  "status"           TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at"       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "tenant_subscriptions" (
  "id"           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"    UUID NOT NULL UNIQUE REFERENCES "tenants"("id"),
  "plan_id"      UUID NOT NULL REFERENCES "subscription_plans"("id"),
  "status"       TEXT NOT NULL DEFAULT 'TRIAL',
  "start_date"   DATE NOT NULL,
  "end_date"     DATE,
  "trial_ends_at" DATE,
  "auto_renew"   BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"   TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Subscription Lifecycle
```
TRIAL (14 days) -> ACTIVE (paid) -> PAST_DUE -> SUSPENDED -> CANCELLED
                     |___________________________^
                     grace period: 7 days after expiry
```

## 6. Feature Gating Middleware
```typescript
async function checkFeatureFlag(tenantId: string, flag: string): Promise<void> {
  const flags = await featureFlagRepo.getByTenantId(tenantId);
  if (!flags[flag]) throw new ForbiddenError('FEATURE_DISABLED',
    'This feature is not enabled for your plan.');
}
```

## 7. Business Rules
- Trial period: 14 days (configurable by Super Admin)
- Grace period: 7 days after subscription end_date before suspension
- Super Admin can override subscription status manually
- Suspended tenant: all API requests return 403 (TENANT_SUSPENDED)

## 8. Testing
- Tenant in TRIAL can access all features
- Tenant SUSPENDED gets 403 on all API requests
- Feature flag disabled -> 403 with FEATURE_DISABLED code
- Subscription expiry grace period logic
---
*Backend DLD | Module 019 | Subscription Management*
