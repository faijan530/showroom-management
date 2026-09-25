# DLD — Backend — Module 009: Service Scheduling
**Layer:** Backend | **Mapped To:** frontend/module_009 | mobile/module_009

## 1. Purpose
Intelligent scheduling of services to workers. Conflict detection, calendar view API,
worker availability tracking, real-time status.

## 2. Files
src/modules/service-scheduling/: scheduling.service.ts, scheduling.repository.ts, scheduling.validation.ts, conflict-detector.ts, tests/
src/modules/worker-availability/: availability.service.ts, availability.repository.ts, availability.types.ts, tests/

## 3. API Endpoints
| Method | Path                              | Role      | Description                  |
|--------|-----------------------------------|-----------|------------------------------|
| GET    | /api/v1/scheduling/calendar       | ADMIN,MGR | Calendar view (day/week)     |
| POST   | /api/v1/scheduling/assign         | ADMIN,MGR | Assign worker + set time     |
| PATCH  | /api/v1/scheduling/reschedule/:id | ADMIN,MGR | Reschedule a service         |
| GET    | /api/v1/scheduling/conflicts      | ADMIN,MGR | Check scheduling conflicts   |
| GET    | /api/v1/workers/availability      | ADMIN,MGR | All workers availability     |
| PATCH  | /api/v1/workers/me/availability   | WORKER    | Worker updates own status    |

## 4. Database Migration: service_scheduling
```sql
CREATE TABLE "worker_availability" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "worker_id"   UUID NOT NULL REFERENCES "workers"("id"),
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id" UUID NOT NULL REFERENCES "showrooms"("id"),
  "status"      TEXT NOT NULL DEFAULT 'AVAILABLE',
  "note"        TEXT,
  "updated_at"  TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX "idx_worker_avail_worker" ON "worker_availability"("worker_id");
CREATE INDEX "idx_worker_avail_showroom"      ON "worker_availability"("showroom_id");
```

## 5. Conflict Detection Algorithm
```typescript
async function checkConflict(
  workerId: string, scheduledAt: Date, durationMinutes: number
): Promise<boolean> {
  const endTime = addMinutes(scheduledAt, durationMinutes);
  const conflict = await prisma.serviceRequest.findFirst({
    where: {
      workerId,
      status: { in: ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_PARTS'] },
      scheduledAt: { lt: endTime },
      estimatedCompletion: { gt: scheduledAt },
    },
  });
  return conflict !== null;
}
```

## 6. Calendar API Response
```typescript
GET /api/v1/scheduling/calendar?date=2026-09-25&view=day&showroomId=xxx
Response:
{
  date: '2026-09-25',
  view: 'day',
  workers: [
    {
      workerId: '...',
      name: 'John Doe',
      availabilityStatus: 'AVAILABLE',
      assignments: [
        { serviceRequestId, customerName, bikeName, scheduledAt,
          estimatedCompletion, status, serviceName }
      ]
    }
  ]
}
```

## 7. Worker Availability Statuses
AVAILABLE | BUSY | ON_BREAK | OFFLINE | ON_LEAVE | OVERDUE

## 8. Business Rules
- Conflict check mandatory before assigning worker
- Admin can override conflict (with warning flag)
- OVERDUE computed dynamically: estimated_completion < NOW() AND status != COMPLETED
- Worker updates own availability; Admin can override worker status

## 9. Testing
- Assign worker with time conflict -> 409
- Assign worker AVAILABLE -> 200, status updated to BUSY
- Worker marks OFFLINE -> availability record updated
- Calendar API groups by worker correctly
---
*Backend DLD | Module 009 | Service Scheduling*
