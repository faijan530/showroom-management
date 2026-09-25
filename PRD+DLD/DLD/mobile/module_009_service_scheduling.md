# DLD — Mobile — Module 009: Service Scheduling
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_009 | frontend/module_009

## 1. Screens (Admin Mobile)
```
app/(admin)/scheduling/
  index.tsx           Today's schedule (agenda view)
  calendar.tsx        Week view calendar
  assign.tsx          Assign/reschedule bottom sheet
```

## 2. Today's Schedule (Admin)
```typescript
// Grouped by worker, shows list of today's service assignments
// Each item: customer name, bike, service type, scheduled time, status badge
// useQuery: GET /api/v1/scheduling/calendar?date=today&view=day
// staleTime: 15s, refetchInterval: 30s (near real-time)
```

## 3. Assign Worker (Bottom Sheet)
```typescript
// Triggered from service request detail
// Step 1: Worker list with availability status
// Step 2: Date picker + Time slot picker
// Conflict check: POST /api/v1/scheduling/conflicts before submit
// Conflict shown as warning inline
// Confirm: POST /api/v1/scheduling/assign
```

## 4. Worker Availability (Admin)
```typescript
// Horizontal scrollable list of workers with status chips
// AVAILABLE(green) | BUSY(red) | OFFLINE(grey) | ON_LEAVE(blue)
```

## 5. Cross-Layer Mapping
- GET /api/v1/scheduling/calendar  -> backend module_009
- POST /api/v1/scheduling/assign   -> backend module_009
- PATCH /api/v1/workers/me/availability (Worker) -> backend module_009
---
*Mobile DLD | Module 009 | Service Scheduling*
