# DLD — Mobile — Module 003: Super Admin
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_003 | frontend/module_003

## 1. Scope
Super Admin mobile access is READ-ONLY dashboard and tenant status overview.
Full management happens on web panel.

## 2. Screens
```
app/(superadmin)/
  dashboard.tsx       Platform KPI cards (total tenants, active, revenue)
  tenants.tsx         Tenant list (read-only)
  tenants/[id].tsx    Tenant detail (status, plan, showrooms count)
```

## 3. Super Admin Auth
```typescript
// Super Admin JWT has role = PLATFORM_SUPER_ADMIN
// Stored in Expo SecureStore like other tokens
// All requests go to /api/superadmin/v1/*
```

## 4. KPI Cards (Mobile)
```typescript
// Compact stat cards in a 2-column grid
// TotalTenants | ActiveTenants | TotalShowrooms | PlatformRevenue
// useQuery staleTime: 60s, refetchInterval: 120s
```

## 5. Cross-Layer Mapping
- GET /api/superadmin/v1/analytics -> backend module_003
- GET /api/superadmin/v1/tenants   -> backend module_003
---
*Mobile DLD | Module 003 | Super Admin*
