# DLD — Frontend — Module 005: Showroom Management
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_005 | mobile/module_005

## 1. Purpose
Admin manages showrooms (create, edit, operating hours). Multi-showroom switcher.

## 2. Routes
```
app/(admin)/showrooms/
  page.tsx              List of showrooms
  create/page.tsx       Create showroom form
  [id]/page.tsx         Showroom detail
  [id]/edit/page.tsx    Edit showroom
  [id]/users/page.tsx   Showroom user list
```

## 3. Showroom Switcher (Header)
```typescript
// In admin header: dropdown of showrooms the user has access to
// On switch: update selected showroomId in auth context
// All subsequent API calls include showroomId from context
```

## 4. Create Showroom Form
Fields: name, code, address, city, state, pincode, phone, email, operatingHours (per-day time picker).

## 5. Operating Hours Component
Day-by-day schedule picker:
Monday: [open toggle] [09:00 AM] [to] [07:00 PM]
...Sunday

## 6. Cross-Layer Mapping
- GET/POST /api/v1/showrooms -> backend module_005
- Showroom context used in all admin API calls
---
*Frontend DLD | Module 005 | Showroom Management*
