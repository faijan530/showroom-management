# DLD — Frontend — Module 019: Subscription Management
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_019 | mobile/module_019

## 1. Routes
```
app/(admin)/settings/billing/page.tsx   Subscription + billing
app/(superadmin)/subscriptions/page.tsx Super Admin subscription manager
```

## 2. Subscription Status Page (Owner)
Displays: Plan name, Status badge, Start date, End date, Features included.
Trial countdown banner if in TRIAL.
Upgrade CTA button (links to contact/payment for v1).

## 3. Plan Comparison (Public page)
```
/pricing page.tsx (Server Component)
Plans displayed as pricing cards:
  BASIC | PROFESSIONAL | ENTERPRISE
Each with feature list, price, CTA button
```

## 4. Suspension Page
If tenant.status = SUSPENDED, all admin routes redirect to /suspended.
Shows: reason, contact support CTA.

## 5. Cross-Layer Mapping
- GET /api/v1/subscription            -> backend module_019
- GET /api/v1/subscription/plans      -> backend module_019
- Super Admin actions -> /superadmin/v1/subscriptions -> backend module_019
---
*Frontend DLD | Module 019 | Subscription Management*
