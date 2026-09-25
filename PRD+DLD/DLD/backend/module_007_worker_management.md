# DLD — Backend — Module 007: Worker Management
**Layer:** Backend | **Mapped To:** frontend/module_007 | mobile/module_007

## 1. Purpose
Worker CRUD, invitation flow (no public registration), specialization assignment,
performance tracking.

## 2. Files
src/modules/worker/: worker.service.ts, worker.repository.ts, worker.validation.ts, worker.types.ts, worker.mapper.ts, worker-invitation.service.ts, tests/

## 3. API Endpoints
| Method | Path                          | Role        | Description              |
|--------|-------------------------------|-------------|--------------------------|
| GET    | /api/v1/workers               | ADMIN,MGR   | List workers             |
| POST   | /api/v1/workers               | ADMIN       | Create worker + invite   |
| GET    | /api/v1/workers/:id           | ADMIN,MGR   | Worker detail            |
| PATCH  | /api/v1/workers/:id           | ADMIN       | Update worker            |
| DELETE | /api/v1/workers/:id           | ADMIN       | Deactivate worker        |
| POST   | /api/v1/workers/:id/invite    | ADMIN       | Resend invitation        |
| GET    | /api/v1/workers/:id/assignments| ADMIN,MGR  | Worker's assignments     |
| GET    | /api/v1/workers/:id/performance| ADMIN,MGR  | Performance metrics      |
| GET    | /api/v1/workers/availability  | ADMIN,MGR   | All workers availability |

## 4. Database Migration: worker_management
```sql
CREATE TABLE "workers" (
  "id"              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"       UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"     UUID NOT NULL REFERENCES "showrooms"("id"),
  "user_id"         UUID REFERENCES "users"("id"),
  "employee_code"   TEXT NOT NULL,
  "first_name"      TEXT NOT NULL,
  "last_name"       TEXT NOT NULL,
  "email"           TEXT NOT NULL,
  "phone"           TEXT,
  "specializations" TEXT[] DEFAULT '{}',
  "status"          TEXT NOT NULL DEFAULT 'ACTIVE',
  "joining_date"    DATE,
  "photo_url"       TEXT,
  "created_at"      TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"      TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX "idx_workers_code_tenant"   ON "workers"("employee_code","tenant_id");
CREATE INDEX "idx_workers_tenant_id"            ON "workers"("tenant_id");
CREATE INDEX "idx_workers_showroom_id"          ON "workers"("showroom_id");
```

## 5. Invitation Flow
```typescript
async createWorker(tenantId, showroomId, data):
  1. Create user record (status: PENDING_SETUP)
  2. Create worker record
  3. Generate invitation token (crypto.randomBytes(32))
  4. Hash token (SHA-256), store in worker_invitations
  5. Send email with raw token as URL param
  6. Token expires in 48 hours

async workerSetup(rawToken, password):
  1. Hash rawToken (SHA-256)
  2. Find invitation by hash (not expired, not used)
  3. bcrypt.hash(password)
  4. Update user: passwordHash, status = ACTIVE
  5. Mark invitation as used
```

## 6. Performance Metrics Query
```typescript
getWorkerPerformance(workerId, tenantId, from, to) -> {
  totalAssigned: number
  totalCompleted: number
  totalCancelled: number
  avgCompletionTimeMinutes: number
  overdueCount: number
}
```

## 7. Business Rules
- Max workers enforced by feature_flags.max_workers
- Worker cannot register themselves (no public endpoint)
- Worker can only be assigned to their showroom's services
- Deactivated worker: existing assignments must be reassigned

## 8. Testing
- Create worker -> invitation email sent
- Worker setup with expired token -> 400
- Worker setup with already-used token -> 400
- List workers returns only same tenant workers
---
*Backend DLD | Module 007 | Worker Management*
