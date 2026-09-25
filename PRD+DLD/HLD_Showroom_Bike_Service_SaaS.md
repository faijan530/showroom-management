# HIGH-LEVEL DESIGN (HLD)
## Showroom Management + Bike Service Management SaaS

---

| Field            | Value                                          |
|------------------|------------------------------------------------|
| Document         | High-Level Design (HLD)                        |
| Version          | 1.0 Draft                                      |
| Date             | September 25, 2026                             |
| Author           | Principal Software Architect                   |
| Status           | In Review                                      |
| Depends On       | PRD_Showroom_Bike_Service_SaaS.md              |

---

## Table of Contents

1. Architecture Philosophy
2. System Context Diagram
3. Monorepo Structure
4. Frontend Architecture
5. Backend Architecture
6. Mobile Architecture
7. Shared Packages Architecture
8. Database Architecture
9. Multi-Tenancy Architecture
10. Authentication and Authorization Architecture
11. API Architecture
12. Service Layer Architecture
13. Caching Architecture
14. Notification Architecture
15. File Storage Architecture
16. Security Architecture
17. Performance Architecture
18. Deployment Architecture
19. CI/CD Architecture
20. Observability Architecture
21. Data Flow Diagrams
22. Module Interaction Map
23. Key Architectural Decisions (ADRs)
24. Phase 0 Checklist

---

## 1. Architecture Philosophy

### Core Principles

| Principle              | Description                                                              |
|------------------------|--------------------------------------------------------------------------|
| Domain-Driven          | Code organized by business domain, not technical layer                   |
| Separation of Concerns | Frontend, Backend, Mobile are independently deployable                   |
| Security by Default    | Every layer enforces auth, tenant isolation, and input validation         |
| Performance First      | Caching, pagination, Server Components, and DB indexing are mandatory    |
| Multi-Tenant Safe      | tenantId derived from JWT only, never from client input                  |
| Versioned APIs         | All APIs versioned under /api/v1/ for backward compatibility             |
| Testable by Design     | Business logic lives in services, not route handlers                     |
| Migration Discipline   | Every schema change = new Prisma migration file                          |

### Request Lifecycle (Per Layer)

`
HTTP Request
     |
     v
Next.js Middleware       (CORS, headers, rate-limit check)
     |
     v
Route Handler            (Next.js App Router Route Handler)
     |
     v
Auth Middleware           (JWT verification, session validation)
     |
     v
Authorization             (RBAC: role + tenantId + showroomId + resource)
     |
     v
Zod Validation            (body, params, query)
     |
     v
Application Service       (business logic)
     |
     v
Repository                (Prisma query, tenant-scoped)
     |
     v
PostgreSQL
     |
     v
Response Mapper           (sanitize, shape response)
     |
     v
HTTP Response
`

---

## 2. System Context Diagram

`
+------------------------------------------------------------------+
|                        INTERNET                                  |
+------------------------------------------------------------------+
        |               |                |              |
        v               v                v              v
  [Customer]     [Showroom Admin]    [Worker]    [Super Admin]
  Web + Mobile   Web + Mobile        Mobile      Web (isolated)
        |               |                |              |
        +-------+-------+----------------+--------------+
                        |
                        v
+------------------------------------------------------------------+
|              NEXT.JS FRONTEND  (frontend/)                       |
|         Customer App | Admin Panel | Worker Panel                |
+------------------------------------------------------------------+
                        |
                   HTTPS / REST
                        |
                        v
+------------------------------------------------------------------+
|              NEXT.JS BACKEND   (backend/)                        |
|   /api/v1/*            Route Handlers                            |
|   /api/superadmin/v1/* Super Admin Route Handlers                |
|                                                                  |
|   Auth > Authorization > Validation > Service > Repository       |
+------------------------------------------------------------------+
                        |
            +-----------+-----------+
            |           |           |
            v           v           v
     [PostgreSQL]  [Redis Cache]  [File Storage]
     (Prisma ORM)  (optional v2)  (S3/Cloudinary)
`

---

## 3. Monorepo Structure

`
showroom-management-saas/
|
+-- .github/
|   +-- workflows/
|       +-- ci.yml
|       +-- migration.yml
|       +-- e2e.yml
|       +-- security.yml
|       +-- build.yml
|
+-- backend/                  (Next.js API/Application Server)
+-- frontend/                 (Next.js Web UI)
+-- mobile/                   (Expo React Native App)
+-- packages/
|   +-- types/
|   +-- validation/
|   +-- config/
|   +-- eslint-config/
|
+-- PRD+DLD/
+-- turbo.json
+-- package.json
+-- .gitignore
+-- README.md
`

### Package Dependency Graph

`
frontend  ---> packages/types
frontend  ---> packages/validation
frontend  ---> packages/config

backend   ---> packages/types
backend   ---> packages/validation
backend   ---> packages/config

mobile    ---> packages/types
mobile    ---> packages/validation
mobile    ---> packages/config

RULE: backend is NEVER imported by frontend or mobile.
      Communication = HTTP API only.
`

### Turborepo Task Graph

`
turbo.json tasks:
  build     -> depends on: ^build  (build deps first)
  test      -> depends on: build
  lint      -> no deps (parallel)
  typecheck -> no deps (parallel)
  dev       -> persistent: true
`

