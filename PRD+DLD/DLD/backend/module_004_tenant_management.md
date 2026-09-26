# DLD — Backend — Module 004: Showroom Data Isolation & Scoping
## Showroom Application

**Layer:** Backend (Next.js)

---

## 1. Purpose
Replaces obsolete SaaS tenant management with strict **Showroom Data Isolation**. Ensures every Admin, Worker, and Inventory Manager can ONLY query, view, update, or manage data attached to their assigned `showroom_id`.

---

## 2. Server-Side Scoping Rules

```typescript
// Example Prisma Query Extension for Showroom Isolation
export function getShowroomScopedWhere(user: AuthUser, baseWhere: object = {}) {
  if (user.role === 'SUPERADMIN' || user.role === 'USER') {
    return baseWhere;
  }
  return {
    ...baseWhere,
    showroom_id: user.showroom_id,
  };
}
```

---

## 3. Guarantees
- Showroom A Admin cannot access Showroom B vehicles, spare parts, worker jobs, or customer enquiries.
- Prevent parameter tampering (e.g. sending `showroom_id` in request body is ignored; the server relies exclusively on JWT claims).
