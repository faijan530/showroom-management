# DLD — Backend — Module 012: Spare Part Requests
**Layer:** Backend | **Mapped To:** frontend/module_012 | mobile/module_012

## 1. Purpose
End-to-end spare part request workflow: Customer requests, Admin assigns Worker,
Worker orders and tracks, Customer notified at every step.

## 2. Files
src/modules/spare-parts-request/: spare-parts-request.service.ts, spare-parts-request.repository.ts, spare-parts-request.validation.ts, spare-parts-request.status-machine.ts, tests/

## 3. API Endpoints
| Method | Path                                       | Role        | Description                 |
|--------|--------------------------------------------|-------------|-----------------------------|
| POST   | /api/v1/spare-part-requests               | CUSTOMER    | Submit part request         |
| GET    | /api/v1/spare-part-requests               | ADMIN,MGR   | List all requests           |
| GET    | /api/v1/spare-part-requests/:id           | ADMIN,MGR,C | Get request detail          |
| PATCH  | /api/v1/spare-part-requests/:id/assign    | ADMIN,MGR   | Assign worker               |
| PATCH  | /api/v1/spare-part-requests/:id/update    | WORKER      | Update order status/ETA     |
| PATCH  | /api/v1/spare-part-requests/:id/received  | WORKER,ADMIN| Mark part received          |
| PATCH  | /api/v1/spare-part-requests/:id/cancel    | ADMIN,CUSTOMER| Cancel request            |
| GET    | /api/v1/me/spare-part-requests            | CUSTOMER    | Customer's own requests     |
| GET    | /api/v1/workers/me/spare-part-requests    | WORKER      | Worker's assigned requests  |

## 4. Database Migration: spare_part_requests
```sql
CREATE TABLE "spare_part_requests" (
  "id"                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"           UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"         UUID NOT NULL REFERENCES "showrooms"("id"),
  "customer_id"         UUID NOT NULL REFERENCES "customers"("id"),
  "spare_part_id"       UUID REFERENCES "spare_parts"("id"),
  "bike_id"             UUID REFERENCES "customer_bikes"("id"),
  "quantity"            INTEGER NOT NULL DEFAULT 1,
  "status"              TEXT NOT NULL DEFAULT 'REQUESTED',
  "customer_note"       TEXT,
  "admin_note"          TEXT,
  "worker_id"           UUID REFERENCES "workers"("id"),
  "supplier_order_id"   TEXT,
  "estimated_arrival"   DATE,
  "actual_arrival"      DATE,
  "created_at"          TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_spr_tenant_id"    ON "spare_part_requests"("tenant_id");
CREATE INDEX "idx_spr_customer_id"  ON "spare_part_requests"("customer_id");
CREATE INDEX "idx_spr_status"       ON "spare_part_requests"("status");

CREATE TABLE "spare_part_request_history" (
  "id"         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "request_id" UUID NOT NULL REFERENCES "spare_part_requests"("id"),
  "from_status" TEXT,
  "to_status"  TEXT NOT NULL,
  "actor_id"   UUID,
  "note"       TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Status Machine
```
REQUESTED -> UNDER_REVIEW -> PROCESSING -> ORDERED -> IN_TRANSIT
          -> RECEIVED -> READY_FOR_PICKUP -> COMPLETED
At any point -> CANCELLED
```

## 6. Business Rules
- Every status change logged in spare_part_request_history
- Worker provides estimatedArrival and supplierOrderId when ordering
- Part received -> auto adjustStock(+quantity) in spare_parts
- Customer notified at: ORDERED, IN_TRANSIT, RECEIVED, READY_FOR_PICKUP

## 7. Testing
- Request for in-stock part -> PROCESSING skips to READY_FOR_PICKUP
- Request for out-of-stock part -> full order workflow
- Part received -> spare_parts quantity updated
- Status history entry on every transition
---
*Backend DLD | Module 012 | Spare Part Requests*
