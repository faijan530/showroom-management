# DLD — Mobile — Module 011: Spare Parts
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_011 | frontend/module_011

## 1. Screens
```
app/(tabs)/parts.tsx              Browse spare parts tab (customer)
app/(customer)/spare-parts/
  [id].tsx                        Part detail + availability status
app/(admin)/spare-parts/
  index.tsx                       Inventory list (admin)
  [id].tsx                        Part detail + quick stock adjust
  low-stock.tsx                   Low stock alert screen
```

## 2. Parts Browse (Customer Tab)
```typescript
// FlashList of part cards
// Status badge: IN_STOCK (green) | LOW_STOCK (yellow) | OUT_OF_STOCK (red)
// Filter: category, compatibility (bike brand)
// Tap -> detail + [Request Part] button if out of stock or desired
```

## 3. Admin Inventory List
```typescript
// FlashList: SKU | Name | Quantity badge | Status chip | [Adjust] button
// Pull-to-refresh
// Tap [Adjust]: ActionSheet -> (+) Add | (-) Remove -> quantity input -> reason
```

## 4. Low Stock Alert Screen (Admin)
```typescript
// useQuery: GET /api/v1/admin/spare-parts/low-stock
// refetchInterval: 5min
// Each item shows: name, current qty / min qty, supplier
// Action: [Adjust Stock] | [Create Request]
```

## 5. Cross-Layer Mapping
- GET /api/v1/spare-parts (customer)                     -> backend module_011
- GET /api/v1/admin/spare-parts/low-stock (admin)        -> backend module_011
- POST /api/v1/admin/spare-parts/:id/adjust (admin)      -> backend module_011
---
*Mobile DLD | Module 011 | Spare Parts*
