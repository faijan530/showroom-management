# DLD — Frontend — Module 014: Deals and Advertisements
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_014 | mobile/module_014

## 1. Routes
```
app/(customer)/deals/
  page.tsx                 Active deals list (Server Component)
  [id]/page.tsx            Deal detail
app/(admin)/deals/
  page.tsx                 Deal management
  create/page.tsx          Create deal
  [id]/edit/page.tsx       Edit deal
app/(admin)/advertisements/
  page.tsx                 Ad management
  create/page.tsx          Create advertisement
```

## 2. Deals Page (Customer - Server Component)
Grid of deal cards: image, title, discount badge, expiry countdown.
Filter by: applicableTo (SERVICE, SPARE_PART, BIKE).

## 3. Promo Code Input (Service Request / Checkout)
```typescript
// Inline promo code input in service request or invoice flow
const validate = useMutation({
  mutationFn: (code) => apiClient('/api/v1/deals/validate/' + code),
  onSuccess: (data) => applyDiscount(data.discountValue),
  onError: () => toast.error('Invalid or expired promo code'),
});
```

## 4. Advertisement Display
Ads rendered based on placement prop:
HOME_BANNER: carousel on homepage
SIDEBAR: sidebar widget on service pages
POPUP: modal on first visit (dismissible)

## 5. Cross-Layer Mapping
- GET /api/v1/deals (cached)         -> backend module_014
- GET /api/v1/deals/validate/:code   -> backend module_014
- GET /api/v1/advertisements         -> backend module_014
- POST /api/v1/advertisements/:id/click -> backend module_014
---
*Frontend DLD | Module 014 | Deals and Advertisements*
