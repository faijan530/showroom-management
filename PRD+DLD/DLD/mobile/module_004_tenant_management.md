# DLD — Mobile — Module 004: Tenant Management
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_004 | frontend/module_004

## 1. Scope
Showroom owner can view subscription status and tenant info on mobile.

## 2. Screens
```
app/(admin)/settings/
  index.tsx         Settings overview
  subscription.tsx  Subscription status card
```

## 3. Subscription Status Card
```typescript
// Shows: Plan name | Status | Expiry date
// If TRIAL: shows "X days remaining" countdown
// If SUSPENDED: shows red banner with support contact
```

## 4. Cross-Layer Mapping
- GET /api/v1/subscription -> backend module_019
- Tenant status checked on every app resume (foreground event)
---
*Mobile DLD | Module 004 | Tenant Management*
