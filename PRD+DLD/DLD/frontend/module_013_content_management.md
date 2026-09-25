# DLD — Frontend — Module 013: Content Management
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_013 | mobile/module_013

## 1. Routes
```
app/(customer)/                    Public pages consume content
  page.tsx                         Home: banners, featured bikes, announcements
app/(admin)/content/
  page.tsx                         Content list
  create/page.tsx                  Create content item
  [id]/edit/page.tsx               Edit content
```

## 2. Homepage (Server Component)
```typescript
// Server Component: fetches banners, announcements, featured bikes in parallel
const [banners, announcements, featuredBikes] = await Promise.all([
  fetch('/api/v1/content/BANNER', { next: { revalidate: 1800, tags: ['content'] } }),
  fetch('/api/v1/content/ANNOUNCEMENT', { next: { revalidate: 1800, tags: ['content'] } }),
  fetch('/api/v1/bikes?featured=true', { next: { revalidate: 3600, tags: ['bikes'] } }),
]);
```

## 3. Banner Component
- Carousel with auto-play
- next/image for optimized banner images
- CTA button links to ctaUrl
- Responsive: full-width on desktop, stacked on mobile

## 4. Admin Content Manager
WYSIWYG-lite editor for description. Image upload with preview.
Date range picker for start/end dates. Priority slider.
Status toggle: Draft / Active.

## 5. Cross-Layer Mapping
- GET /api/v1/content (Server Component, cached) -> backend module_013
- POST /api/v1/admin/content                     -> backend module_013
- Publish triggers cache revalidation (backend calls revalidateTag)
---
*Frontend DLD | Module 013 | Content Management*
