# DLD — Backend — Module 010: Bike Management
**Layer:** Backend | **Mapped To:** frontend/module_010 | mobile/module_010

## 1. Purpose
Showroom bike catalog management + customer bike registration (personal bikes for service).

## 2. Files
src/modules/bike/: bike.service.ts, bike.repository.ts, bike.validation.ts, bike.types.ts, bike.mapper.ts, tests/

## 3. API Endpoints
| Method | Path                      | Role        | Description                   |
|--------|---------------------------|-------------|-------------------------------|
| GET    | /api/v1/bikes             | Public      | Browse bike catalog           |
| GET    | /api/v1/bikes/:id         | Public      | Bike detail page              |
| POST   | /api/v1/admin/bikes       | ADMIN,MGR   | Add bike to catalog           |
| PATCH  | /api/v1/admin/bikes/:id   | ADMIN,MGR   | Update bike catalog entry     |
| DELETE | /api/v1/admin/bikes/:id   | ADMIN       | Remove from catalog           |
| GET    | /api/v1/me/bikes          | CUSTOMER    | Customer's registered bikes   |
| POST   | /api/v1/me/bikes          | CUSTOMER    | Register a new bike           |
| GET    | /api/v1/me/bikes/:id      | CUSTOMER    | Customer bike detail          |
| PATCH  | /api/v1/me/bikes/:id      | CUSTOMER    | Update bike info              |

## 4. Database Migration: bike_management
```sql
CREATE TABLE "bike_catalog" (
  "id"           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"    UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"  UUID NOT NULL REFERENCES "showrooms"("id"),
  "brand"        TEXT NOT NULL,
  "model"        TEXT NOT NULL,
  "variant"      TEXT,
  "year"         INTEGER,
  "engine_cc"    INTEGER,
  "color"        TEXT,
  "price"        DECIMAL(12,2),
  "images"       TEXT[] DEFAULT '{}',
  "specifications" JSONB DEFAULT '{}',
  "features"     TEXT[] DEFAULT '{}',
  "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "status"       TEXT NOT NULL DEFAULT 'ACTIVE',
  "description"  TEXT,
  "created_at"   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_bike_catalog_tenant"  ON "bike_catalog"("tenant_id");
CREATE INDEX "idx_bike_catalog_showroom" ON "bike_catalog"("showroom_id");

CREATE TABLE "customer_bikes" (
  "id"                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "customer_id"         UUID NOT NULL REFERENCES "customers"("id"),
  "tenant_id"           UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"         UUID REFERENCES "showrooms"("id"),
  "catalog_bike_id"     UUID REFERENCES "bike_catalog"("id"),
  "registration_number" TEXT,
  "brand"               TEXT NOT NULL,
  "model"               TEXT NOT NULL,
  "variant"             TEXT,
  "year"                INTEGER,
  "color"               TEXT,
  "chassis_number"      TEXT,
  "engine_number"       TEXT,
  "purchase_date"       DATE,
  "last_service_date"   DATE,
  "status"              TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at"          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_customer_bikes_customer" ON "customer_bikes"("customer_id");
CREATE INDEX "idx_customer_bikes_tenant"   ON "customer_bikes"("tenant_id");
```

## 5. Business Rules
- Public catalog cached (revalidate 1 hour)
- Customer can register bike not in catalog (manual brand/model)
- Registration number unique per tenant
- Bike catalog search: brand, model, price range, availability

## 6. Testing
- Public catalog accessible without auth
- Customer registers bike -> appears in my-bikes
- Admin adds bike to catalog -> visible in public browse
- Customer cannot access another customer's bike -> 403
---
*Backend DLD | Module 010 | Bike Management*
