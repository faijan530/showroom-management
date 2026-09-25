# DLD — Frontend — Module 008: Service Management
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_008 | mobile/module_008

## 1. Purpose
Public service catalog browser. Customer service request flow. Admin service management.

## 2. Routes
```
app/(customer)/services/
  page.tsx                 Browse services (Server Component, cached)
  [id]/page.tsx            Service detail
  request/page.tsx         Book a service (multi-step form)
  requests/page.tsx        My service requests
  requests/[id]/page.tsx   Track service request
app/(admin)/services/
  page.tsx                 Service catalog management
  requests/page.tsx        All service requests (queue)
  requests/[id]/page.tsx   Request detail + actions
  active/page.tsx          Currently active services
  completed/page.tsx       Completed services history
```

## 3. Service Request Multi-Step Form (Customer)
```
Step 1: Select Bike (from my bikes list)
Step 2: Select Service (from catalog) + Describe Issue
Step 3: Choose Preferred Date + Time Slot
Step 4: Review + Confirm
```

## 4. Service Request Status Tracker (Customer)
Timeline component showing status progression:
REQUESTED -> SCHEDULED -> ASSIGNED -> IN_PROGRESS -> COMPLETED
With timestamps and notes at each step.

## 5. Admin Service Queue
```typescript
// Filters: status, date, worker, showroom
const { data } = useQuery({
  queryKey: ['service-requests', filters],
  queryFn: () => apiClient('/api/v1/service-requests?' + qs.stringify(filters)),
  staleTime: 15_000,     // 15s for near-real-time
  refetchInterval: 30_000, // poll every 30s
});
```

## 6. Status Action Buttons (Admin)
Based on current status -> show allowed transition buttons:
[UNDER_REVIEW] -> [Schedule] [Reject]
[SCHEDULED]    -> [Assign Worker + Time] [Reschedule] [Cancel]
[ASSIGNED]     -> [Reschedule] [Cancel]

## 7. Cross-Layer Mapping
- GET /api/v1/services              -> backend module_008
- POST /api/v1/service-requests     -> backend module_008
- PATCH /api/v1/service-requests/:id/status -> backend module_008
---
*Frontend DLD | Module 008 | Service Management*
