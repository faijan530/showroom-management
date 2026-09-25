# DLD — Frontend — Module 017: Reports and Analytics
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_017 | mobile/module_017

## 1. Routes
```
app/(admin)/reports/
  page.tsx                  Reports overview
  service-performance/page.tsx  Service report
  worker-performance/page.tsx   Worker report
  revenue/page.tsx          Revenue report
  inventory/page.tsx        Inventory report
  customer/page.tsx         Customer retention report
  feedback/page.tsx         Feedback summary
```

## 2. Report Page Pattern
Each report page:
- Date range picker (from/to) + period selector (day/week/month)
- KPI summary cards at top
- Chart below (line/bar chart)
- Data table at bottom (paginated)
- Export button: PDF | Excel | CSV

## 3. Charts (Client Components)
```typescript
// Using Recharts or Chart.js
// LineChart for revenue by day
// BarChart for service requests by status
// PieChart for service category breakdown
// All charts are lazy-loaded (next/dynamic)
```

## 4. Export Button
```typescript
const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
  const blob = await apiClient.getBlob(
    '/api/v1/reports/export/revenue?format=' + format + '&from=...&to=...'
  );
  downloadFile(blob, 'revenue-report.' + format);
};
```

## 5. Cross-Layer Mapping
- GET /api/v1/reports/service-performance -> backend module_017
- GET /api/v1/reports/revenue             -> backend module_017
- GET /api/v1/reports/export/:type        -> backend module_017
---
*Frontend DLD | Module 017 | Reports and Analytics*
