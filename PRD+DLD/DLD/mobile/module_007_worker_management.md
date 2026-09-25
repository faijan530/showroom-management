# DLD — Mobile — Module 007: Worker Management
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_007 | frontend/module_007

## 1. Screens (Worker Panel)
```
app/(worker)/
  dashboard.tsx            Worker home: today's tasks, availability status
  tasks/index.tsx          All assigned tasks (FlashList)
  tasks/[id].tsx           Task detail + action buttons
  availability.tsx         Update availability status
  history.tsx              Completed tasks history
  profile.tsx              Worker profile
```

## 2. Availability Status Screen
```typescript
// Large status buttons with color coding
// AVAILABLE (green) | BUSY (red) | ON_BREAK (yellow) | OFFLINE (grey) | ON_LEAVE (blue)
// useMutation: PATCH /api/v1/workers/me/availability
// Status persists via useQuery invalidation after update
```

## 3. Task Detail Screen
```typescript
// Shows: Customer name, Bike info, Service type, Issue description
// Scheduled time, Estimated completion
// Action buttons based on current status:
//   [START TASK] -> IN_PROGRESS
//   [WAITING FOR PARTS] -> WAITING_FOR_PARTS
//   [COMPLETE TASK] -> READY_FOR_CUSTOMER
// Notes textarea (submit adds internal note)
// Request Spare Part button
```

## 4. Cross-Layer Mapping
- GET /api/v1/workers/me/tasks          -> backend module_008
- PATCH /api/v1/workers/me/tasks/:id    -> backend module_008
- PATCH /api/v1/workers/me/availability -> backend module_009
---
*Mobile DLD | Module 007 | Worker Management*
