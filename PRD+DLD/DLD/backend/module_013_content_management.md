# DLD — Backend — Module 013: Content Management
**Layer:** Backend | **Mapped To:** frontend/module_013 | mobile/module_013

## 1. Purpose
Admin-managed content: homepage banners, announcements, featured bikes/services.
Public API for customer-facing content. No code changes needed for content updates.

## 2. Files
src/modules/content/: content.service.ts, content.repository.ts, content.validation.ts, content.types.ts, tests/

## 3. API Endpoints
| Method | Path                            | Role      | Description               |
|--------|---------------------------------|-----------|---------------------------|
| GET    | /api/v1/content                 | Public    | Active content list       |
| GET    | /api/v1/content/:type           | Public    | Content by type (BANNER)  |
| POST   | /api/v1/admin/content           | ADMIN,MGR | Create content item       |
| GET    | /api/v1/admin/content           | ADMIN,MGR | All content (incl. drafts)|
| PATCH  | /api/v1/admin/content/:id       | ADMIN,MGR | Update content            |
| DELETE | /api/v1/admin/content/:id       | ADMIN     | Delete content            |
| PATCH  | /api/v1/admin/content/:id/publish  | ADMIN,MGR | Publish content         |
| PATCH  | /api/v1/admin/content/:id/unpublish| ADMIN,MGR | Unpublish content       |

## 4. Database Migration: content_management
```sql
CREATE TABLE "content_items" (
  "id"          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "tenant_id"   UUID NOT NULL REFERENCES "tenants"("id"),
  "showroom_id" UUID REFERENCES "showrooms"("id"),
  "type"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "image_url"   TEXT,
  "cta_text"    TEXT,
  "cta_url"     TEXT,
  "status"      TEXT NOT NULL DEFAULT 'DRAFT',
  "priority"    INTEGER NOT NULL DEFAULT 0,
  "start_date"  TIMESTAMPTZ,
  "end_date"    TIMESTAMPTZ,
  "created_at"  TIMESTAMPTZ DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX "idx_content_tenant_status" ON "content_items"("tenant_id","status");
```

## 5. Content Types
BANNER | ANNOUNCEMENT | FEATURED_BIKE | SERVICE_PROMOTION | SHOWROOM_UPDATE

## 6. Active Content Filter
```typescript
// Public API auto-filters:
WHERE status = 'ACTIVE'
  AND (start_date IS NULL OR start_date <= NOW())
  AND (end_date IS NULL OR end_date >= NOW())
ORDER BY priority DESC, created_at DESC
```

## 7. Cache Strategy
- Public content cached: revalidate 1800s (30 min)
- On publish/unpublish: revalidateTag('content-{tenantId}')

## 8. Business Rules
- Content scoped to showroom (can show different content per showroom)
- start_date/end_date for scheduled campaigns
- Priority controls display order (higher = first)
- Image upload via /api/v1/uploads (separate route)

## 9. Testing
- Expired content (end_date < NOW()) not returned in public API
- Draft content not in public API
- Publish action sets status ACTIVE
- Priority ordering works correctly
---
*Backend DLD | Module 013 | Content Management*
