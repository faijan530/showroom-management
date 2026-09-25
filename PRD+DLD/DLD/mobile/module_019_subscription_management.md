# DLD — Mobile — Module 019: Subscription Management
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_019 | frontend/module_019

## 1. Screens
```
app/(admin)/settings/subscription.tsx    Subscription status
```

## 2. Subscription Status Card
```typescript
// Plan name badge + status chip
// Trial: countdown chip "12 days left"
// Active: expiry date shown
// Suspended: red banner full-width with support contact
```

## 3. App Suspension Handling
```typescript
// On any API 403 with code TENANT_SUSPENDED:
// Interceptor clears auth + navigates to /suspended screen
// Suspended screen: message + "Contact Support" button
```

## 4. Cross-Layer Mapping
- GET /api/v1/subscription -> backend module_019
- 403 TENANT_SUSPENDED handler in API interceptor
---
*Mobile DLD | Module 019 | Subscription Management*