---

## 4. Frontend Architecture

### Technology Stack
- Next.js 15 + React 19 + TypeScript + App Router
- TanStack Query (client-side server state)
- React Hook Form + Zod (forms)

### Route Groups

`
src/app/
  (customer)/       Public + authenticated customer routes
  (admin)/          Admin panel routes
  (worker)/         Worker panel routes
  (superadmin)/     Super Admin (isolated)
  auth/             Login, Register, Forgot Password
`

### Server vs Client Component Strategy

`
DEFAULT = Server Component

Use Client Component ONLY when:
  - Event handlers: onClick, onChange
  - React hooks: useState, useEffect
  - Browser APIs: window, localStorage
  - TanStack Query hooks
  - React Hook Form interactions

Server Component usage:
  - Data fetching pages
  - Layout wrappers
  - Static content rendering
  - SEO-critical pages (bikes, services, deals)
`

### Module Structure

`
src/modules/         Domain-specific components
  customer/
  service/
  worker/
  bike/
  spare-parts/
  finance/
  reports/
  content/
  notification/
  dashboard/
`

---

## 5. Backend Architecture

### Technology Stack
- Next.js 15 + TypeScript + App Router + Route Handlers
- Prisma ORM + PostgreSQL
- Zod (validation)
- jose (JWT)
- bcrypt (password hashing)

### API Routes Layout

`
src/app/api/
  health/route.ts
  v1/
    auth/
      register/route.ts
      login/route.ts
      logout/route.ts
      forgot-password/route.ts
      reset-password/route.ts
      refresh-token/route.ts
      me/route.ts
      worker/setup/route.ts
    customers/route.ts
    customers/[id]/route.ts
    customers/[id]/services/route.ts
    me/profile/route.ts
    me/bikes/route.ts
    workers/route.ts
    workers/[id]/route.ts
    workers/[id]/availability/route.ts
    services/route.ts
    service-requests/route.ts
    service-requests/[id]/route.ts
    service-requests/[id]/status/route.ts
    scheduling/calendar/route.ts
    scheduling/assign/route.ts
    bikes/route.ts
    spare-parts/route.ts
    spare-part-requests/route.ts
    content/route.ts
    deals/route.ts
    notifications/route.ts
    feedback/route.ts
    finance/invoices/route.ts
    finance/payments/route.ts
    showrooms/route.ts
    reports/service-performance/route.ts
    reports/revenue/route.ts
  superadmin/v1/
    tenants/route.ts
    analytics/route.ts
    subscriptions/route.ts
    audit-logs/route.ts
    feature-flags/route.ts
`

### Domain Modules

`
src/modules/
  auth/
  tenant/
  showroom-management/
  customer/
  worker/
  worker-availability/
  service/
  service-request/
  service-scheduling/
  bike/
  spare-parts/
  spare-parts-request/
  content/
  deals/
  notification/
  feedback/
  finance/
  reports/
  platform-admin/
  subscription/
`

### Module File Pattern

`
Each module contains:
  {name}.service.ts       Business logic
  {name}.repository.ts    Prisma queries (tenant-scoped)
  {name}.validation.ts    Zod schemas
  {name}.types.ts         TypeScript interfaces
  {name}.mapper.ts        DTO mappers
  tests/                  Unit + integration tests
`

### Shared Infrastructure

`
src/shared/
  errors/          AppError, NotFoundError, ForbiddenError, etc.
  response/        ApiResponse builder, pagination helpers
  authorization/   RBAC enforce helpers, role definitions
  audit/           AuditService

src/infrastructure/
  prisma/          Prisma client singleton
  email/           Email service + templates
  storage/         S3 / Cloudinary service
`

---

## 6. Mobile Architecture

### Technology Stack
- Expo SDK 52+ + React Native + TypeScript
- Expo Router v3
- TanStack Query
- React Hook Form + Zod
- Expo SecureStore (token storage)
- FlashList (performance lists)

### Route Layout

`
app/
  (tabs)/          Tab navigation (Home, Services, Notif, Profile)
  (customer)/      Customer-specific screens
  (worker)/        Worker-specific screens
  (admin)/         Admin mobile screens (read-only)
  auth/            Login, Register, Forgot Password
  _layout.tsx
  index.tsx
`

### Performance Patterns

`
Large Lists:       FlashList (not FlatList)
Images:            expo-image with caching
Pagination:        Cursor-based infinite scroll
Push:              Expo Notifications
Sensitive storage: Expo SecureStore (NOT AsyncStorage)
Offline:           Graceful degradation with stale cache
`

---

## 7. Shared Packages Architecture

### packages/types
`
src/
  api/
    responses.ts      APIResponse<T>, PaginatedResponse<T>
    errors.ts         ErrorCode enum
    pagination.ts     PaginationParams, PaginationMeta
  domain/
    user.types.ts     Role enum, UserStatus enum
    tenant.types.ts
    customer.types.ts
    worker.types.ts
    service.types.ts
    bike.types.ts
    spare-parts.types.ts
    finance.types.ts
`

### packages/validation
`
src/
  auth/         login, register, reset-password schemas
  customer/     create, update schemas
  worker/       create, update schemas
  service-request/ create schema
  spare-parts/  create, update schemas
  common/       pagination, id schemas
`

