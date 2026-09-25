# DLD — Mobile — Module 018: Finance and Billing
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_018 | frontend/module_018

## 1. Screens
```
app/(customer)/invoices/
  index.tsx            My invoices list
  [id].tsx             Invoice detail + download PDF
app/(admin)/finance/
  invoices/index.tsx   Invoice list + quick actions
  invoices/[id].tsx    Invoice detail + record payment
  payments/index.tsx   Payment list
```

## 2. Customer Invoice Screen
```typescript
// FlashList of invoices: invoice number | amount | status | date
// Status badges: DRAFT|SENT|PAID|OVERDUE (color coded)
// Tap -> invoice detail
// Download PDF: GET /api/v1/finance/invoices/:id/pdf
//   Opens with expo-sharing or downloads to device
```

## 3. Record Payment (Admin Mobile)
```typescript
// Bottom sheet (modal):
// Amount input | Method selector (Cash/Card/UPI/Bank/EMI)
// Transaction ID input (optional)
// POST /api/v1/finance/payments
// On success: invoice status updates to PAID
```

## 4. EMI Plan View (Admin Mobile)
```typescript
// Read-only on mobile: shows installment schedule
// Tap installment -> mark as paid
// Full EMI creation is web-only
```

## 5. Cross-Layer Mapping
- GET /api/v1/me/invoices             -> backend module_018
- POST /api/v1/finance/payments       -> backend module_018
- GET /api/v1/finance/invoices/:id    -> backend module_018
---
*Mobile DLD | Module 018 | Finance and Billing*
