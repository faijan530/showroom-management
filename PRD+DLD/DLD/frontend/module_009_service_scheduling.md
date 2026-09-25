# DLD — Frontend — Module 009: Service Scheduling
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_009 | mobile/module_009

## 1. Routes
```
app/(admin)/scheduling/
  page.tsx           Scheduling calendar (day/week view)
  assign/page.tsx    Assign worker modal/page
```

## 2. Calendar Component
- Week/Day view using a custom calendar grid or FullCalendar
- Events color-coded by worker
- Click event -> service request detail side panel
- Drag-and-drop rescheduling (v2)

## 3. Assign Worker Flow
```typescript
// Modal: select worker, select date/time
// On worker select: fetch GET /api/v1/workers/availability to show status
// On time select: POST /api/v1/scheduling/conflicts to pre-check
// On confirm: POST /api/v1/scheduling/assign
// Conflict warning shown inline before confirm
```

## 4. Worker Availability Dashboard
Grid: Worker name | Status badge | Current assignment | Next available

## 5. Cross-Layer Mapping
- GET /api/v1/scheduling/calendar     -> backend module_009
- POST /api/v1/scheduling/assign      -> backend module_009
- GET /api/v1/workers/availability    -> backend module_009
---
*Frontend DLD | Module 009 | Service Scheduling*
