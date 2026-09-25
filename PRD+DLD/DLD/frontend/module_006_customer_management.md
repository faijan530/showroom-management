# DLD — Frontend — Module 006: Customer Management
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_006 | mobile/module_006

## 1. Purpose
Admin CRM view. Customer self-service profile and service history.

## 2. Routes
```
app/(admin)/customers/
  page.tsx                 Customer list with search
  [id]/page.tsx            Customer detail + service history
app/(customer)/
  dashboard/page.tsx       Customer overview
  profile/page.tsx         Edit own profile
  my-bikes/page.tsx        Registered bikes list
  my-services/page.tsx     Service history
```

## 3. Customer List (Admin)
```typescript
const { data } = useQuery({
  queryKey: ['customers', { search, page, status }],
  queryFn: () => apiClient('/api/v1/customers?search=...&page=...'),
  staleTime: 30_000,
});
// DataTable: Name, Email, Phone, Bikes, Services, Status, Actions
// Search input: debounced 300ms, server-side
```

## 4. Customer Detail Page (Admin)
Tabs: Overview | Service History | Bikes | Notes
Service history: timeline of all service requests with status badges.

## 5. Customer Profile (Self)
- Edit: firstName, lastName, phone, address
- View: service summary, bike count, loyalty points (v2)

## 6. Cross-Layer Mapping
- GET /api/v1/customers               -> backend module_006
- GET /api/v1/me/profile              -> backend module_006
- GET /api/v1/me/services             -> backend module_006
---
*Frontend DLD | Module 006 | Customer Management*