### packages/config
`
src/
  constants.ts   App-wide constants
  roles.ts       Role constants
  status.ts      Status enums
  limits.ts      Rate limits, pagination limits
`

---

## 8. Database Architecture

### Core Table Groups

`
PLATFORM LEVEL:
  tenants
  subscription_plans
  tenant_subscriptions
  platform_admins
  feature_flags
  platform_audit_logs

AUTH LEVEL:
  users
  refresh_tokens
  password_reset_tokens
  worker_invitations

SHOWROOM LEVEL:
  showrooms
  showroom_operating_hours

CUSTOMER LEVEL:
  customers
  customer_bikes

WORKER LEVEL:
  workers
  worker_specializations
  worker_availability

SERVICE LEVEL:
  service_catalog
  service_requests
  service_request_status_history
  service_assignments

BIKE LEVEL:
  bike_catalog
  bike_inventory

SPARE PARTS LEVEL:
  spare_parts
  spare_part_stock_movements
  spare_part_requests
  spare_part_request_status_history

CONTENT LEVEL:
  content_items
  deals
  advertisements

NOTIFICATION LEVEL:
  notifications

FEEDBACK LEVEL:
  feedback

FINANCE LEVEL:
  invoices
  invoice_line_items
  payments
  emi_plans
  emi_installments
  expenses

AUDIT LEVEL:
  audit_logs
  activity_logs
`

### Key Relationships

`
tenants          (1)----<(N) showrooms
tenants          (1)----<(N) users
showrooms        (1)----<(N) workers
showrooms        (1)----<(N) customers
showrooms        (1)----<(N) service_catalog
showrooms        (1)----<(N) service_requests
customers        (1)----<(N) customer_bikes
customers        (1)----<(N) service_requests
service_requests (1)----<(N) service_request_status_history
workers          (1)----<(N) service_assignments
invoices         (1)----<(N) payments
invoices         (1)---- (1) emi_plans
`

### Critical Indexes

`sql
-- Tenant isolation (MANDATORY on all tenant-scoped tables)
idx_{table}_tenant_id

-- Showroom scoping
idx_{table}_showroom_id

-- Query performance
idx_service_requests_status
idx_service_requests_scheduled_at
idx_service_requests_customer_id
idx_service_requests_worker_id
idx_worker_availability_worker_date
idx_spare_parts_sku
idx_spare_parts_status
idx_notifications_user_id_status
idx_audit_logs_tenant_created
idx_invoices_status

-- Composite
idx_service_requests_tenant_status
idx_service_requests_tenant_showroom
`

### Migration Naming Convention

`
Format: YYYYMMDDHHMMSS_descriptive_name

20260925090000_platform_foundation
20260925100000_authentication
20260925110000_tenant_management
20260925120000_showroom_management
20260925130000_customer_management
20260925140000_worker_management
20260925150000_service_catalog
20260925160000_service_requests
20260925170000_service_scheduling
20260925180000_bike_management
20260925190000_spare_parts_inventory
20260925200000_spare_part_requests
20260925210000_content_management
20260925220000_deals_advertisements
20260925230000_notifications
20260926090000_feedback
20260926100000_finance_billing
20260926110000_subscription_management
20260926120000_audit_logs
20260926130000_reports_indexes
`


---

## 9. Multi-Tenancy Architecture

### Isolation Model
`
Model: Shared Database + Tenant-Scoped Data (Row Level Isolation)

Every tenant-specific table contains:
  - tenant_id (NOT NULL, FK -> tenants)
  - All queries filtered by tenant_id at repository layer
  - tenant_id extracted from JWT only (never from request body)
`

### Tenant Context Flow

`
HTTP Request
     |
JWT Middleware
  -> Verify JWT signature
  -> Extract: userId, tenantId, showroomId, role
  -> Attach to Request Context
     |
Route Handler
  -> Read tenantId from Context (NOT from body/query)
     |
Service Layer
  -> Pass tenantId to all repository calls
     |
Repository Layer
  -> ALL Prisma queries include: WHERE tenant_id = tenantId
`

### Tenant Context Type

`	ypescript
interface TenantContext {
  userId: string;
  tenantId: string;
  showroomId: string | null;   // null for tenant-level users
  role: Role;
  email: string;
}
`

### Cross-Tenant Protection Rule

`	ypescript
// WRONG - never do this:
prisma.customer.findUnique({ where: { id: customerId } })

// CORRECT - always scope by tenantId:
prisma.customer.findUnique({
  where: { id: customerId, tenantId: ctx.tenantId }
})

// Even if customerId belongs to Tenant B,
// this query returns null for Tenant A (no data leak).
`

---

## 10. Authentication and Authorization Architecture

### JWT Token Strategy

`
Access Token:
  Payload: { userId, tenantId, showroomId, role, email }
  Expiry:  15 minutes
  Storage: HttpOnly cookie (web) / Expo SecureStore (mobile)

Refresh Token:
  Storage: Database (hashed) + HttpOnly cookie
  Expiry:  7 days
  Rotation: New token issued on every use
  Old token: Revoked immediately on use
`

### Auth Flows

