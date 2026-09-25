# DLD — Backend — Module 005: Showroom Management
**Layer:** Backend | **Mapped To:** frontend/module_005 | mobile/module_005

## 1. Purpose
Manage individual showrooms within a tenant. A tenant can have 1 or many showrooms.

## 2. Files
src/modules/showroom-management/: showroom.service.ts, showroom.repository.ts, showroom.validation.ts, showroom.types.ts, showroom.mapper.ts, tests/

## 3. API Endpoints
| Method | Path                        | Role              | Description         |
|--------|-----------------------------|-------------------|---------------------|
| GET    | /api/v1/showrooms           | OWNER,ADMIN       | List showrooms      |
| POST   | /api/v1/showrooms           | OWNER             | Create showroom     |
| GET    | /api/v1/showrooms/:id       | OWNER,ADMIN,MGR   | Get showroom detail |
| PATCH  | /api/v1/showrooms/:id       | OWNER,ADMIN       | Update showroom     |
| DELETE | /api/v1/showrooms/:id       | OWNER             | Delete showroom     |
| GET    | /api/v1/showrooms/:id/users | OWNER,ADMIN       | List showroom users |
| GET    | /api/v1/showrooms/:id/workers| OWNER,ADMIN,MGR  | List workers        |
| GET    | /api/v1/showrooms/public    | None              | Public showroom info|

## 4. Database Migration: showroom_management
```sql
ALTER TABLE "showrooms" ADD COLUMN "code"         TEXT;
ALTER TABLE "showrooms" ADD COLUMN "address"       TEXT;
ALTER TABLE "showrooms" ADD COLUMN "city"          TEXT;
ALTER TABLE "showrooms" ADD COLUMN "state"         TEXT;
ALTER TABLE "showrooms" ADD COLUMN "pincode"       TEXT;
ALTER TABLE "showrooms" ADD COLUMN "phone"         TEXT;
ALTER TABLE "showrooms" ADD COLUMN "email"         TEXT;
ALTER TABLE "showrooms" ADD COLUMN "latitude"      DECIMAL(10,7);
ALTER TABLE "showrooms" ADD COLUMN "longitude"     DECIMAL(10,7);
ALTER TABLE "showrooms" ADD COLUMN "logo_url"      TEXT;
ALTER TABLE "showrooms" ADD COLUMN "operating_hours" JSONB;
CREATE UNIQUE INDEX "idx_showrooms_code_tenant" ON "showrooms"("code","tenant_id");
```

## 5. Business Rules
- Code is unique per tenant (e.g., SH001, SH002)
- Max showrooms enforced by feature_flags.max_showrooms
- Deleting a showroom requires no active service requests
- Public showroom info (name, address, phone, hours) requires no auth

## 6. Validation (Zod)
name: string min 2, code: alphanumeric max 10, phone: valid, operatingHours: JSON with day keys

## 7. Testing
- Create showroom exceeding tenant limit -> 403
- Showroom code duplicate -> 409
- Public info accessible without auth -> 200
---
*Backend DLD | Module 005 | Showroom Management*
