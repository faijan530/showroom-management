# DLD — Frontend — Module 018: Finance and Billing
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_018 | mobile/module_018

## 1. Routes
```
app/(admin)/finance/
  page.tsx                  Finance overview
  invoices/page.tsx         Invoice list
  invoices/create/page.tsx  Create invoice
  invoices/[id]/page.tsx    Invoice detail + payment
  payments/page.tsx         Payment list
  emi-plans/page.tsx        EMI plans
  expenses/page.tsx         Expenses
app/(customer)/invoices/
  page.tsx                  My invoices
  [id]/page.tsx             Invoice detail + PDF download
```

## 2. Invoice Create Form (Admin)
```typescript
// Line items: dynamic add/remove rows
// Fields per line: description, quantity, unitPrice -> auto-calc totalPrice
// Summary: subtotal, discount input, tax auto-calc, TOTAL
// Customer select: searchable dropdown
// Service Request link: optional dropdown
```

## 3. Invoice PDF Download
```typescript
// Generates PDF client-side or fetches from backend
// GET /api/v1/finance/invoices/:id/pdf
// Opens in new tab or triggers download
```

## 4. Record Payment Modal
Payment method: Cash | Card | UPI | Bank Transfer | EMI
Transaction ID input (for card/UPI).
Amount input (supports partial payment).

## 5. EMI Plan Builder
```typescript
// Input: total amount, tenor (months)
// Auto-generates installment schedule preview
// Displays table: Installment # | Due Date | Amount | Status
```

## 6. Cross-Layer Mapping
- POST /api/v1/finance/invoices       -> backend module_018
- POST /api/v1/finance/payments       -> backend module_018
- GET /api/v1/me/invoices             -> backend module_018
---
*Frontend DLD | Module 018 | Finance and Billing*
