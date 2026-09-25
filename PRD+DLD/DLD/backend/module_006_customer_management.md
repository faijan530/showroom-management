# DLD — Backend — Module 006: Customer Management
**Layer:** Backend | **Mapped To:** frontend/module_006 | mobile/module_006

## 1. Purpose
Full CRM: Customer self-registration, profile management, service history, admin CRM view.

## 2. Files
src/modules/customer/: customer.service.ts, customer.repository.ts, customer.validation.ts, customer.types.ts, customer.mapper.ts, tests/

## 3. API Endpoints
| Method | Path                          | Role              | Description              |
|--------|-------------------------------|-------------------|--------------------------|
| GET    | /api/v1/customers             | ADMIN,MGR         | List + search customers  |
| GET    | /api/v1/customers/:id         | ADMIN,MGR         | Customer detail          |
| PATCH  | /api/v1/customers/:id         | ADMIN             | Update customer          |
| POST   | /api/v1/customers/:id/block   | ADMIN             | Block customer           |
| GET    | /api/v1/customers/:id/services| ADMIN,MGR         | Customer service history |
| GET    | /api/v1/me/profile            | CUSTOMER          | Own profile              |
| PATCH  | /api/v1/me/profile            | CUSTOMER          | Update own profile       |
| GET    | /api/v1/me/bikes              | CUSTOMER          | Own bikes list           |
| GET    | /api/v1/me/services           | CUSTOMER          | Own service history      |

## 4. Database Migration: customer_management
```sql
CREATE TABLE "customers" (
  "id"            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"     UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"   UUID REFERENCES "showrooms"("id"),
  "user_id"       UUID NOT NULL UNIQUE REFERENCES "users"("id"),
  "first_name"    TEXT NOT NULL,
  "last_name"     TEXT NOT NULL,
  "email"         TEXT NOT NULL,
  "phone"         TEXT,
  "address"       TEXT,
  "date_of_birth" DATE,
  "photo_url"     TEXT,
  "status"        TEXT NOT NULL DEFAULT 'ACTIVE',
  "tags"          TEXT[],
  "notes"         TEXT,
  "created_at"    TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_customers_tenant_id"   ON "customers"("tenant_id");
CREATE INDEX "idx_customers_showroom_id" ON "customers"("showroom_id");
CREATE INDEX "idx_customers_user_id"     ON "customers"("user_id");
CREATE INDEX "idx_customers_email"       ON "customers"("email", "tenant_id");
```

## 5. Search / Pagination
GET /api/v1/customers?search=john&page=1&limit=20&status=ACTIVE
Search: firstName, lastName, email, phone (server-side, indexed, ILIKE)

## 6. Business Rules
- Customer always scoped to tenantId
- Customer can only view own data (me/ routes)
- Admin can block/unblock customers
- Blocked customer: auth succeeds but service requests rejected

## 7. Testing
- Customer cannot access another customer profile -> 403
- Admin can search customers by name/email
- Blocked customer submits service request -> 403
---
*Backend DLD | Module 006 | Customer Management*
