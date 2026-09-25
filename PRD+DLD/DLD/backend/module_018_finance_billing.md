# DLD — Backend — Module 018: Finance and Billing
**Layer:** Backend | **Mapped To:** frontend/module_018 | mobile/module_018

## 1. Purpose
Invoice generation, payment recording, EMI plans, tax calculation, expense tracking.
All financial calculations are server-side authoritative.

## 2. Files
src/modules/finance/: invoice.service.ts, invoice.repository.ts, payment.service.ts, payment.repository.ts, emi.service.ts, tax.calculator.ts, tests/

## 3. API Endpoints
| Method | Path                          | Role          | Description              |
|--------|-------------------------------|---------------|--------------------------|
| GET    | /api/v1/finance/invoices      | ADMIN,ACCT    | List invoices            |
| POST   | /api/v1/finance/invoices      | ADMIN,ACCT    | Create invoice           |
| GET    | /api/v1/finance/invoices/:id  | ADMIN,ACCT    | Invoice detail           |
| PATCH  | /api/v1/finance/invoices/:id  | ADMIN,ACCT    | Update invoice           |
| POST   | /api/v1/finance/invoices/:id/send| ADMIN,ACCT | Email invoice to customer|
| GET    | /api/v1/finance/payments      | ADMIN,ACCT    | List payments            |
| POST   | /api/v1/finance/payments      | ADMIN,ACCT    | Record payment           |
| GET    | /api/v1/finance/emi-plans     | ADMIN,ACCT    | List EMI plans           |
| POST   | /api/v1/finance/emi-plans     | ADMIN,ACCT    | Create EMI plan          |
| POST   | /api/v1/finance/expenses      | ADMIN,ACCT    | Record expense           |
| GET    | /api/v1/me/invoices           | CUSTOMER      | My invoices              |

## 4. Database Migration: finance_billing
```sql
CREATE TABLE "invoices" (
  "id"              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"       UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"     UUID NOT NULL REFERENCES "showrooms"("id"),
  "invoice_number"  TEXT NOT NULL,
  "customer_id"     UUID NOT NULL REFERENCES "customers"("id"),
  "service_request_id" UUID REFERENCES "service_requests"("id"),
  "subtotal"        DECIMAL(12,2) NOT NULL,
  "tax_rate"        DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  "tax_amount"      DECIMAL(12,2) NOT NULL,
  "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total_amount"    DECIMAL(12,2) NOT NULL,
  "status"          TEXT NOT NULL DEFAULT 'DRAFT',
  "due_date"        DATE,
  "paid_at"         TIMESTAMPTZ,
  "notes"           TEXT,
  "created_at"      TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX "idx_invoice_number_tenant" ON "invoices"("invoice_number","tenant_id");
CREATE INDEX "idx_invoices_tenant"    ON "invoices"("tenant_id");
CREATE INDEX "idx_invoices_customer"  ON "invoices"("customer_id");
CREATE INDEX "idx_invoices_status"    ON "invoices"("status");

CREATE TABLE "invoice_line_items" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "invoice_id"  UUID NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "description" TEXT NOT NULL,
  "quantity"    INTEGER NOT NULL DEFAULT 1,
  "unit_price"  DECIMAL(10,2) NOT NULL,
  "total_price" DECIMAL(10,2) NOT NULL
);

CREATE TABLE "payments" (
  "id"             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "invoice_id"     UUID NOT NULL REFERENCES "invoices"("id"),
  "amount"         DECIMAL(12,2) NOT NULL,
  "method"         TEXT NOT NULL,
  "transaction_id" TEXT,
  "status"         TEXT NOT NULL DEFAULT 'COMPLETED',
  "paid_at"        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_payments_invoice"  ON "payments"("invoice_id");
CREATE INDEX "idx_payments_status"   ON "payments"("status");

CREATE TABLE "emi_plans" (
  "id"                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "invoice_id"          UUID NOT NULL UNIQUE REFERENCES "invoices"("id"),
  "tenor_months"        INTEGER NOT NULL,
  "installment_amount"  DECIMAL(12,2) NOT NULL,
  "status"              TEXT NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE "emi_installments" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "emi_plan_id" UUID NOT NULL REFERENCES "emi_plans"("id"),
  "due_date"    DATE NOT NULL,
  "amount"      DECIMAL(12,2) NOT NULL,
  "paid_at"     TIMESTAMPTZ,
  "status"      TEXT NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE "expenses" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id" UUID NOT NULL REFERENCES "showrooms"("id"),
  "category"    TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount"      DECIMAL(12,2) NOT NULL,
  "date"        DATE NOT NULL,
  "created_by"  UUID REFERENCES "users"("id"),
  "created_at"  TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Invoice Number Generation
```typescript
// Format: INV-YYYYMM-NNNN (e.g., INV-202609-0001)
async generateInvoiceNumber(tenantId: string): Promise<string> {
  const yearMonth = format(new Date(), 'yyyyMM');
  const count = await prisma.invoice.count({ where: { tenantId,
    createdAt: { gte: startOfMonth(new Date()) } } });
  return INV--;
}
```

## 6. Tax Calculator
```typescript
// GST: CGST + SGST or IGST
calculateTax(subtotal, discountAmount, taxRate):
  taxableAmount = subtotal - discountAmount
  taxAmount = (taxableAmount * taxRate) / 100
  totalAmount = taxableAmount + taxAmount
  return { taxableAmount, taxAmount, totalAmount }
```

## 7. Business Rules
- All financial calculations server-side only
- Invoice number auto-generated, never manually set
- Payment recording uses Prisma transaction
- Invoice status: DRAFT -> SENT -> PAID / PARTIALLY_PAID / OVERDUE
- Tax rate from tenant_settings (configurable per showroom)

## 8. Testing
- Invoice total = subtotal - discount + tax (correct calculation)
- Invoice number sequential within month
- Payment recording updates invoice status to PAID
- EMI installments generated correctly from tenor
---
*Backend DLD | Module 018 | Finance and Billing*
