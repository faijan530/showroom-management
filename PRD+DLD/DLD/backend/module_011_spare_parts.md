# DLD — Backend — Module 011: Spare Parts
**Layer:** Backend | **Mapped To:** frontend/module_011 | mobile/module_011

## 1. Purpose
Spare parts inventory management with stock tracking, low-stock alerts, and supplier info.

## 2. Files
src/modules/spare-parts/: spare-parts.service.ts, spare-parts.repository.ts, spare-parts.validation.ts, spare-parts.types.ts, inventory.service.ts, tests/

## 3. API Endpoints
| Method | Path                                 | Role      | Description               |
|--------|--------------------------------------|-----------|---------------------------|
| GET    | /api/v1/spare-parts                  | Public    | Browse spare parts        |
| GET    | /api/v1/spare-parts/:id              | Public    | Spare part detail         |
| POST   | /api/v1/admin/spare-parts            | ADMIN,MGR | Add spare part            |
| PATCH  | /api/v1/admin/spare-parts/:id        | ADMIN,MGR | Update spare part         |
| DELETE | /api/v1/admin/spare-parts/:id        | ADMIN     | Remove spare part         |
| GET    | /api/v1/admin/spare-parts/low-stock  | ADMIN,MGR | Low stock alerts          |
| POST   | /api/v1/admin/spare-parts/:id/adjust | ADMIN,MGR | Manual stock adjustment   |

## 4. Database Migration: spare_parts_inventory
```sql
CREATE TABLE "spare_parts" (
  "id"             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"      UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id"    UUID NOT NULL REFERENCES "showrooms"("id"),
  "name"           TEXT NOT NULL,
  "sku"            TEXT NOT NULL,
  "category"       TEXT,
  "compatibility"  TEXT[] DEFAULT '{}',
  "quantity"       INTEGER NOT NULL DEFAULT 0,
  "minimum_stock"  INTEGER NOT NULL DEFAULT 5,
  "price"          DECIMAL(10,2) NOT NULL DEFAULT 0,
  "cost_price"     DECIMAL(10,2),
  "supplier"       TEXT,
  "status"         TEXT NOT NULL DEFAULT 'IN_STOCK',
  "images"         TEXT[] DEFAULT '{}',
  "description"    TEXT,
  "created_at"     TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX "idx_spare_parts_sku_tenant"    ON "spare_parts"("sku","tenant_id");
CREATE INDEX "idx_spare_parts_tenant_id"            ON "spare_parts"("tenant_id");
CREATE INDEX "idx_spare_parts_showroom_id"          ON "spare_parts"("showroom_id");
CREATE INDEX "idx_spare_parts_status"               ON "spare_parts"("status");

CREATE TABLE "spare_part_stock_movements" (
  "id"            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "spare_part_id" UUID NOT NULL REFERENCES "spare_parts"("id"),
  "type"          TEXT NOT NULL,
  "quantity"      INTEGER NOT NULL,
  "before_qty"    INTEGER NOT NULL,
  "after_qty"     INTEGER NOT NULL,
  "reason"        TEXT,
  "actor_id"      UUID,
  "created_at"    TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Stock Status Auto-Update Logic
```typescript
function computeStatus(quantity: number, minimumStock: number): SparePartStatus {
  if (quantity === 0)           return 'OUT_OF_STOCK';
  if (quantity <= minimumStock) return 'LOW_STOCK';
  return 'IN_STOCK';
}
// Called on every stock adjustment
```

## 6. Stock Adjustment (Atomic Transaction)
```typescript
async adjustStock(sparePartId, tenantId, delta, reason, actorId):
  prisma.([
    prisma.sparePart.update({ where: { id, tenantId },
      data: { quantity: { increment: delta }, status: computeStatus(...) } }),
    prisma.sparePartStockMovement.create({ ... })
  ])
```

## 7. Business Rules
- SKU unique per tenant
- Low stock alert auto-generated when quantity <= minimumStock
- Stock movement history immutable (append-only)
- Negative stock not allowed (adjustStock validates delta)

## 8. Testing
- Stock adjustment creates movement record
- quantity = 0 -> status auto-set to OUT_OF_STOCK
- quantity <= minimumStock -> status LOW_STOCK
- Low stock alert returns only parts below minimum
---
*Backend DLD | Module 011 | Spare Parts*
