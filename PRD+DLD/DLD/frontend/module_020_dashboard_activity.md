# DLD — Frontend — Module 020: Dashboard and Activity
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_020 | mobile/module_020

## 1. Routes
```
app/(admin)/dashboard/page.tsx    Admin dashboard (Server Component shell)
app/(customer)/dashboard/page.tsx Customer dashboard
app/(worker)/dashboard/page.tsx   Worker dashboard
app/(admin)/audit-logs/page.tsx   Audit log viewer
```

## 2. Admin Dashboard (Hybrid: Server + Client)
```typescript
// Server Component: initial data fetch
// Client Component: auto-refresh sections (15s)

KPI Cards (Server): totalRequests, revenue, pendingCount, activeWorkers
Recent Activity (Client): refetchInterval: 15_000
Alerts Section (Client): refetchInterval: 60_000
Charts (Client, lazy-loaded): revenue chart, request status pie
```

## 3. KPI Card Component
```typescript
<StatCard
  label="Total Revenue"
  value={formatCurrency(kpis.revenue)}
  change="+12% vs last month"
  trend="up"
  icon={<DollarIcon />}
/>
```

## 4. Alerts Widget (Admin)
Displays active alerts:
- Low stock items (count)
- Overdue services (count)
- Pending requests (count)
- Unavailable workers (count)
Each alert is clickable -> navigates to relevant section.

## 5. Customer Dashboard
My Service Requests summary (last 3 + status badges).
My Bikes summary (count + last serviced date).
Recent Notifications (last 3).
Quick actions: [Book Service] [Request Part] [View History]

## 6. Worker Dashboard
Today's assigned services (count + list).
Availability status toggle (quick update).
Pending spare part requests.
Recent notifications.

## 7. Audit Log Viewer (Admin)
Table: Timestamp | Actor | Role | Action | Entity | Details
Filters: date range, action type, actor.
Paginated (20 per page).

## 8. Cross-Layer Mapping
- GET /api/v1/dashboard/summary        -> backend module_020
- GET /api/v1/dashboard/alerts         -> backend module_020
- GET /api/v1/dashboard/recent-activity -> backend module_020
- GET /api/v1/audit-logs               -> backend module_020
---
*Frontend DLD | Module 020 | Dashboard and Activity*
