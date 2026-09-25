# DLD — Frontend — Module 011: Spare Parts
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_011 | mobile/module_011

## 1. Routes
```
app/(customer)/spare-parts/
  page.tsx              Browse parts (Server Component)
  [id]/page.tsx         Part detail
app/(admin)/spare-parts/
  page.tsx              Inventory list
  add/page.tsx          Add spare part
  [id]/page.tsx         Part detail + stock management
  low-stock/page.tsx    Low stock alerts
```

## 2. Inventory Table (Admin)
Columns: Name | SKU | Category | Quantity | Min Stock | Status | Price | Actions
Status badges: IN_STOCK=green, LOW_STOCK=yellow, OUT_OF_STOCK=red
Low stock rows highlighted in yellow.

## 3. Stock Adjustment Modal
```typescript
// Quick +/- stock adjustment
// Reason dropdown: RECEIVED | DAMAGED | SOLD | ADJUSTMENT | RETURNED
// POST /api/v1/admin/spare-parts/:id/adjust
```

## 4. Low Stock Alerts Page
List of parts below minimum stock. Each row: Part name, Current qty, Min stock, Supplier.
Action: [Adjust Stock] [Request Order].

## 5. Cross-Layer Mapping
- GET /api/v1/spare-parts (cached) -> backend module_011
- POST /api/v1/admin/spare-parts/:id/adjust -> backend module_011
- GET /api/v1/admin/spare-parts/low-stock   -> backend module_011
---
*Frontend DLD | Module 011 | Spare Parts*
