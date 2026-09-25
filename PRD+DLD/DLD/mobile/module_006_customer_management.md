# DLD — Mobile — Module 006: Customer Management
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_006 | frontend/module_006

## 1. Screens
```
app/(tabs)/index.tsx            Customer home tab
app/(customer)/profile/
  index.tsx                     View + edit profile
  my-bikes.tsx                  List of registered bikes
  my-services.tsx               Service history
```

## 2. Customer Home Tab
```typescript
// Cards: Active Services count, My Bikes count, Recent Notifications
// Quick actions: [Book Service] [Request Part] [View History]
// Recent service request status (last 1-2)
```

## 3. Profile Screen
```typescript
// useQuery: GET /api/v1/me/profile
// Edit form: firstName, lastName, phone, address
// useMutation: PATCH /api/v1/me/profile
// Avatar upload with expo-image-picker
```

## 4. FlashList Usage
```typescript
// My services list uses FlashList for performance
<FlashList
  data={services}
  renderItem={({ item }) => <ServiceRequestCard item={item} />}
  estimatedItemSize={80}
  onEndReached={fetchNextPage}
/>
```

## 5. Cross-Layer Mapping
- GET /api/v1/me/profile  -> backend module_006
- GET /api/v1/me/services -> backend module_006
- GET /api/v1/me/bikes    -> backend module_006
---
*Mobile DLD | Module 006 | Customer Management*
