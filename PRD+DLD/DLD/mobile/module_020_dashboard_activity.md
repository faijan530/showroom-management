# DLD — Mobile — Module 020: Dashboard and Activity
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_020 | frontend/module_020

## 1. Screens
```
app/(tabs)/index.tsx               Customer home dashboard tab
app/(worker)/dashboard.tsx         Worker dashboard
app/(admin)/dashboard.tsx          Admin dashboard
app/(admin)/activity.tsx           Activity feed
app/(admin)/audit-logs.tsx         Audit log viewer (read-only)
```

## 2. Admin Dashboard
```typescript
// ScrollView (not FlashList - content is varied)
// Header: "Good Morning, {name}" | Selected showroom name
// KPI Cards: 2-column grid
//   Pending Requests | Today's Completed | Revenue Today | Active Workers
// Alerts Section: horizontal scroll of alert chips
//   [2 Low Stock ⚠] [3 Overdue 🔴] [5 Pending 📋]
// Recent Activity: last 5 events (tap to navigate)
// Charts: small revenue sparkline (last 7 days)

// Refresh strategy:
const { data, refetch } = useQuery({
  queryKey: ['dashboard-summary'],
  queryFn: () => apiClient.get('/api/v1/dashboard/summary'),
  staleTime: 30_000,
  refetchInterval: 60_000,
});
// useAppState: refetch on foreground
```

## 3. Worker Dashboard
```typescript
// Today's task count chip (3 tasks today)
// Availability toggle: [Available] [Busy] [Break] [Offline]
// Next task card: customer name, service, scheduled time, [View Details]
// Overdue warning if applicable
```

## 4. Customer Dashboard
```typescript
// Active service status card (if any in progress)
// Quick actions: [Book Service] [Request Part]
// Recent activity: last 3 service requests
// My bikes summary
```

## 5. Audit Log (Admin Mobile)
```typescript
// Read-only list: Timestamp | Actor | Action | Entity
// Pull-to-refresh
// Infinite scroll (cursor pagination)
```

## 6. Cross-Layer Mapping
- GET /api/v1/dashboard/summary         -> backend module_020
- GET /api/v1/dashboard/alerts          -> backend module_020
- GET /api/v1/dashboard/recent-activity -> backend module_020
- GET /api/v1/audit-logs                -> backend module_020
---
*Mobile DLD | Module 020 | Dashboard and Activity*
