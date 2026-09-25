# DLD — Mobile — Module 014: Deals and Advertisements
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_014 | frontend/module_014

## 1. Screens
```
app/(tabs)/deals.tsx       Deals list tab
app/(customer)/deals/
  [id].tsx                 Deal detail + promo code reveal/copy
```

## 2. Deals Tab
```typescript
// FlashList of deal cards: image, title, discount badge, expiry
// Filter chips: ALL | SERVICE | SPARE_PART | BIKE
// Tap -> deal detail with full image, description, promo code button
```

## 3. Promo Code Card (Deal Detail)
```typescript
// Shows masked code: "TAP TO REVEAL: BIKE****"
// On tap: reveal full code + Copy to Clipboard button
// Expiry countdown timer
```

## 4. Ads on Home Tab
```typescript
// HOME_BANNER ads shown in home tab carousel alongside content banners
// Tap tracks click: POST /api/v1/advertisements/:id/click (fire-and-forget)
// Ad opens in-app WebView or navigates to internal route
```

## 5. Cross-Layer Mapping
- GET /api/v1/deals                      -> backend module_014
- GET /api/v1/advertisements?placement=HOME_BANNER -> backend module_014
- POST /api/v1/advertisements/:id/click  -> backend module_014
---
*Mobile DLD | Module 014 | Deals and Advertisements*
