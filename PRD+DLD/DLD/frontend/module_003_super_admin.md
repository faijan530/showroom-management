# DLD — Frontend — Module 003: Super Admin Panel
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_003 | mobile/module_003

## 1. Purpose
Isolated Super Admin web panel. Separate route group. Tenant management, analytics, subscriptions.

## 2. Routes
```
app/(superadmin)/
  dashboard/page.tsx       Platform KPIs
  tenants/page.tsx         Tenant list
  tenants/[id]/page.tsx    Tenant detail + actions
  tenants/create/page.tsx  Create tenant form
  subscriptions/page.tsx   All subscriptions
  analytics/page.tsx       Platform analytics charts
  audit-logs/page.tsx      Audit log viewer
  feature-flags/page.tsx   Feature flag management
  settings/page.tsx        Platform settings
  layout.tsx               Super Admin sidebar layout
```

## 3. Layout
Super Admin layout has its own sidebar (separate from showroom admin sidebar).
Sidebar links: Dashboard, Tenants, Subscriptions, Analytics, Audit Logs, Feature Flags.

## 4. Tenant List Page
```typescript
// TanStack Query hook
const { data } = useQuery({
  queryKey: ['superadmin', 'tenants'],
  queryFn: () => apiClient('/api/superadmin/v1/tenants'),
  staleTime: 30_000,
});
// Table columns: Name, Slug, Status, Plan, Showrooms, Created, Actions
```

## 5. Tenant Detail Actions
- Suspend Tenant: confirmation modal -> POST /superadmin/v1/tenants/:id/suspend
- Reactivate:     POST /superadmin/v1/tenants/:id/reactivate
- View showrooms: read-only list from tenant's showrooms

## 6. Analytics Charts
- Line chart: New tenants by month
- Bar chart: Active vs Trial vs Suspended
- KPI cards: Total revenue, Total tenants, Active showrooms

## 7. Cross-Layer Mapping
- All API calls to /api/superadmin/v1/* (backend module_003)
- Uses separate auth (SUPER_ADMIN_JWT_SECRET)
- Cannot access /api/v1/* showroom routes
---
*Frontend DLD | Module 003 | Super Admin Panel*
