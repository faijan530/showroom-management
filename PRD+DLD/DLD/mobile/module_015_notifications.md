# DLD — Mobile — Module 015: Notifications
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_015 | frontend/module_015

## 1. Screens
```
app/(tabs)/notifications.tsx    Notifications tab (all roles)
```

## 2. Notifications Tab
```typescript
// Badge on tab icon shows unread count
// FlashList of notification items
// Unread: background highlight
// Read: normal background
// Pull-to-refresh
// Swipe to delete notification
```

## 3. Unread Count Badge
```typescript
// useQuery: GET /api/v1/notifications/unread-count
// staleTime: 10s, refetchInterval: 30s
// useAppState listener: refetch on app foreground
```

## 4. Notification Item
```typescript
interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;    // determines icon
  status: 'UNREAD' | 'READ';
  createdAt: string;
  referenceType?: string;
  referenceId?: string;
}
// Tap: PATCH /api/v1/notifications/:id/read + navigate to reference entity
```

## 5. Push Notifications (v2)
```typescript
// Expo Push Notification token registered on login
// PATCH /api/v1/me/push-token { token: expoPushToken }
// Backend sends push via Expo Push Notifications API
```

## 6. Cross-Layer Mapping
- GET /api/v1/notifications             -> backend module_015
- GET /api/v1/notifications/unread-count-> backend module_015
- PATCH /api/v1/notifications/:id/read  -> backend module_015
---
*Mobile DLD | Module 015 | Notifications*