`
LOGIN:
  POST /api/v1/auth/login
  -> Zod validate email/password
  -> Find user by email (tenant-scoped)
  -> bcrypt.compare(password, hash)
  -> Generate access + refresh tokens
  -> Store hashed refresh token in DB
  -> Set HttpOnly cookies
  -> Return: { user profile } (NO tokens in body)

REFRESH:
  POST /api/v1/auth/refresh-token
  -> Read refresh_token cookie
  -> Find + verify token in DB
  -> Rotate: generate new access + refresh tokens
  -> Revoke old refresh token
  -> Set new cookies

LOGOUT:
  POST /api/v1/auth/logout
  -> Revoke refresh token in DB
  -> Clear all auth cookies
`

### RBAC Authorization

`	ypescript
// Role check
function authorize(allowedRoles: Role[], ctx: TenantContext) {
  if (!allowedRoles.includes(ctx.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
}

// Resource-level check
function authorizeResource(
  resource: { tenantId: string; showroomId?: string },
  ctx: TenantContext
) {
  if (resource.tenantId !== ctx.tenantId) {
    throw new ForbiddenError('Cross-tenant access denied');
  }
  if (ctx.showroomId && resource.showroomId !== ctx.showroomId) {
    throw new ForbiddenError('Cross-showroom access denied');
  }
}
`

### Super Admin Isolation

`
Super Admin routes: /api/superadmin/v1/*

Separate JWT verification:
  - Checks: role === PLATFORM_SUPER_ADMIN
  - Rejects ALL other roles immediately
  - No tenantId in super admin JWT payload

Showroom admin JWT:
  - Contains tenantId, showroomId
  - Cannot authenticate to /api/superadmin/* routes
`

### Worker Invitation Flow

`
Admin                    System                   Worker
  |                        |                        |
  |-- Create Worker -----> |                        |
  |                        |-- Generate invite token|
  |                        |-- Hash + store token   |
  |                        |-- Send setup email --> |
  |                        |                        |
  |                        |     <-- Set Password --|
  |                        |-- Hash password        |
  |                        |-- Activate account     |
  |                        |-- Invalidate token     |
  |                        |                    Login|
`

---

## 11. API Architecture

### URL Structure

`
/api/health                        Health check (no auth)
/api/v1/auth/*                     Authentication
/api/v1/me/*                       Authenticated user own resources
/api/v1/customers/*                Admin: customer management
/api/v1/workers/*                  Admin: worker management
/api/v1/services/*                 Service catalog
/api/v1/service-requests/*         Service request lifecycle
/api/v1/scheduling/*               Service scheduling
/api/v1/bikes/*                    Bike catalog
/api/v1/spare-parts/*              Spare parts inventory
/api/v1/spare-part-requests/*      Spare part request workflow
/api/v1/content/*                  Public content
/api/v1/admin/content/*            Admin content management
/api/v1/deals/*                    Deals and promotions
/api/v1/notifications/*            Notifications
/api/v1/feedback/*                 Feedback
/api/v1/finance/*                  Finance and billing
/api/v1/reports/*                  Reports and analytics
/api/v1/showrooms/*                Showroom management
/api/v1/subscriptions/*            Subscription management
/api/superadmin/v1/*               Super Admin (isolated)
`

### Route Handler Pattern

`	ypescript
// Example: GET /api/v1/customers
export async function GET(request: NextRequest) {
  // 1. Authenticate
  const ctx = await getAuthContext(request);

  // 2. Authorize
  authorize([Role.SHOWROOM_ADMIN, Role.SHOWROOM_MANAGER], ctx);

  // 3. Validate
  const params = listCustomersSchema.parse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  // 4. Call service
  const result = await customerService.listCustomers(ctx.tenantId, params);

  // 5. Return response
  return ApiResponse.paginated(result.data, result.pagination);
}
`

### Standard API Response Format

`json
// Success
{ "success": true, "data": {} }

// Paginated
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1, "limit": 20, "total": 150,
    "totalPages": 8, "hasNextPage": true, "hasPreviousPage": false
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer record was not found."
  }
}
`

### Error Code Registry

`
AUTH_INVALID_CREDENTIALS        AUTH_TOKEN_EXPIRED
AUTH_TOKEN_INVALID              AUTH_ACCOUNT_LOCKED
AUTH_INSUFFICIENT_ROLE

TENANT_NOT_FOUND                TENANT_SUSPENDED
SHOWROOM_NOT_FOUND

CUSTOMER_NOT_FOUND              CUSTOMER_ALREADY_EXISTS
CUSTOMER_BLOCKED

WORKER_NOT_FOUND                WORKER_ALREADY_EXISTS
WORKER_UNAVAILABLE

SERVICE_NOT_FOUND               SERVICE_REQUEST_NOT_FOUND
SERVICE_REQUEST_INVALID_STATUS_TRANSITION
SERVICE_SCHEDULING_CONFLICT     WORKER_ALREADY_ASSIGNED

SPARE_PART_NOT_FOUND            SPARE_PART_OUT_OF_STOCK
SPARE_PART_REQUEST_NOT_FOUND

INVOICE_NOT_FOUND               PAYMENT_FAILED

VALIDATION_ERROR                RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
`

---

## 12. Service Layer Architecture

### Service Pattern

