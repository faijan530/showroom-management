# DLD — Backend — Module 008: Service Management
**Layer:** Backend | **Mapped To:** frontend/module_008 | mobile/module_008

## 1. Purpose
Service catalog management + full service request lifecycle with controlled status machine.

## 2. Files
src/modules/service/: service.service.ts, service.repository.ts, service.validation.ts, service.types.ts, service.mapper.ts, tests/
src/modules/service-request/: service-request.service.ts, service-request.repository.ts, service-request.status-machine.ts, service-request.mapper.ts, tests/

## 3. API Endpoints
| Method | Path                                  | Role              | Description                |
|--------|---------------------------------------|-------------------|----------------------------|
| GET    | /api/v1/services                      | Public            | Browse service catalog     |
| GET    | /api/v1/services/:id                  | Public            | Service detail             |
| POST   | /api/v1/admin/services                | ADMIN,MGR         | Create service             |
| PATCH  | /api/v1/admin/services/:id            | ADMIN,MGR         | Update service             |
| DELETE | /api/v1/admin/services/:id            | ADMIN             | Remove service             |
| GET    | /api/v1/service-requests              | ADMIN,MGR         | List all requests          |
| POST   | /api/v1/service-requests              | CUSTOMER          | Create service request     |
| GET    | /api/v1/service-requests/:id          | ADMIN,MGR,CUSTOMER| Get request detail         |
| PATCH  | /api/v1/service-requests/:id/status   | ADMIN,MGR         | Update status (controlled) |
| GET    | /api/v1/me/service-requests           | CUSTOMER          | Customer's own requests    |
| GET    | /api/v1/workers/me/tasks              | WORKER            | Worker's assigned tasks    |
| PATCH  | /api/v1/workers/me/tasks/:id          | WORKER            | Worker updates task        |

## 4. Database Migration: service_management
```sql
CREATE TABLE "service_catalog" (
  "id"                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"          UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"        UUID NOT NULL REFERENCES "showrooms"("id"),
  "name"               TEXT NOT NULL,
  "description"        TEXT,
  "category"           TEXT NOT NULL,
  "estimated_duration" INTEGER NOT NULL DEFAULT 60,
  "price"              DECIMAL(10,2) NOT NULL DEFAULT 0,
  "price_type"         TEXT NOT NULL DEFAULT 'FIXED',
  "images"             TEXT[] DEFAULT '{}',
  "status"             TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at"         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "service_requests" (
  "id"                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"             UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"           UUID NOT NULL REFERENCES "showrooms"("id"),
  "customer_id"           UUID NOT NULL REFERENCES "customers"("id"),
  "bike_id"               UUID NOT NULL REFERENCES "customer_bikes"("id"),
  "service_id"            UUID REFERENCES "service_catalog"("id"),
  "worker_id"             UUID REFERENCES "workers"("id"),
  "status"                TEXT NOT NULL DEFAULT 'REQUESTED',
  "issue_description"     TEXT,
  "preferred_date"        DATE,
  "preferred_time_slot"   TEXT,
  "scheduled_at"          TIMESTAMPTZ,
  "estimated_completion"  TIMESTAMPTZ,
  "actual_start"          TIMESTAMPTZ,
  "actual_completion"     TIMESTAMPTZ,
  "internal_notes"        TEXT,
  "admin_notes"           TEXT,
  "total_amount"          DECIMAL(10,2),
  "created_at"            TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"            TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_sr_tenant_id"     ON "service_requests"("tenant_id");
CREATE INDEX "idx_sr_showroom_id"   ON "service_requests"("showroom_id");
CREATE INDEX "idx_sr_customer_id"   ON "service_requests"("customer_id");
CREATE INDEX "idx_sr_worker_id"     ON "service_requests"("worker_id");
CREATE INDEX "idx_sr_status"        ON "service_requests"("status");
CREATE INDEX "idx_sr_scheduled_at"  ON "service_requests"("scheduled_at");

CREATE TABLE "service_request_status_history" (
  "id"                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "service_request_id" UUID NOT NULL REFERENCES "service_requests"("id"),
  "from_status"        TEXT,
  "to_status"          TEXT NOT NULL,
  "actor_id"           UUID,
  "actor_role"         TEXT,
  "note"               TEXT,
  "created_at"         TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Status Machine
```typescript
const VALID_TRANSITIONS: Record<ServiceStatus, ServiceStatus[]> = {
  REQUESTED:          ['UNDER_REVIEW', 'CANCELLED', 'REJECTED'],
  UNDER_REVIEW:       ['SCHEDULED', 'REJECTED', 'CANCELLED'],
  SCHEDULED:          ['ASSIGNED', 'RESCHEDULED', 'CANCELLED'],
  RESCHEDULED:        ['SCHEDULED', 'CANCELLED'],
  ASSIGNED:           ['IN_PROGRESS', 'RESCHEDULED', 'CANCELLED'],
  IN_PROGRESS:        ['WAITING_FOR_PARTS', 'READY_FOR_CUSTOMER'],
  WAITING_FOR_PARTS:  ['IN_PROGRESS', 'CANCELLED'],
  READY_FOR_CUSTOMER: ['COMPLETED'],
  COMPLETED:          [],
  CANCELLED:          [],
  REJECTED:           [],
};

function validateTransition(from: ServiceStatus, to: ServiceStatus): void {
  if (!VALID_TRANSITIONS[from].includes(to)) {
    throw new AppError('SERVICE_REQUEST_INVALID_STATUS_TRANSITION',
      'Invalid status transition', 422);
  }
}
```

## 6. Business Rules
- Customer can cancel only before ASSIGNED
- Worker cannot directly change service_request status (uses task update)
- Every status change logged in service_request_status_history
- Status changes trigger notifications

## 7. Testing
- COMPLETED -> REQUESTED transition -> 422
- Customer cancels after ASSIGNED -> 403
- Worker updates task -> status machine validates
- Status history entry created on every transition
---
*Backend DLD | Module 008 | Service Management*
