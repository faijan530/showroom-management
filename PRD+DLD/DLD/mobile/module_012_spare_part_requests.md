# DLD — Mobile — Module 012: Spare Part Requests
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_012 | frontend/module_012

## 1. Screens
```
app/(customer)/spare-part-requests/
  index.tsx                         My requests list
  create.tsx                        Create a request
  [id].tsx                          Request status tracker
app/(admin)/spare-part-requests/
  index.tsx                         All requests (admin)
  [id].tsx                          Request detail + actions
app/(worker)/spare-part-requests/
  index.tsx                         My assigned requests
  [id].tsx                          Update order status
```

## 2. Customer Request Flow (Mobile)
```typescript
// Screen 1: Search/select part -> availability shown
// Screen 2: Quantity + note + bike selection
// Screen 3: Summary -> [Submit Request]
// POST /api/v1/spare-part-requests
// Navigate to tracker screen
```

## 3. Request Status Tracker (Customer)
Vertical stepper:
REQUESTED -> UNDER_REVIEW -> ORDERED (+ ETA shown) -> IN_TRANSIT -> RECEIVED -> READY -> COMPLETED

## 4. Worker: Update Request Screen
```typescript
// Worker sees: part name, quantity, customer note
// Input: supplierOrderId, estimatedArrival (DatePicker)
// Actions: [Mark Ordered] [Mark In Transit] [Mark Received]
```

## 5. Cross-Layer Mapping
- POST /api/v1/spare-part-requests         -> backend module_012
- GET /api/v1/me/spare-part-requests       -> backend module_012
- PATCH /api/v1/spare-part-requests/:id/*  -> backend module_012
---
*Mobile DLD | Module 012 | Spare Part Requests*