`	ypescript
export class CustomerService {
  constructor(
    private readonly repo: CustomerRepository,
    private readonly audit: AuditService,
    private readonly notify: NotificationService
  ) {}

  async listCustomers(tenantId: string, params: ListCustomersParams) {
    return this.repo.findMany(tenantId, params);
  }

  async getById(tenantId: string, id: string): Promise<CustomerDTO> {
    const c = await this.repo.findById(tenantId, id);
    if (!c) throw new NotFoundError('CUSTOMER_NOT_FOUND');
    return CustomerMapper.toDTO(c);
  }

  async create(tenantId: string, data: CreateCustomerInput) {
    const exists = await this.repo.findByEmail(tenantId, data.email);
    if (exists) throw new ConflictError('CUSTOMER_ALREADY_EXISTS');
    const customer = await this.repo.create(tenantId, data);
    await this.audit.log({ action: 'CUSTOMER_CREATED', entity: 'Customer',
      entityId: customer.id, tenantId });
    return CustomerMapper.toDTO(customer);
  }
}
`

### Repository Pattern

`	ypescript
export class CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(tenantId: string, params: ListCustomersParams) {
    const [data, total] = await this.prisma.([
      this.prisma.customer.findMany({
        where: {
          tenantId,           // ALWAYS scope by tenantId
          ...(params.search && {
            OR: [
              { firstName: { contains: params.search, mode: 'insensitive' } },
              { email: { contains: params.search, mode: 'insensitive' } },
            ],
          }),
        },
        select: {             // ALWAYS select specific fields
          id: true, firstName: true, lastName: true,
          email: true, phone: true, status: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.customer.count({ where: { tenantId } }),
    ]);
    return { data, total };
  }
}
`

### Service Request Status Machine

`
VALID TRANSITIONS:

REQUESTED        -> [UNDER_REVIEW, CANCELLED, REJECTED]
UNDER_REVIEW     -> [SCHEDULED, REJECTED, CANCELLED]
SCHEDULED        -> [ASSIGNED, RESCHEDULED, CANCELLED]
RESCHEDULED      -> [SCHEDULED, CANCELLED]
ASSIGNED         -> [IN_PROGRESS, RESCHEDULED, CANCELLED]
IN_PROGRESS      -> [WAITING_FOR_PARTS, READY_FOR_CUSTOMER]
WAITING_FOR_PARTS-> [IN_PROGRESS, CANCELLED]
READY_FOR_CUSTOMER -> [COMPLETED]
COMPLETED        -> []   (terminal)
CANCELLED        -> []   (terminal)
REJECTED         -> []   (terminal)

ACTOR PERMISSIONS:
  REQUESTED -> UNDER_REVIEW        : ADMIN, MANAGER
  UNDER_REVIEW -> SCHEDULED        : ADMIN, MANAGER
  SCHEDULED -> ASSIGNED            : ADMIN, MANAGER
  IN_PROGRESS -> WAITING_FOR_PARTS : ADMIN, MANAGER, WORKER
  IN_PROGRESS -> READY_FOR_CUSTOMER: ADMIN, MANAGER
  READY_FOR_CUSTOMER -> COMPLETED  : ADMIN, MANAGER
  * -> CANCELLED (before ASSIGNED) : ADMIN, MANAGER, CUSTOMER
  * -> REJECTED                    : ADMIN, MANAGER
`

---

## 13. Caching Architecture

### Next.js fetch() Cache (Server Components)

`
CACHEABLE (stable data):
  Bike catalog listings      -> revalidate: 3600s
  Service catalog            -> revalidate: 3600s
  Public content/banners     -> revalidate: 1800s
  Deals/promotions           -> revalidate: 1800s
  Showroom info (public)     -> revalidate: 3600s

NOT CACHED (real-time critical):
  Service request status     -> cache: 'no-store'
  Worker availability        -> cache: 'no-store'
  Notifications              -> cache: 'no-store'
  Financial data             -> cache: 'no-store'
  Admin dashboard KPIs       -> revalidate: 60s

Cache Invalidation (On Admin Action):
  Content update  -> revalidateTag('content')
  Bike update     -> revalidateTag('bikes')
  Deal update     -> revalidateTag('deals')
`

### TanStack Query (Client Side)

`
Service request status:  staleTime: 30s  (near real-time)
Worker availability:     staleTime: 30s
Notifications:           staleTime: 10s
Bike catalog:            staleTime: 5min
Service catalog:         staleTime: 5min
Customer profile:        staleTime: 1min
`

---

## 14. Notification Architecture

### Dispatcher Flow

`
Business Event Occurs
        |
NotificationService.dispatch(event, payload)
        |
NotificationDispatcher
  -> Determine recipients (customer/worker/admin)
  -> Determine channels (in-app, email)
  -> Create notification records in DB
  -> Call each channel adapter

Channel Adapters:
  InAppChannel  -> INSERT into notifications table
  EmailChannel  -> Nodemailer / Resend API (v1.0)
  SmsChannel    -> Twilio (v2.0)
  PushChannel   -> Expo Push Notifications (v2.0)
`

### Notification Events

