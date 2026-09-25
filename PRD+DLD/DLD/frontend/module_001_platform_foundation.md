# DLD — Frontend — Module 001: Platform Foundation
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_001 | mobile/module_001

## 1. Purpose
Next.js frontend app setup: App Router, shared layout, API client, TanStack Query config,
global error boundary, design system foundation.

## 2. Directory Structure
```
frontend/src/
  app/
    layout.tsx             Root layout (font, QueryProvider, Toaster)
    not-found.tsx          Global 404 page
    error.tsx              Global error boundary
    loading.tsx            Global loading skeleton
    globals.css            Design tokens, base styles
  lib/
    query-client.ts        TanStack Query client config
    api-client.ts          Base fetch wrapper with error handling
  components/
    ui/                    Button, Input, Badge, Card, Modal, Toast
    layout/                Header, Sidebar, Footer, PageWrapper
    data-display/          Table, DataTable, StatCard, EmptyState
    feedback/              Toast, Alert, Spinner, Skeleton
  utils/
    format.ts              Date, currency, number formatters
    cn.ts                  className utility
```

## 3. API Client
```typescript
// lib/api-client.ts
async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
    ...options,
    credentials: 'include',  // sends HttpOnly cookies automatically
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new ApiError(err.error.code, err.error.message, res.status);
  }
  return res.json();
}
```

## 4. TanStack Query Setup
```typescript
// lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,    // 1 min default
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## 5. Root Layout
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## 6. Design System (globals.css)
CSS custom properties: --color-primary, --color-secondary, --color-background,
--color-surface, --radius-md, --spacing-*, --font-sans

## 7. Health Check Usage
Admin dashboard shows system status badge by calling GET /api/health.
Frontend polls every 5 minutes. Red badge if degraded.

## 8. Cross-Layer Mapping
- Calls GET /api/health from backend module_001
- QueryProvider wraps all pages for TanStack Query
---
*Frontend DLD | Module 001 | Platform Foundation*
