# DLD — Backend — Module 020: Dashboard and Activity
**Layer:** Backend | **Mapped To:** frontend/module_020 | mobile/module_020

## 1. Purpose
Real-time dashboard summary, activity feed, and audit log API for all admin roles.

## 2. Files
src/modules/dashboard/: dashboard.service.ts, dashboard.repository.ts, tests/
src/modules/activity/: activity.service.ts, activity.repository.ts, tests/
src/shared/audit/: audit.service.ts, audit.repository.ts, audit.types.ts

## 3. API Endpoints
| Method | Path                            | Role           | Description               |
|--------|---------------------------------|----------------|---------------------------|
| GET    | /api/v1/dashboard/summary       | ADMIN,MGR,OWNER| Dashboard KPIs            |
| GET    | /api/v1/dashboard/recent-activity| ADMIN,MGR     | Recent activity feed      |
| GET    | /api/v1/dashboard/alerts        | ADMIN,MGR      | Active alerts             |
| GET    | /api/v1/audit-logs              | OWNER,ADMIN    | Audit log (paginated)     |

## 4. Database Migration: audit_logs
```sql
CREATE TABLE "audit_logs" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id" UUID REFERENCES "showrooms"("id"),
  "actor_id"    UUID,
  "actor_role"  TEXT,
  "action"      TEXT NOT NULL,
  "entity"      TEXT NOT NULL,
  "entity_id"   UUID,
  "metadata"    JSONB DEFAULT '{}',
  "ip_address"  TEXT,
  "created_at"  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_audit_tenant_created" ON "audit_logs"("tenant_id","created_at");
CREATE INDEX "idx_audit_entity"         ON "audit_logs"("entity","entity_id");

CREATE TABLE "activity_logs" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id"),
  "user_id"     UUID,
  "type"        TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "reference_type" TEXT,
  "reference_id"   UUID,
  "created_at"  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_activity_tenant_created" ON "activity_logs"("tenant_id","created_at");
```

## 5. Dashboard KPI Response
```typescript
{
  period: 'today' | '7d' | '30d',
  kpis: {
    totalRequests: number,
    pendingRequests: number,
    completedToday: number,
    revenue: number,
    newCustomers: number,
    activeWorkers: number,
    lowStockAlerts: number,
    averageRating: number,
    overdueServices: number,
  },
  charts: {
    requestsByDay: Array<{ date: string; count: number }>,
    revenueByDay: Array<{ date: string; amount: number }>,
  }
}
```

## 6. Alerts Engine
```typescript
async getActiveAlerts(tenantId, showroomId): Promise<Alert[]> {
  const [lowStock, overdue, pendingRequests, workerUnavailable] = await Promise.all([
    getLowStockAlerts(tenantId, showroomId),
    getOverdueServices(tenantId, showroomId),
    getPendingRequestsCount(tenantId, showroomId),
    getUnavailableWorkers(tenantId, showroomId),
  ]);
  return [...lowStock, ...overdue, ...pendingRequests, ...workerUnavailable];
}
```

## 7. Audit Service
```typescript
// Called by every module on important operations
async log(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      tenantId: entry.tenantId,
      actorId: entry.actorId,
      actorRole: entry.actorRole,
      action: entry.action,     // e.g. 'SERVICE_REQUEST_ASSIGNED'
      entity: entry.entity,     // e.g. 'ServiceRequest'
      entityId: entry.entityId,
      metadata: entry.metadata, // Additional context (never PII)
    }
  });
}
```

## 8. Business Rules
- Audit logs are append-only (no UPDATE, no DELETE)
- metadata JSON never contains passwords/tokens
- Dashboard queries run in parallel (Promise.all)
- Activity feed ordered by created_at DESC, paginated
- Alerts cached for 60s (short revalidation)

## 9. Testing
- Dashboard summary returns correct KPIs
- Audit log created on service assignment
- Audit log immutable (UPDATE attempt fails)
- Alerts include low stock items correctly
---
*Backend DLD | Module 020 | Dashboard and Activity*