`
SERVICE_REQUEST_RECEIVED      SERVICE_REQUEST_SCHEDULED
SERVICE_WORKER_ASSIGNED       SERVICE_IN_PROGRESS
SERVICE_WAITING_FOR_PARTS     SERVICE_COMPLETED
SERVICE_RESCHEDULED           SERVICE_CANCELLED
SPARE_PART_REQUEST_RECEIVED   SPARE_PART_ORDERED
SPARE_PART_RECEIVED           LOW_STOCK_ALERT
WORKER_TASK_ASSIGNED          FEEDBACK_RECEIVED
PAYMENT_RECEIVED              SUBSCRIPTION_EXPIRING
`

---

## 15. File Storage Architecture

### Storage Strategy

`
Development: Local filesystem (tmp/uploads)
Production:  AWS S3 / Cloudinary

Storage Paths:
  /bikes/{bikeId}/{uuid}.{ext}
  /spare-parts/{partId}/{uuid}.{ext}
  /content/{contentId}/{uuid}.{ext}
  /workers/{workerId}/{uuid}.{ext}
  /customers/{customerId}/{uuid}.{ext}
  /invoices/{invoiceId}/{uuid}.pdf
  /ads/{adId}/{uuid}.{ext}
`

### Upload Validation Rules

`
Allowed image MIME types:  image/jpeg, image/png, image/webp
Max image size:            5 MB
Max PDF size:              10 MB
File naming:               UUIDv4 generated (NEVER use original filename)
Extension:                 Derived from MIME type (not filename)
Rejected files:            .exe, .sh, .js, .php, .bat (all executables)
`

---

## 16. Security Architecture

### Defense in Depth Layers

`
Layer 1: Network
  HTTPS only (TLS 1.2+) | CORS whitelist | Firewall rules

Layer 2: Middleware
  Security headers | Rate limiting | Request size limits | Brute force protection

Layer 3: Authentication
  JWT signature verify | Token expiry | Session invalidation | Refresh rotation

Layer 4: Authorization
  RBAC role check | Tenant isolation | Showroom scope | Resource ownership

Layer 5: Input Validation
  Zod schemas | File upload validation | SQL injection via Prisma | XSS via CSP

Layer 6: Business Logic
  Status machine guards | Cross-entity ownership checks | Server-side finance calc

Layer 7: Database
  Prisma parameterized queries | tenantId on every query | Principle of least privilege

Layer 8: Audit
  All sensitive operations logged | Append-only audit log | Actor + timestamp
`

### HTTP Security Headers

`
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=()
`

### Rate Limiting Matrix

`
Endpoint                     Limit           Window
POST /auth/login             5 attempts      15 min
POST /auth/register          3 attempts      1 hour
POST /auth/forgot-password   3 requests      1 hour
POST /auth/reset-password    5 attempts      1 hour
POST /service-requests       10 requests     1 hour
POST /feedback               5 submissions   1 hour
GET  /api/v1/* (user)        100 requests    1 min
GET  /api/v1/* (admin)       200 requests    1 min
`

---

## 17. Performance Architecture

### Next.js Performance Strategy

`
Server Components (default):
  - Data fetching server-side (no client waterfall)
  - Only interactive sections = Client Components

Image Optimization:
  - next/image (automatic WebP, lazy loading, srcset)

Code Splitting:
  - Automatic per-route splitting
  - Dynamic imports for charts, calendars (next/dynamic)

Typography:
  - next/font (eliminate FOUT)
  - Font subset loading

Bundle:
  - Tree shaking via ESM
  - @next/bundle-analyzer for audit
`

### Backend Performance Rules

`
Database:
  - Select only required fields (NEVER select *)
  - All list queries use indexes
  - Cursor pagination for large datasets
  - Prisma  for atomic operations
  - Connection pooling (PgBouncer / Prisma Accelerate)

API:
  - Pagination mandatory on all list endpoints
  - Response compression (gzip)
  - Parallel data fetching (Promise.all)
  - N+1 prevention (Prisma include with select)
`

### Query Performance Targets

`
Single record fetch:    < 5ms
List query paginated:   < 20ms
Complex report query:   < 200ms
Dashboard aggregates:   < 100ms
API response p95:       < 200ms
Page load (FCP):        < 1.5s
`

---

## 18. Deployment Architecture

### Infrastructure (Production Target)

`
                     [CDN / Edge Network]
                              |
               +--------------+--------------+
               |                             |
        [Frontend]                     [Backend]
     Vercel / Netlify               Vercel / Railway
     (Next.js frontend)             (Next.js backend)
               |                             |
               +--------------+--------------+
                              |
                     [Load Balancer]
                              |
               +--------------+--------------+
               |              |              |
        [PostgreSQL]      [Redis]      [File Storage]
        (Supabase/Neon)  (Upstash v2)  (AWS S3)
                              |
                     [Email Service]
                     (Resend / Sendgrid)
`

### Environment Variables (backend .env.example)

`env
# Database
DATABASE_URL=postgresql://user:password@host:5432/showroom_db

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Super Admin (isolated secret)
SUPER_ADMIN_JWT_SECRET=isolated-super-admin-secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email (SMTP)
EMAIL_FROM=noreply@showroom.app
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# File Storage
STORAGE_PROVIDER=local
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_LOGIN_MAX=5

NODE_ENV=development
`

---

## 19. CI/CD Architecture

### GitHub Actions Workflows

