# DLD — Backend — Module 003: Super Admin
**Layer:** Backend (Next.js)
**Mapped To:**
- Frontend: DLD/frontend/module_003_super_admin.md
- Mobile:   DLD/mobile/module_003_super_admin.md (read-only dashboard only)

---

## 1. Purpose
Isolated platform-level management. Super Admin manages tenants, subscriptions,
feature flags, platform analytics, and audit logs. Completely separate from showroom operations.

---

## 2. Files
```
src/modules/platform-admin/
  platform-admin.service.ts
  platform-admin.repository.ts
  platform-admin.validation.ts
  platform-admin.types.ts
  tests/
```

---

## 3. API Endpoints (all under /api/superadmin/v1/)

| Method | Path                                    | Description                  |
|--------|-----------------------------------------|------------------------------|
| POST   | /api/superadmin/v1/auth/login           | Super Admin login            |
| GET    | /api/superadmin/v1/tenants              | List all tenants             |
| POST   | /api/superadmin/v1/tenants             | Create new tenant            |
| GET    | /api/superadmin/v1/tenants/:id          | Get tenant detail            |
| PATCH  | /api/superadmin/v1/tenants/:id          | Update tenant                |
| DELETE | /api/superadmin/v1/tenants/:id          | Delete tenant                |
| POST   | /api/superadmin/v1/tenants/:id/suspend  | Suspend tenant               |
| POST   | /api/superadmin/v1/tenants/:id/reactivate| Reactivate tenant           |
| GET    | /api/superadmin/v1/analytics            | Platform analytics           |
| GET    | /api/superadmin/v1/subscriptions        | All subscriptions            |
| GET    | /api/superadmin/v1/audit-logs           | Platform audit logs          |
| GET    | /api/superadmin/v1/feature-flags        | All feature flags            |
| PATCH  | /api/superadmin/v1/feature-flags/:tid   | Update flags for tenant      |
| POST   | /api/superadmin/v1/announcements        | Create platform announcement |

---

## 4. Authorization Middleware (superadmin routes)

```typescript
// middleware enforcing Super Admin isolation
async function superAdminAuth(request: NextRequest): Promise<SuperAdminContext> {
  const token = getCookieOrBearer(request);
  const payload = verifyJwt(token, env.SUPER_ADMIN_JWT_SECRET);
  if (payload.role !== 'PLATFORM_SUPER_ADMIN') {
    throw new UnauthorizedError('SUPER_ADMIN_ONLY', 'Access denied');
  }
  return { adminId: payload.userId, role: 'PLATFORM_SUPER_ADMIN' };
}
```

Showroom Admin JWT verified with JWT_ACCESS_SECRET.
Super Admin JWT verified with SUPER_ADMIN_JWT_SECRET (different secret).
A showroom admin token CANNOT pass Super Admin verification.

---

## 5. Platform Analytics Query

```typescript
async getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const [totalTenants, activeTenants, totalShowrooms,
         totalUsers, totalServiceRequests, monthlyRevenue] =
    await prisma.([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.showroom.count(),
      prisma.user.count(),
      prisma.serviceRequest.count(),
      prisma.payment.aggregate({ _sum: { amount: true },
        where: { createdAt: { gte: startOfMonth(new Date()) } } }),
    ]);
  return { totalTenants, activeTenants, totalShowrooms,
           totalUsers, totalServiceRequests, monthlyRevenue };
}
```

---

## 6. Feature Flags Schema

```typescript
interface FeatureFlag {
  tenantId: string;
  flags: {
    enableMobileApp: boolean;
    enableFinanceModule: boolean;
    enableReports: boolean;
    enableDeals: boolean;
    enableAdvertisements: boolean;
    maxShowrooms: number;
    maxWorkers: number;
  };
}
```

---

## 7. Security Rules
- /api/superadmin/* routes reject ALL non-PLATFORM_SUPER_ADMIN tokens
- Super Admin cannot read individual customer/worker data
- Audit every Super Admin action (tenant create/suspend/delete)
- Analytics are aggregated counts only (no PII)

---

## 8. Testing

| Test        | Scenario                                            |
|-------------|-----------------------------------------------------|
| Unit        | superAdminAuth rejects showroom admin JWT           |
| Integration | GET /superadmin/v1/tenants with showroom token -> 401|
| Integration | GET /superadmin/v1/analytics returns correct counts |
| Integration | POST /superadmin/v1/tenants creates tenant          |
| Integration | POST /superadmin/v1/tenants/:id/suspend updates status|

---
*Backend DLD | Module 003 | Super Admin*
