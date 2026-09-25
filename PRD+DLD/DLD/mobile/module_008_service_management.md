# DLD — Mobile — Module 008: Service Management (Customer)
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_008 | frontend/module_008

## 1. Screens
```
app/(tabs)/services.tsx             Browse services tab
app/(customer)/services/
  [id].tsx                          Service detail
  book.tsx                          Book a service (multi-step)
  requests/index.tsx                My service requests
  requests/[id].tsx                 Request status tracker
```

## 2. Book Service Flow (Multi-Step)
```typescript
// Step 1: Select bike from FlashList of my bikes
// Step 2: Browse and select service (or skip for custom description)
// Step 3: Describe issue (TextInput multiline)
// Step 4: Pick preferred date (DateTimePicker) + time slot
// Step 5: Review screen -> [Confirm Booking]
// POST /api/v1/service-requests
// Navigate to requests/[id] on success
```

## 3. Request Status Screen
```typescript
// Vertical timeline component showing all status steps
// Current step highlighted in primary color
// Each step shows: status label + timestamp + note (if any)
// Auto-refresh every 30s via refetchInterval
```

## 4. Services Browse (Customer Tab)
```typescript
// FlashList of service cards
// Filter chips: ALL | GENERAL | ENGINE | ELECTRICAL | TYRES | ...
// useQuery staleTime: 5min (catalog doesn't change often)
```

## 5. Cross-Layer Mapping
- GET /api/v1/services                   -> backend module_008
- POST /api/v1/service-requests          -> backend module_008
- GET /api/v1/me/service-requests        -> backend module_008
- GET /api/v1/service-requests/:id       -> backend module_008
---
*Mobile DLD | Module 008 | Service Management*