`
ci.yml            (push / PR to any branch)
  jobs:
    install       npm ci (cached via Turborepo)
    lint          turbo lint
    typecheck     turbo typecheck
    unit-tests    turbo test:unit
    integration   turbo test:integration (test DB)
    build         turbo build

migration.yml     (push / PR to main)
  jobs:
    validate      prisma validate
    migrate-test  prisma migrate deploy (test database)
    generate      prisma generate

e2e.yml           (PR to main)
  jobs:
    e2e-tests     Playwright (against staging environment)

security.yml      (push + daily schedule)
  jobs:
    audit         npm audit --audit-level=high
    secrets-scan  gitleaks
    dep-check     Snyk

build.yml         (PR to main)
  jobs:
    build-frontend  next build (frontend)
    build-backend   next build (backend)
    build-mobile    expo export (mobile)
`

### Turborepo Cache Config

`json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "lint": { "outputs": [] },
    "typecheck": { "outputs": [] },
    "test": { "dependsOn": ["build"], "outputs": ["coverage/**"] },
    "dev": { "cache": false, "persistent": true }
  }
}
`

---

## 20. Observability Architecture

### Structured Logging

`
Log format: JSON (structured)

{
  "timestamp": "ISO 8601",
  "level": "INFO",
  "correlationId": "req-uuid",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "service": "backend",
  "module": "service-request",
  "message": "Service request status updated",
  "metadata": {
    "serviceRequestId": "...",
    "fromStatus": "SCHEDULED",
    "toStatus": "ASSIGNED"
  }
}

NEVER LOG: passwords, JWT tokens, card numbers, raw PII
`

### Audit Log Schema

`	ypescript
interface AuditLog {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;          // e.g. SERVICE_REQUEST_ASSIGNED
  entity: string;          // e.g. ServiceRequest
  entityId: string;
  tenantId: string;
  showroomId: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

Rules:
  - Append-only (no UPDATE, no DELETE on audit_logs)
  - Indexed by tenantId + createdAt
  - Retained minimum 90 days
  - Viewable by OWNER, ADMIN, SUPER_ADMIN
`

### Health Check

`json
GET /api/health
{
  "status": "ok",
  "timestamp": "2026-09-25T09:49:00.000Z",
  "services": {
    "database": "ok",
    "email": "ok",
    "storage": "ok"
  },
  "version": "1.0.0"
}
`

---

## 21. Data Flow Diagrams

### Flow 1: Customer Books a Service

`
CUSTOMER (Web/Mobile)
  POST /api/v1/service-requests
  body: { bikeId, serviceId, preferredDate, issue }
         |
         v
  BACKEND: Authenticate -> Authorize (CUSTOMER) -> Validate (Zod)
         |
  ServiceRequestService.create(tenantId, customerId, data)
         |
  ServiceRequestRepository.create(...)
         |
  AuditService.log(SERVICE_REQUEST_CREATED)
         |
  NotificationService.dispatch(SERVICE_REQUEST_RECEIVED)
    -> InApp: notify customer
    -> InApp: notify admin
    -> Email: admin
         |
  RESPONSE: { serviceRequest }

ADMIN (Web/Mobile)
  Reviews request -> assigns worker + schedule
  PATCH /api/v1/scheduling/assign
  body: { serviceRequestId, workerId, scheduledAt }
         |
  ConflictDetector.check(workerId, scheduledAt, duration)
         |
  ServiceRequestRepository.updateStatus(ASSIGNED)
         |
  NotificationService.dispatch(SERVICE_WORKER_ASSIGNED)
    -> Customer notified with confirmed time
`

### Flow 2: Unavailable Spare Part Request

`
CUSTOMER
  POST /api/v1/spare-part-requests
  { sparePartId, quantity, bikeId }
         |
  SparePartService.checkAvailability -> OUT_OF_STOCK
         |
  SparePartRequestService.create (status: REQUESTED)
         |
  Admin notified -> assigns worker

WORKER
  Orders part from supplier
  PATCH /api/v1/spare-part-requests/:id
  { estimatedArrival, supplierOrderId, status: ORDERED }
         |
  Admin confirms ETA -> Customer notified

WORKER (part arrives)
  PATCH /api/v1/spare-part-requests/:id/received
         |
  SparePartStockService.adjustStock(+quantity)
         |
  Customer notified: "Part ready for pickup"
`

### Flow 3: Worker Task Lifecycle

`
WORKER (Mobile)
  GET /api/v1/me/assignments      (today's tasks)
         |
  POST /api/v1/service-requests/:id/task/start
    -> ASSIGNED -> IN_PROGRESS
    -> actualStart recorded
    -> Customer notified
         |
  (missing part discovered)
  POST /api/v1/service-requests/:id/task/waiting-for-parts
    -> IN_PROGRESS -> WAITING_FOR_PARTS
    -> Customer notified
         |
  (part arrives)
  POST /api/v1/service-requests/:id/task/resume
    -> WAITING_FOR_PARTS -> IN_PROGRESS
         |
  POST /api/v1/service-requests/:id/task/complete
    -> IN_PROGRESS -> READY_FOR_CUSTOMER
    -> actualCompletion recorded
    -> Customer notified: "Bike is ready!"
         |
ADMIN: Confirms pickup -> COMPLETED -> Generates Invoice -> Payment
`

