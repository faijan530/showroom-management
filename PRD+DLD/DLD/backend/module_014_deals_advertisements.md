# DLD — Backend — Module 014: Deals and Advertisements
**Layer:** Backend | **Mapped To:** frontend/module_014 | mobile/module_014

## 1. Purpose
Promotional deals with discount codes and advertisements/banners with impression/click tracking.

## 2. Files
src/modules/deals/: deals.service.ts, deals.repository.ts, deals.validation.ts, tests/

## 3. API Endpoints
| Method | Path                           | Role      | Description                 |
|--------|--------------------------------|-----------|-----------------------------|
| GET    | /api/v1/deals                  | Public    | Active deals                |
| GET    | /api/v1/deals/:id              | Public    | Deal detail                 |
| GET    | /api/v1/deals/validate/:code   | Customer  | Validate promo code         |
| POST   | /api/v1/admin/deals            | ADMIN,MGR | Create deal                 |
| PATCH  | /api/v1/admin/deals/:id        | ADMIN,MGR | Update deal                 |
| DELETE | /api/v1/admin/deals/:id        | ADMIN     | Delete deal                 |
| GET    | /api/v1/advertisements         | Public    | Active ads by placement     |
| POST   | /api/v1/advertisements/:id/click| Public   | Track ad click              |
| POST   | /api/v1/admin/advertisements   | ADMIN,MGR | Create advertisement        |
| PATCH  | /api/v1/admin/advertisements/:id| ADMIN,MGR| Update advertisement        |

## 4. Database Migration: deals_advertisements
```sql
CREATE TABLE "deals" (
  "id"              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"       UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"     UUID REFERENCES "showrooms"("id"),
  "title"           TEXT NOT NULL,
  "description"     TEXT,
  "discount_type"   TEXT NOT NULL DEFAULT 'PERCENTAGE',
  "discount_value"  DECIMAL(10,2) NOT NULL,
  "applicable_to"   TEXT NOT NULL DEFAULT 'ALL',
  "promo_code"      TEXT,
  "image_url"       TEXT,
  "status"          TEXT NOT NULL DEFAULT 'DRAFT',
  "start_date"      TIMESTAMPTZ,
  "end_date"        TIMESTAMPTZ,
  "usage_limit"     INTEGER,
  "usage_count"     INTEGER NOT NULL DEFAULT 0,
  "created_at"      TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX "idx_deals_promo_code_tenant" ON "deals"("promo_code","tenant_id") WHERE "promo_code" IS NOT NULL;

CREATE TABLE "advertisements" (
  "id"           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"    UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"  UUID REFERENCES "showrooms"("id"),
  "title"        TEXT NOT NULL,
  "image_url"    TEXT NOT NULL,
  "target_url"   TEXT,
  "placement"    TEXT NOT NULL DEFAULT 'HOME_BANNER',
  "status"       TEXT NOT NULL DEFAULT 'ACTIVE',
  "start_date"   TIMESTAMPTZ,
  "end_date"     TIMESTAMPTZ,
  "priority"     INTEGER NOT NULL DEFAULT 0,
  "impressions"  INTEGER NOT NULL DEFAULT 0,
  "clicks"       INTEGER NOT NULL DEFAULT 0,
  "created_at"   TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Promo Code Validation
```typescript
async validatePromoCode(code, tenantId, applicableTo):
  1. Find active deal by code + tenantId
  2. Check: status=ACTIVE, not expired, usage_count < usage_limit
  3. Return: { valid, discount_type, discount_value, deal_id }
```

## 6. Business Rules
- Promo code unique per tenant
- usage_count incremented atomically on successful application
- Ad impressions tracked server-side on GET /advertisements
- Deals applicable to: SERVICE | SPARE_PART | BIKE | ALL

## 7. Testing
- Expired promo code -> validation returns invalid
- Used-up promo code (usage_count = usage_limit) -> invalid
- Ad click increments clicks count atomically
---
*Backend DLD | Module 014 | Deals and Advertisements*
