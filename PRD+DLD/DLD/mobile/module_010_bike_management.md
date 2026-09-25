# DLD — Mobile — Module 010: Bike Management
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_010 | frontend/module_010

## 1. Screens
```
app/(tabs)/bikes.tsx              Browse bike catalog tab (customer)
app/(customer)/bikes/
  [id].tsx                        Bike detail (full specs, gallery)
app/(customer)/my-bikes/
  index.tsx                       My registered bikes
  add.tsx                         Register a bike form
  [id].tsx                        My bike detail + service history
```

## 2. Bike Catalog Tab (Customer)
```typescript
// FlashList of bike cards with expo-image cached images
// Filter chips: Brand | Price range | Availability
// Tap -> bike detail screen with full-screen image gallery (expo-image)
// useQuery staleTime: 5min
```

## 3. Register Bike Form
```typescript
// Fields: brand, model, variant, year, color, registrationNumber, chassisNumber
// Option: Search from catalog -> pre-fills brand/model/variant
// POST /api/v1/me/bikes
// On success: navigate to my-bikes/:id
```

## 4. My Bike Detail
- Bike info: brand, model, year, registration number
- Service history: FlashList of past service requests
- Quick action: [Book Service for This Bike]

## 5. Cross-Layer Mapping
- GET /api/v1/bikes         -> backend module_010 (catalog)
- POST /api/v1/me/bikes     -> backend module_010
- GET /api/v1/me/bikes      -> backend module_010
---
*Mobile DLD | Module 010 | Bike Management*