---

## 22. Module Interaction Map

`
+------------+  creates   +------------------+
| Customer   |----------> | Service Request   |
+------------+            +------------------+
                                 |
                          assigned to
                                 |
+------------+  manages   +------v-----------+
| Admin      |----------> | Worker           |
+------------+            +------------------+
      |                          |
 schedules                  updates task
      |                          |
      v                          v
+------------------+    +------------------+
| Service Schedule |    | Task Status       |
+------------------+    +------------------+
      |                          |
 triggers                  may request
      v                          v
+------------------+    +------------------+
| Notifications    |    | Spare Part Request|
+------------------+    +------------------+
      |                          |
 sent to all actors        triggers
      v                          v
+------------------+    +------------------+
| Customer/Worker/ |    | Inventory Update  |
| Admin            |    +------------------+
+------------------+
      |
 after completion
      v
+------------------+  generates  +------------------+
| Finance          | <---------- | Completed Service |
+------------------+             +------------------+
      |
 creates
      v
+------------------+
| Invoice + Payment|
+------------------+
      |
 captured in
      v
+------------------+
| Reports          |
+------------------+
`

---

## 23. Key Architectural Decisions (ADRs)

### ADR-001: Next.js for Both Frontend and Backend
`
Decision: Use Next.js (Route Handlers) as API/backend framework.
Rationale:
  - Single tech stack reduces overhead
  - Production-grade API handlers built-in
  - Shared TypeScript types and validation
  - Independent deployment still possible
Rejected: Express.js (per requirements), NestJS (complexity), Fastify
`

### ADR-002: Shared DB with Row-Level Tenant Isolation
`
Decision: Single PostgreSQL + tenantId column on all tables.
Rationale:
  - Simpler operations vs per-tenant databases
  - Sufficient performance with proper indexing
  - Easier cross-tenant analytics for Super Admin
Trade-offs:
  - Strict tenantId enforcement required at app layer
  - Noisy neighbor risk (mitigated by query optimization)
`

### ADR-003: Turborepo with backend/frontend/mobile Layout
`
Decision: Keep backend/, frontend/, mobile/ as top-level directories.
Rationale: Matches intended project conventions, clear separation.
Rejected: apps/ structure
`

### ADR-004: Prisma Migrations Only (No db push in production)
`
Decision: All schema changes via prisma migrate dev / deploy.
Rationale:
  - Version-controlled, reviewable migration history
  - Safe CI/CD pipeline rollouts
  - Each domain phase = one migration file
Rule: NEVER modify a migration applied to staging/prod. New migration only.
`

### ADR-005: JWT in HttpOnly Cookies
`
Decision: Store JWT in HttpOnly + Secure + SameSite=Strict cookies (web).
Rationale:
  - HttpOnly prevents XSS-based theft
  - SameSite prevents CSRF exploitation
  - Automatic inclusion in requests
Mobile: Expo SecureStore (encrypted native storage) + Bearer header
`

### ADR-006: Server-Side Status Machines
`
Decision: Explicit status state machines enforced server-side.
Rationale:
  - Prevents invalid transitions from any client
  - Centralizes business rules
  - Clear audit trail per status change
Implementation:
  service-request.status-machine.ts
  spare-parts-request.status-machine.ts
`

---

## 24. Phase 0 Checklist

`
REPOSITORY
[ ] showroom-management-saas/ initialized
[ ] .gitignore (no .env, no node_modules, no .next)
[ ] turbo.json configured
[ ] Root package.json with npm workspaces
[ ] README.md created

BACKEND (Next.js)
[ ] backend/ created as Next.js 15 app
[ ] App Router + TypeScript strict mode
[ ] Prisma installed and connected
[ ] schema.prisma with base models
[ ] First migration: platform_foundation
[ ] /api/health route working
[ ] .env.example (no real secrets)
[ ] NO Express.js dependency

FRONTEND (Next.js)
[ ] frontend/ created as Next.js 15 app
[ ] App Router + TypeScript strict mode
[ ] TanStack Query configured
[ ] .env.example created

MOBILE (Expo)
[ ] mobile/ created with Expo SDK
[ ] Expo Router v3 configured
[ ] TypeScript configured
[ ] .env.example created

SHARED PACKAGES
[ ] packages/types created and published internally
[ ] packages/validation created
[ ] packages/config created
[ ] packages/eslint-config created
[ ] All packages referenced from apps

TURBOREPO
[ ] turbo lint works across all packages
[ ] turbo typecheck works
[ ] turbo build works
[ ] turbo test works

SECURITY
[ ] .gitignore prevents .env commit
[ ] No secrets anywhere in codebase
[ ] .env.example with dummy values only

CI/CD
[ ] .github/workflows/ci.yml created
[ ] .github/workflows/migration.yml created
[ ] Turborepo cache configured

DOCUMENTATION
[ ] PRD_Showroom_Bike_Service_SaaS.md in PRD+DLD/
[ ] HLD_Showroom_Bike_Service_SaaS.md in PRD+DLD/
[ ] README.md at root
`

---

*Document: HLD v1.0 — Showroom Management + Bike Service Management SaaS*
*Next: DLD (Detailed Level Design) per module*
*Project Folder: C:\Users\faizadev\Desktop\showroom-management*
