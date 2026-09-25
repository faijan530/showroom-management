# DLD — Backend — Module 017: Reports and Analytics
**Layer:** Backend | **Mapped To:** frontend/module_017 | mobile/module_017

## 1. Purpose
Business intelligence: service performance, worker efficiency, revenue, inventory,
customer retention, feedback analytics. Export to PDF/Excel/CSV.

## 2. Files
src/modules/reports/: reports.service.ts, reports.repository.ts, report-export.service.ts, tests/

## 3. API Endpoints
| Method | Path                                    | Role              | Description              |
|--------|-----------------------------------------|-------------------|--------------------------|
| GET    | /api/v1/reports/service-performance     | OWNER,ADMIN,MGR   | Service stats by period  |
| GET    | /api/v1/reports/worker-performance      | OWNER,ADMIN,MGR   | Per-worker metrics       |
| GET    | /api/v1/reports/revenue                 | OWNER,ADMIN,ACCT  | Revenue breakdown        |
| GET    | /api/v1/reports/inventory               | OWNER,ADMIN,MGR   | Stock report             |
| GET    | /api/v1/reports/customer-retention      | OWNER,ADMIN       | Customer activity        |
| GET    | /api/v1/reports/feedback-summary        | OWNER,ADMIN,MGR   | Rating and feedback data |
| GET    | /api/v1/reports/export/:type            | OWNER,ADMIN,ACCT  | Export as PDF/Excel/CSV  |
| GET    | /api/v1/dashboard/summary               | All admin roles   | Dashboard KPIs           |

## 4. Dashboard Summary Query
```typescript
async getDashboardSummary(tenantId, showroomId, period):
  Promise.all([
    getTotalServiceRequests(tenantId, showroomId, period),
    getTotalRevenue(tenantId, showroomId, period),
    getPendingRequests(tenantId, showroomId),
    getActiveWorkers(tenantId, showroomId),
    getLowStockCount(tenantId, showroomId),
    getAverageRating(tenantId, showroomId),
    getNewCustomers(tenantId, showroomId, period),
  ])
```

## 5. Service Performance Report
```typescript
{
  period: { from, to },
  totalRequests: number,
  completed: number,
  cancelled: number,
  rejected: number,
  averageCompletionTimeMinutes: number,
  byStatus: Record<ServiceStatus, number>,
  byCategory: Record<ServiceCategory, number>,
  overdueCount: number,
}
```

## 6. Revenue Report Query
```sql
SELECT
  DATE_TRUNC('day', p.created_at) AS period,
  SUM(p.amount) AS revenue,
  COUNT(p.id) AS transactions
FROM payments p
  JOIN invoices i ON i.id = p.invoice_id
WHERE i.tenant_id = 
  AND p.status = 'COMPLETED'
  AND p.created_at BETWEEN  AND 
GROUP BY DATE_TRUNC('day', p.created_at)
ORDER BY period ASC
```

## 7. Export Strategy
- PDF: pdfmake or @react-pdf/renderer (server-side)
- Excel: exceljs library
- CSV: native string generation
- All exports streamed as HTTP response with Content-Disposition header

## 8. Business Rules
- Reports always filtered by tenantId (never cross-tenant)
- ACCOUNTANT can view finance reports only
- Reports use DB indexes (scheduled_at, created_at, tenant_id)
- Dashboard runs queries in parallel (Promise.all)

## 9. Testing
- Revenue report sums only COMPLETED payments
- Worker performance excludes cancelled tasks from avg time
- Dashboard returns in < 500ms (parallel queries)
- Export generates valid file with correct Content-Type header
---
*Backend DLD | Module 017 | Reports and Analytics*
