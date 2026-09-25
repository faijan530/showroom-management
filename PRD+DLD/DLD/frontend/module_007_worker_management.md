# DLD — Frontend — Module 007: Worker Management
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_007 | mobile/module_007

## 1. Purpose
Admin creates/manages workers. Worker panel login, dashboard, schedule, task updates.

## 2. Routes
```
app/(admin)/workers/
  page.tsx                 Worker list
  create/page.tsx          Create worker form (invitation)
  [id]/page.tsx            Worker detail + performance
  [id]/assignments/page.tsx Worker's assignments
  availability/page.tsx    All workers availability board
app/(worker)/
  dashboard/page.tsx       Worker dashboard
  schedule/page.tsx        My schedule (calendar)
  tasks/page.tsx           Assigned tasks list
  tasks/[id]/page.tsx      Task detail + update
  availability/page.tsx    Update my availability
  profile/page.tsx         My profile
```

## 3. Worker Availability Board (Admin)
Grid layout: Workers as rows, time slots as columns.
Color coding: GREEN=Available, RED=Busy, YELLOW=Break, GREY=Offline.

## 4. Create Worker Form
```typescript
// Fields: firstName, lastName, email, phone, employeeCode, specializations[], showroomId
// On submit: POST /api/v1/workers
// System sends invitation email automatically
```

## 5. Worker Task Update (Worker Panel)
```typescript
// Worker can update task status with notes
const mutation = useMutation({
  mutationFn: (data) => apiClient.patch('/api/v1/workers/me/tasks/:id', data),
  onSuccess: () => queryClient.invalidateQueries(['worker-tasks']),
});
// Status buttons: Start Task | Mark Waiting | Complete Task
// Note input: textarea
```

## 6. Cross-Layer Mapping
- POST /api/v1/workers                -> backend module_007
- GET /api/v1/workers/availability    -> backend module_009
- PATCH /api/v1/workers/me/tasks/:id  -> backend module_008
---
*Frontend DLD | Module 007 | Worker Management*
