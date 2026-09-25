# DLD — Mobile — Module 005: Showroom Management
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_005 | frontend/module_005

## 1. Scope
Admin can view showroom details. Showroom switcher in mobile header.

## 2. Screens
```
app/(admin)/showrooms/
  index.tsx         List of showrooms (for multi-showroom owners)
  [id].tsx          Showroom detail (hours, contact, stats)
```

## 3. Showroom Switcher
```typescript
// Bottom sheet or action sheet showing list of user's showrooms
// Tap to switch active showroom context
// Stored in authStore.selectedShowroomId
// All subsequent API calls use this showroomId
```

## 4. Cross-Layer Mapping
- GET /api/v1/showrooms -> backend module_005
- showroomId context passed in all admin API calls
---
*Mobile DLD | Module 005 | Showroom Management*
