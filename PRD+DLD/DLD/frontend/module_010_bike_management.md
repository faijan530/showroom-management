# DLD — Frontend — Module 010: Bike Management
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_010 | mobile/module_010

## 1. Routes
```
app/(customer)/bikes/
  page.tsx              Browse catalog (Server Component)
  [id]/page.tsx         Bike detail
app/(customer)/my-bikes/
  page.tsx              My registered bikes
  add/page.tsx          Register a bike
  [id]/page.tsx         My bike detail
app/(admin)/bikes/
  page.tsx              Catalog management
  add/page.tsx          Add to catalog
  [id]/edit/page.tsx    Edit bike
```

## 2. Bike Catalog (Public - Server Component)
```typescript
// Server Component: data fetched on server, cached 1 hour
const bikes = await fetch('/api/v1/bikes', { next: { revalidate: 3600 } });
// Renders bike grid with next/image for optimized images
```

## 3. Register Bike Form (Customer)
```typescript
// Fields: registrationNumber, brand, model, variant, year, color, chassisNumber
// Optional: select from catalog (autocomplete) or enter manually
```

## 4. Admin Bike Catalog
DataTable with: Brand | Model | Variant | Price | Availability | Status | Actions
Filter by: brand, availability, status.

## 5. Cross-Layer Mapping
- GET /api/v1/bikes (Server Component, cached) -> backend module_010
- POST /api/v1/me/bikes                        -> backend module_010
- POST /api/v1/admin/bikes                     -> backend module_010
---
*Frontend DLD | Module 010 | Bike Management*
