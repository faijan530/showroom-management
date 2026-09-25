# DLD — Mobile — Module 017: Reports and Analytics
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_017 | frontend/module_017

## 1. Scope
Mobile reports are summary/read-only. Full analysis and export on web panel.

## 2. Screens (Admin Mobile)
```
app/(admin)/reports/
  index.tsx             Reports summary (KPI overview)
  service.tsx           Service performance snapshot
  revenue.tsx           Revenue snapshot with chart
```

## 3. Reports Summary
```typescript
// KPI cards in 2x2 grid:
// Total Services | Completed | Revenue | Average Rating
// Period selector: Today | This Week | This Month
// useQuery: GET /api/v1/reports/service-performance?period=month
```

## 4. Revenue Chart (Mobile)
```typescript
// Small sparkline or bar chart using Victory Native or React Native Chart Kit
// Last 7 days revenue bar chart
// Total revenue KPI card above
```

## 5. Cross-Layer Mapping
- GET /api/v1/reports/service-performance -> backend module_017
- GET /api/v1/reports/revenue             -> backend module_017
- Full export is web-only feature
---
*Mobile DLD | Module 017 | Reports and Analytics*
