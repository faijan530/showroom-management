# DLD — Frontend — Module 015: Notifications
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_015 | mobile/module_015

## 1. Routes
```
app/(customer)/notifications/page.tsx    Customer notifications
app/(admin)/notifications/page.tsx       Admin notifications
app/(worker)/notifications/page.tsx      Worker notifications
```

## 2. Notification Bell (Header Component)
```typescript
// Client Component: polls unread count every 30s
const { data } = useQuery({
  queryKey: ['notifications', 'unread-count'],
  queryFn: () => apiClient('/api/v1/notifications/unread-count'),
  staleTime: 10_000,
  refetchInterval: 30_000,
});
// Badge shows unread count (capped at 99+)
// Click opens notification dropdown (last 5) + "View All" link
```

## 3. Notifications Page
List of notifications with:
- Icon by type (service, parts, finance, system)
- Title + body text
- Relative timestamp (2 min ago)
- UNREAD = highlighted background
- Click to mark as read + navigate to reference entity

## 4. Mark Read Logic
```typescript
// Click notification -> PATCH /api/v1/notifications/:id/read
// Optimistic update: instantly update UI, then server confirms
const mutation = useMutation({
  mutationFn: (id) => apiClient.patch('/api/v1/notifications/' + id + '/read'),
  onMutate: async (id) => {
    // optimistic: mark as READ in cache immediately
  },
});
```

## 5. Cross-Layer Mapping
- GET /api/v1/notifications             -> backend module_015
- GET /api/v1/notifications/unread-count -> backend module_015
- PATCH /api/v1/notifications/:id/read  -> backend module_015
---
*Frontend DLD | Module 015 | Notifications*
