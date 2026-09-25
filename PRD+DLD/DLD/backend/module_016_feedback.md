# DLD — Backend — Module 016: Feedback
**Layer:** Backend | **Mapped To:** frontend/module_016 | mobile/module_016

## 1. Purpose
Post-service customer feedback collection, admin moderation, and responses.
One feedback per completed service request per customer.

## 2. Files
src/modules/feedback/: feedback.service.ts, feedback.repository.ts, feedback.validation.ts, tests/

## 3. API Endpoints
| Method | Path                          | Role      | Description                |
|--------|-------------------------------|-----------|----------------------------|
| POST   | /api/v1/feedback              | CUSTOMER  | Submit feedback            |
| GET    | /api/v1/feedback              | Public    | Approved feedback (public) |
| GET    | /api/v1/admin/feedback        | ADMIN,MGR | All feedback (incl. pending)|
| GET    | /api/v1/admin/feedback/:id    | ADMIN,MGR | Feedback detail            |
| PATCH  | /api/v1/admin/feedback/:id/approve  | ADMIN | Approve feedback         |
| PATCH  | /api/v1/admin/feedback/:id/reject   | ADMIN | Reject feedback          |
| PATCH  | /api/v1/admin/feedback/:id/respond  | ADMIN,MGR| Respond to feedback      |
| GET    | /api/v1/me/feedback           | CUSTOMER  | My submitted feedback      |

## 4. Database Migration: feedback
```sql
CREATE TABLE "feedback" (
  "id"                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"           UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"         UUID NOT NULL REFERENCES "showrooms"("id"),
  "customer_id"         UUID NOT NULL REFERENCES "customers"("id"),
  "service_request_id"  UUID UNIQUE REFERENCES "service_requests"("id"),
  "rating"              SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5),
  "comment"             TEXT,
  "status"              TEXT NOT NULL DEFAULT 'PENDING',
  "admin_response"      TEXT,
  "responded_at"        TIMESTAMPTZ,
  "responded_by"        UUID REFERENCES "users"("id"),
  "created_at"          TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX "idx_feedback_service_customer" ON "feedback"("service_request_id","customer_id");
CREATE INDEX "idx_feedback_tenant_status"           ON "feedback"("tenant_id","status");
```

## 5. Business Rules
- 1 feedback per service_request per customer (UNIQUE constraint)
- Feedback only allowed for COMPLETED service requests
- PENDING -> APPROVED or REJECTED (admin moderates)
- REJECTED feedback never shown in public API
- Admin cannot edit customer comment (only respond)
- Public API never exposes customer PII (only first name + rating)

## 6. Avg Rating Query
```typescript
async getShowroomRating(tenantId, showroomId):
  SELECT AVG(rating), COUNT(*) FROM feedback
  WHERE tenant_id =  AND showroom_id =  AND status = 'APPROVED'
```

## 7. Testing
- Submit feedback for non-COMPLETED service -> 422
- Submit second feedback for same service -> 409
- REJECTED feedback not in public API
- Average rating computed correctly
---
*Backend DLD | Module 016 | Feedback*
