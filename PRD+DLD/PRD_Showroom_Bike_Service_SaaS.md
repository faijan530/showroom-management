# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Showroom Management + Bike Service Management SaaS

---

| Field | Value |
|-------|-------|
| **Product Name** | Showroom Management + Bike Service Management SaaS |
| **Version** | 1.0 — Draft |
| **Date** | September 25, 2026 |
| **Author** | Principal Product Engineer |
| **Status** | In Review |
| **Classification** | Internal — Confidential |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Mission](#2-product-vision--mission)
3. [Problem Statement](#3-problem-statement)
4. [Target Personas](#4-target-personas)
5. [Platform Architecture Overview](#5-platform-architecture-overview)
6. [Multi-Tenancy Model](#6-multi-tenancy-model)
7. [Technology Decisions](#7-technology-decisions)
8. [System Panels & Modules](#8-system-panels--modules)
   - [8.1 Customer Web Application](#81-customer-web-application)
   - [8.2 Showroom Admin Panel](#82-showroom-admin-panel)
   - [8.3 Worker Panel](#83-worker-panel)
   - [8.4 Super Admin Panel](#84-super-admin-panel)
   - [8.5 Mobile Application](#85-mobile-application)
9. [Feature Modules — Detailed Requirements](#9-feature-modules--detailed-requirements)
   - [Module 001 — Platform Foundation](#module-001--platform-foundation)
   - [Module 002 — Authentication](#module-002--authentication)
   - [Module 003 — Super Admin](#module-003--super-admin)
   - [Module 004 — Tenant Management](#module-004--tenant-management)
   - [Module 005 — Showroom Management](#module-005--showroom-management)
   - [Module 006 — Customer Management](#module-006--customer-management)
   - [Module 007 — Worker Management](#module-007--worker-management)
   - [Module 008 — Service Management](#module-008--service-management)
   - [Module 009 — Service Scheduling](#module-009--service-scheduling)
   - [Module 010 — Bike Management](#module-010--bike-management)
   - [Module 011 — Spare Parts](#module-011--spare-parts)
   - [Module 012 — Spare Part Requests](#module-012--spare-part-requests)
   - [Module 013 — Content Management](#module-013--content-management)
   - [Module 014 — Deals & Advertisements](#module-014--deals--advertisements)
   - [Module 015 — Notifications](#module-015--notifications)
   - [Module 016 — Feedback](#module-016--feedback)
   - [Module 017 — Reports & Analytics](#module-017--reports--analytics)
   - [Module 018 — Finance & Billing](#module-018--finance--billing)
   - [Module 019 — Subscription Management](#module-019--subscription-management)
   - [Module 020 — Mobile Application](#module-020--mobile-application)
10. [RBAC — Role-Based Access Control](#10-rbac--role-based-access-control)
11. [Security Requirements](#11-security-requirements)
12. [Performance Requirements](#12-performance-requirements)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Development Phases](#14-development-phases)
15. [API Design Standards](#15-api-design-standards)
16. [Testing Requirements](#16-testing-requirements)
17. [CI/CD Requirements](#17-cicd-requirements)
18. [Observability & Audit](#18-observability--audit)
19. [Success Metrics & KPIs](#19-success-metrics--kpis)
20. [Out of Scope — v1.0](#20-out-of-scope--v10)

---

## 1. Executive Summary

This document defines the full product requirements for the **Showroom Management + Bike Service Management SaaS** — a production-grade, multi-tenant, cloud-native platform designed to digitize, automate, and optimize the complete lifecycle of automobile showroom operations and bike service management.

The platform serves five distinct user panels:

| Panel | Primary Users |
|-------|--------------|
| Customer Web Application | End customers |
| Showroom Admin Panel | Owners, Admins, Managers, Accountants |
| Worker Panel | Mechanics, Technicians |
| Super Admin Panel | Platform operators |
| Mobile Application | Customers + Workers + Admins |

The system is built as a **true multi-tenant SaaS** where each tenant (showroom business) gets complete data isolation, role-scoped access, and showroom-level operations.

---

## 2. Product Vision & Mission

### Vision
To be the operating system for every motorcycle showroom and service center — enabling them to deliver exceptional customer experience through technology.

### Mission
Provide a unified, secure, high-performance platform that:
- Eliminates manual, paper-based showroom and service center operations
- Gives customers full transparency into their bike and service lifecycle
- Empowers workers with structured task management and real-time communication
- Provides admins and owners with actionable business intelligence
- Scales from a single showroom to a nationwide showroom chain under one SaaS subscription

---

## 3. Problem Statement

### Current Reality
Motorcycle showrooms and service centers today operate with:
- Manual paper job cards for service
- WhatsApp for customer communication
- Excel for inventory and spare parts tracking
- Manual scheduling causing worker overload or underutilization
- No customer visibility into service status
- No structured spare-part request or ordering workflow
- No audit trail for business operations
- No centralized reporting for multi-showroom operations

### Consequences
- Customer dissatisfaction due to lack of transparency
- Lost revenue due to poor inventory management
- Worker inefficiency due to unstructured task assignments
- Owner blind spots due to no real-time business data
- No ability to scale without increasing manual overhead

### Solution
A comprehensive SaaS platform that digitizes every touchpoint: from customer bike registration to service completion, from spare-part request to delivery, from showroom inventory to financial reporting.

---

## 4. Target Personas

### 4.1 Persona: Customer (Bike Owner)
| Field | Detail |
|-------|--------|
| **Who** | Motorcycle owner who buys bikes and avails service |
| **Goal** | Browse bikes, book services, track status, request parts |
| **Pain Points** | No transparency in service, no booking system, poor communication |
| **Tech Comfort** | Moderate — uses smartphone apps daily |

### 4.2 Persona: Showroom Admin / Owner
| Field | Detail |
|-------|--------|
| **Who** | Showroom owner or business administrator |
| **Goal** | Manage operations, staff, finances, and customer satisfaction |
| **Pain Points** | No central dashboard, manual processes, no reporting |
| **Tech Comfort** | Moderate — comfortable with web tools |

### 4.3 Persona: Showroom Manager
| Field | Detail |
|-------|--------|
| **Who** | Day-to-day operations manager |
| **Goal** | Coordinate workers, schedule services, manage requests |
| **Pain Points** | Worker availability conflicts, manual scheduling |
| **Tech Comfort** | Moderate to High |

### 4.4 Persona: Worker (Mechanic / Technician)
| Field | Detail |
|-------|--------|
| **Who** | Workshop mechanic or service technician |
| **Goal** | Know daily schedule, complete tasks, request parts |
| **Pain Points** | Unclear task assignments, no structured workflow |
| **Tech Comfort** | Low to Moderate — primarily mobile user |

### 4.5 Persona: Accountant
| Field | Detail |
|-------|--------|
| **Who** | Finance staff managing invoices and payments |
| **Goal** | Manage billing, track payments, generate financial reports |
| **Pain Points** | Manual invoice generation, no payment tracking |
| **Tech Comfort** | Moderate |

### 4.6 Persona: Platform Super Admin
| Field | Detail |
|-------|--------|
| **Who** | SaaS platform operator/administrator |
| **Goal** | Manage tenants, subscriptions, platform health |
| **Pain Points** | No centralized tenant management |
| **Tech Comfort** | High — technical/business admin |

---

## 5. Platform Architecture Overview

```
Platform (Super Admin)
        │
        ├── Tenant A (Showroom Business)
        │       ├── Showroom A1
        │       │       ├── Customers
        │       │       ├── Workers
        │       │       ├── Services
        │       │       ├── Inventory
        │       │       └── Transactions
        │       └── Showroom A2
        │               └── ...
        │
        └── Tenant B (Another Showroom Business)
                └── Showroom B1
                        └── ...
```

**Critical Rule:** Tenant A's data is completely isolated from Tenant B's data at all times. Tenant identity is derived from authenticated server-side context only — never from client input.

---

## 6. Multi-Tenancy Model

### Architecture
- **Shared database, tenant-scoped data** (Row-Level Isolation via `tenantId`)
- Every tenant-scoped entity carries `tenantId` as a non-nullable foreign key
- Every query at the application layer filters by `tenantId` derived from authenticated session

### Tenant Hierarchy
```
Platform
└── Tenant
    └── Showroom(s)
        ├── Users (Owner, Admin, Manager, Accountant)
        ├── Workers
        ├── Customers
        ├── Services
        ├── Bikes (Catalog + Inventory)
        ├── Spare Parts
        └── Transactions
```

### Isolation Rules
| Layer | Enforcement |
|-------|------------|
| API | `tenantId` extracted from JWT, never from request body |
| Service Layer | All queries include `tenantId` where clause |
| Repository Layer | `tenantId` param required for all tenant-scoped operations |
| Database | Indexes on `tenantId` + `showroomId` for all major tables |

### Showroom Scoping
- A tenant may have 1 or many showrooms
- Users can be scoped at tenant level (access all showrooms) or showroom level (single/multi)
- Workers are assigned to specific showrooms
- Inventory, services, and scheduling are showroom-scoped

---

## 7. Technology Decisions

### Non-Negotiable Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15+, React 19, TypeScript, App Router |
| **Backend** | Next.js 15+, TypeScript, App Router, Route Handlers |
| **Database** | PostgreSQL 16+ |
| **ORM** | Prisma |
| **Mobile** | Expo, React Native, TypeScript, Expo Router |
| **Monorepo** | Turborepo + npm workspaces |
| **Validation** | Zod |
| **Forms** | React Hook Form + Zod |
| **Client State** | TanStack Query |
| **Testing** | Vitest, React Testing Library, Playwright |

### Explicitly Forbidden
- ❌ Express.js (any form)
- ❌ Separate Express backend
- ❌ `prisma db push` in production/CI
- ❌ Direct database connection from mobile
- ❌ Storing secrets in app bundle

### Monorepo Structure
```
showroom-management-saas/
├── .github/workflows/
├── backend/          ← Next.js API/Application Server
├── frontend/         ← Next.js Web UI Application
├── mobile/           ← Expo React Native Application
├── packages/         ← Shared packages
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── eslint-config/
├── PRD+DLD/
├── turbo.json
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 8. System Panels & Modules

### 8.1 Customer Web Application

#### Public Routes
| Route | Description |
|-------|------------|
| `/` | Home with banners, featured bikes, services |
| `/bikes` | Browse bike catalog |
| `/bikes/[id]` | Bike detail page |
| `/services` | Browse available services |
| `/spare-parts` | Browse spare parts |
| `/deals` | Current deals and offers |
| `/about` | About the showroom |
| `/contact` | Contact page |
| `/feedback` | Submit feedback |

#### Authenticated Routes
| Route | Description |
|-------|------------|
| `/dashboard` | Customer overview dashboard |
| `/profile` | Manage personal profile |
| `/my-bikes` | List of registered bikes |
| `/my-bikes/add` | Register a new bike |
| `/service-requests` | Submit new service request |
| `/service-requests/[id]` | Track specific service |
| `/my-services` | Service history |
| `/spare-parts/request` | Request a spare part |
| `/spare-parts/requests` | Track part requests |
| `/notifications` | View all notifications |
| `/feedback/submit` | Submit service feedback |
| `/feedback/history` | View past feedback |

---

### 8.2 Showroom Admin Panel

| Section | Sub-Sections |
|---------|-------------|
| **Dashboard** | KPIs, charts, recent activity, alerts |
| **Service Management** | Requests, Schedule, Active, Completed |
| **Workers** | List, Availability, Assignments, Performance |
| **Customers** | CRM list, Service History, Communication Log |
| **Bikes** | Catalog, Inventory, Add/Edit |
| **Spare Parts** | Inventory, Requests, Orders, Suppliers |
| **Content** | Homepage, Announcements, Featured Items |
| **Deals** | Manage deals and promotional offers |
| **Advertisements** | Banners, Campaigns |
| **Feedback** | View, moderate, respond |
| **Reports** | Sales, Service, Worker, Inventory, Finance |
| **Finance** | Invoices, Payments, EMI, Expenses |
| **Settings** | Showroom config, roles, notifications, integrations |

---

### 8.3 Worker Panel

| Section | Description |
|---------|------------|
| **Dashboard** | Today's assignments, availability status |
| **My Schedule** | Calendar/list view of all tasks |
| **Assigned Services** | Tasks assigned to this worker |
| **Task Details** | Full details of a specific service |
| **Start / Pause / Update / Complete Task** | Task lifecycle control |
| **Add Notes** | Add internal notes to service |
| **Spare Part Requests** | Request parts for a service |
| **Part Request History** | Track requested parts |
| **Task History** | Completed services history |
| **Availability** | Update own availability status |
| **Profile** | Manage personal information |
| **Notifications** | View worker notifications |

---

### 8.4 Super Admin Panel

| Section | Description |
|---------|------------|
| **Dashboard** | Platform-wide KPIs, tenant overview |
| **Tenants** | Create, suspend, manage tenants |
| **Showrooms** | View all showrooms across tenants |
| **Subscriptions** | Manage plans, billing, upgrades |
| **Plans** | Create and manage subscription plans |
| **Platform Users** | Manage platform-level admin accounts |
| **Platform Analytics** | Revenue, tenant growth, usage |
| **Feature Flags** | Enable/disable features per tenant |
| **Announcements** | Platform-wide announcements |
| **Audit Logs** | Platform-level audit trail |
| **Settings** | Platform configuration |

> **Critical:** Super Admin is hosted at a separate subdomain (e.g., `superadmin.domain.com`) and cannot access showroom-level APIs. Showroom admins cannot access Super Admin APIs.

---

### 8.5 Mobile Application

| Section | Users |
|---------|-------|
| **Customer Tabs** | Home, My Bikes, Services, Spare Parts, Notifications, Profile |
| **Worker Tabs** | Dashboard, My Tasks, Availability, Parts, Notifications, Profile |
| **Admin Mobile** | Dashboard, Requests, Workers, Reports (read-only) |

---

## 9. Feature Modules — Detailed Requirements

---

### Module 001 — Platform Foundation

**Purpose:** Establish the base technical infrastructure for the entire SaaS platform.

**Requirements:**
- Turborepo monorepo with `backend/`, `frontend/`, `mobile/`, `packages/`
- npm workspaces configured
- TypeScript configured across all apps and packages
- ESLint with shared config from `packages/eslint-config`
- Environment variable management with `.env.example` templates
- `packages/types` — shared TypeScript types and API contracts
- `packages/validation` — shared Zod schemas
- `packages/config` — shared configuration constants
- Prisma installed and connected to PostgreSQL
- First migration: `platform_foundation`
- Base error handling infrastructure
- Base API response format established
- Health check endpoint: `GET /api/health`
- Structured logging foundation

**API:**
```
GET  /api/health           → Platform health check
GET  /api/v1/version       → API version info
```

**Database — Initial Migration: `platform_foundation`**
- `tenants` table skeleton
- `showrooms` table skeleton
- Base timestamp fields on all tables

---

### Module 002 — Authentication

**Purpose:** Secure, multi-role authentication across all user types.

**Actors:** Customer, Worker, Showroom Admin/Owner/Manager, Super Admin

**Requirements:**

#### Customer Authentication
| Feature | Requirement |
|---------|------------|
| Register | Email + password, email verification |
| Login | Email + password |
| Logout | Invalidate session/token |
| Forgot Password | Email-based reset link |
| Reset Password | Token-validated, time-limited |
| Session Management | Secure session with expiry |

#### Worker Authentication
| Feature | Requirement |
|---------|------------|
| No Public Registration | Worker accounts created by Admin only |
| Invitation Flow | Admin creates account → System sends setup link → Worker sets password |
| Login | Email + password |
| Password Reset | Admin-approved or token-based flow |

#### Admin Authentication
| Feature | Requirement |
|---------|------------|
| Secure Login | Email + password |
| Session Management | Role-aware session |
| Password Recovery | Email-based recovery |

#### Super Admin Authentication
| Feature | Requirement |
|---------|------------|
| Isolated Login | Separate subdomain/route |
| Stronger Security | MFA-ready architecture |
| Session Management | Shorter TTL, tighter controls |

**Security Rules:**
- ❌ No plaintext passwords — use bcrypt (cost factor ≥ 12)
- ✅ HttpOnly, Secure, SameSite cookies
- ✅ JWT with short expiry + refresh token rotation
- ✅ Rate limiting on all auth endpoints
- ✅ Brute-force protection (lockout after N failed attempts)

**API:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/refresh-token
GET  /api/v1/auth/me
POST /api/v1/auth/worker/setup          ← Worker account setup
POST /api/v1/auth/superadmin/login      ← Isolated super admin login
```

**Database Migration: `authentication`**
- `users` table (id, email, passwordHash, role, status, tenantId, showroomId, createdAt)
- `refresh_tokens` table
- `password_reset_tokens` table
- `worker_invitations` table

---

### Module 003 — Super Admin

**Purpose:** Platform-level management isolated from tenant operations.

**Actors:** PLATFORM_SUPER_ADMIN only

**Requirements:**
- Separate auth route and subdomain architecture
- Tenant CRUD (create, view, suspend, reactivate, delete)
- Showroom overview across all tenants
- Subscription management per tenant
- Platform analytics dashboard
- Feature flag management per tenant
- Platform announcements (displayed in admin panels)
- Audit log viewer (platform-level)
- Super Admin user management

**Business Rules:**
- Super Admin cannot access tenant showroom data
- Showroom admin JWT cannot authenticate to Super Admin routes
- Platform analytics must be aggregated and anonymized where appropriate

**API:**
```
GET    /api/superadmin/v1/tenants
POST   /api/superadmin/v1/tenants
GET    /api/superadmin/v1/tenants/:id
PATCH  /api/superadmin/v1/tenants/:id
DELETE /api/superadmin/v1/tenants/:id
POST   /api/superadmin/v1/tenants/:id/suspend
POST   /api/superadmin/v1/tenants/:id/reactivate
GET    /api/superadmin/v1/analytics
GET    /api/superadmin/v1/subscriptions
GET    /api/superadmin/v1/audit-logs
GET    /api/superadmin/v1/feature-flags
PATCH  /api/superadmin/v1/feature-flags/:tenantId
```

---

### Module 004 — Tenant Management

**Purpose:** Manage showroom businesses (tenants) on the platform.

**Actors:** PLATFORM_SUPER_ADMIN, SHOWROOM_OWNER

**Tenant Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | Business name |
| slug | string | Unique URL-safe identifier |
| email | string | Business contact email |
| phone | string | Contact phone |
| address | string | Business address |
| logo | string | Logo URL |
| status | enum | ACTIVE, SUSPENDED, TRIAL, CANCELLED |
| subscriptionPlan | FK | Links to plan |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Tenant Lifecycle:**
```
Created (by Super Admin)
    ↓
TRIAL (default)
    ↓
ACTIVE (on payment)
    ↓
SUSPENDED (non-payment / violation)
    ↓
CANCELLED
```

---

### Module 005 — Showroom Management

**Purpose:** Manage individual showrooms within a tenant.

**Actors:** SHOWROOM_OWNER, SHOWROOM_ADMIN, PLATFORM_SUPER_ADMIN

**Showroom Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| name | string |
| code | string (unique within tenant) |
| address | string |
| city | string |
| state | string |
| pincode | string |
| phone | string |
| email | string |
| location (lat/lng) | decimal |
| operatingHours | JSON |
| status | enum: ACTIVE, INACTIVE, TEMPORARILY_CLOSED |
| createdAt | timestamp |

**Requirements:**
- Tenant can create multiple showrooms
- Each showroom has independent operating hours
- Showroom-level user assignments
- Showroom-level inventory, services, workers

**API:**
```
GET    /api/v1/showrooms
POST   /api/v1/showrooms
GET    /api/v1/showrooms/:id
PATCH  /api/v1/showrooms/:id
DELETE /api/v1/showrooms/:id
GET    /api/v1/showrooms/:id/users
GET    /api/v1/showrooms/:id/workers
```

---

### Module 006 — Customer Management

**Purpose:** Full CRM for managing showroom customers.

**Actors:** SHOWROOM_ADMIN, SHOWROOM_MANAGER, CUSTOMER

**Customer Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| userId | FK (auth user) |
| firstName | string |
| lastName | string |
| email | string |
| phone | string |
| address | string |
| dateOfBirth | date |
| profilePhoto | string URL |
| status | enum: ACTIVE, INACTIVE, BLOCKED |
| createdAt | timestamp |

**Features:**
- Customer self-registration via public form
- Admin can view, search, filter, export customers
- Customer profile with full service history
- Follow-up notes and communication log
- Customer segmentation (tags)
- Admin can block/unblock customers

**Business Rules:**
- Customer is always scoped to a tenant
- Admin cannot access customers from another tenant
- Customer can only see their own data

**API:**
```
GET    /api/v1/customers                 ← Admin: list with pagination
GET    /api/v1/customers/:id            ← Admin: customer detail
PATCH  /api/v1/customers/:id            ← Admin: update
GET    /api/v1/customers/:id/services   ← Service history
GET    /api/v1/me/profile               ← Customer: own profile
PATCH  /api/v1/me/profile               ← Customer: update profile
GET    /api/v1/me/bikes                 ← Customer: own bikes
GET    /api/v1/me/services              ← Customer: service history
```

---

### Module 007 — Worker Management

**Purpose:** Manage service workers/technicians at showroom level.

**Actors:** SHOWROOM_ADMIN, SHOWROOM_MANAGER

**Worker Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| userId | FK |
| employeeCode | string |
| firstName | string |
| lastName | string |
| phone | string |
| email | string |
| specialization | enum[] |
| status | enum: ACTIVE, INACTIVE, ON_LEAVE |
| joiningDate | date |
| photo | string URL |
| createdAt | timestamp |

**Worker Specializations:**
```
GENERAL_SERVICE
ENGINE_REPAIR
ELECTRICAL
BODY_WORK
TYRES_SUSPENSION
ACCESSORIES
WASHING
INSPECTION
```

**NO Public Registration Rule:**
1. Admin creates worker profile
2. System generates invitation token
3. Worker receives email with setup link
4. Worker sets password
5. Worker account activated

**API:**
```
GET    /api/v1/workers
POST   /api/v1/workers
GET    /api/v1/workers/:id
PATCH  /api/v1/workers/:id
DELETE /api/v1/workers/:id
POST   /api/v1/workers/:id/invite        ← Re-send invitation
GET    /api/v1/workers/:id/availability
GET    /api/v1/workers/:id/assignments
GET    /api/v1/workers/:id/performance
```

---

### Module 008 — Service Management

**Purpose:** Define and manage all service types offered at a showroom.

**Actors:** SHOWROOM_ADMIN, SHOWROOM_MANAGER, CUSTOMER (browse only)

**Service (Catalog) Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| name | string |
| description | text |
| category | enum |
| estimatedDuration | integer (minutes) |
| price | decimal |
| priceType | enum: FIXED, STARTING_FROM, CUSTOM |
| images | string[] |
| status | enum: ACTIVE, INACTIVE |
| createdAt | timestamp |

**Service Categories:**
```
GENERAL_SERVICE
OIL_CHANGE
ENGINE_REPAIR
ELECTRICAL_REPAIR
BRAKE_SERVICE
TYRE_SERVICE
CHAIN_SPROCKET
BODY_REPAIR
ACCESSORIES_FITTING
WASHING_DETAILING
CUSTOM
```

**Service Request Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| customerId | FK |
| bikeId | FK |
| serviceId | FK |
| status | enum (see below) |
| issue description | text |
| preferredDate | date |
| preferredTimeSlot | string |
| scheduledAt | timestamp |
| estimatedCompletion | timestamp |
| actualStart | timestamp |
| actualCompletion | timestamp |
| workerId | FK (assigned) |
| internalNotes | text |
| adminNotes | text |
| totalAmount | decimal |
| createdAt | timestamp |

**Service Status Lifecycle:**
```
REQUESTED
    ↓
UNDER_REVIEW
    ↓
SCHEDULED ────────────────────→ RESCHEDULED
    ↓                                 ↓
ASSIGNED                          (back to SCHEDULED)
    ↓
IN_PROGRESS
    ↓
WAITING_FOR_PARTS
    ↓ (parts received)
IN_PROGRESS
    ↓
READY_FOR_CUSTOMER
    ↓
COMPLETED

At any point before IN_PROGRESS:
→ CANCELLED
→ REJECTED
```

**Business Rules:**
- Status transitions are server-controlled, not client-driven
- Customer can cancel a request before it is ASSIGNED
- Admin can reject requests with reason
- Worker cannot modify status directly (uses task update flow)

---

### Module 009 — Service Scheduling

**Purpose:** Intelligent scheduling of services to workers with time-conflict prevention.

**Actors:** SHOWROOM_ADMIN, SHOWROOM_MANAGER

**Requirements:**
- Admin views all service requests in queue
- Admin checks worker availability before assignment
- System warns on scheduling conflict (same worker, overlapping time)
- Admin assigns a worker and sets scheduled time
- Customer is automatically notified with confirmed timing

**Scheduling Data:**
| Field | Description |
|-------|------------|
| scheduledAt | Confirmed appointment datetime |
| estimatedDuration | From service catalog (can be overridden) |
| estimatedCompletion | scheduledAt + estimatedDuration |
| workerId | Assigned worker |
| conflictCheck | Server validates worker has no overlap |

**Worker Time States:**
```
AVAILABLE     ← Ready to take tasks
BUSY          ← Currently assigned and working
ON_BREAK      ← Temporary break
OFFLINE       ← Not at showroom
ON_LEAVE      ← Approved leave
OVERDUE       ← Task exceeded estimated time
```

**Calendar View Requirements:**
- Admin can view day/week/month schedule
- Color-coded worker assignments
- Real-time worker status indicators
- Click to view/edit assignment details

**API:**
```
GET    /api/v1/scheduling/calendar
GET    /api/v1/scheduling/worker-availability
POST   /api/v1/scheduling/assign
PATCH  /api/v1/scheduling/reschedule/:id
GET    /api/v1/scheduling/conflicts
```

---

### Module 010 — Bike Management

**Purpose:** Manage bike catalog for showroom and customer bike registration.

**Actors:** SHOWROOM_ADMIN, CUSTOMER

**Bike Catalog Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| brand | string |
| model | string |
| variant | string |
| year | integer |
| engineCC | integer |
| color | string |
| price | decimal |
| images | string[] |
| specifications | JSON |
| features | string[] |
| availability | enum: AVAILABLE, SOLD_OUT, COMING_SOON |
| status | enum: ACTIVE, INACTIVE |
| description | text |

**Customer Bike (Registration) Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| customerId | FK |
| tenantId | FK |
| showroomId | FK |
| catalogBikeId | FK (optional) |
| registrationNumber | string |
| brand | string |
| model | string |
| variant | string |
| year | integer |
| color | string |
| chassisNumber | string |
| engineNumber | string |
| purchaseDate | date |
| lastServiceDate | date |
| status | enum: ACTIVE, SOLD, SCRAPPED |

**API:**
```
GET    /api/v1/bikes                   ← Public: browse catalog
GET    /api/v1/bikes/:id              ← Public: bike detail
POST   /api/v1/bikes                  ← Admin: add to catalog
PATCH  /api/v1/bikes/:id              ← Admin: update catalog
DELETE /api/v1/bikes/:id              ← Admin: remove

GET    /api/v1/me/bikes               ← Customer: my bikes
POST   /api/v1/me/bikes               ← Customer: register bike
GET    /api/v1/me/bikes/:id           ← Customer: bike detail
PATCH  /api/v1/me/bikes/:id           ← Customer: update bike info
```

---

### Module 011 — Spare Parts

**Purpose:** Manage spare parts inventory at showroom level.

**Actors:** SHOWROOM_ADMIN, SHOWROOM_MANAGER, WORKER (view/request)

**Spare Part Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| name | string |
| sku | string (unique) |
| category | string |
| compatibility | string[] (bike brands/models) |
| quantity | integer |
| minimumStock | integer |
| price | decimal |
| costPrice | decimal |
| supplier | string |
| status | enum (below) |
| images | string[] |
| description | text |
| createdAt | timestamp |

**Spare Part Statuses:**
```
IN_STOCK       ← quantity > minimumStock
LOW_STOCK      ← quantity <= minimumStock
OUT_OF_STOCK   ← quantity = 0
RESERVED       ← Reserved for a service
ORDERED        ← Ordered from supplier
IN_TRANSIT     ← Shipped, not received
RECEIVED       ← Received in stock
DISCONTINUED   ← No longer stocked
```

**Inventory Rules:**
- Alert when quantity falls to minimumStock
- RESERVED reduces available quantity (not total)
- Supplier reorder flow tracked in system

**API:**
```
GET    /api/v1/spare-parts
GET    /api/v1/spare-parts/:id
POST   /api/v1/spare-parts
PATCH  /api/v1/spare-parts/:id
DELETE /api/v1/spare-parts/:id
GET    /api/v1/spare-parts/low-stock-alerts
POST   /api/v1/spare-parts/:id/adjust-stock   ← Manual stock adjustment
```

---

### Module 012 — Spare Part Requests

**Purpose:** End-to-end spare part request and order workflow.

**Actors:** CUSTOMER, WORKER, SHOWROOM_ADMIN

**Customer Request Workflow:**
```
Customer: Search Part → Check Availability → Submit Request
                                    ↓
                          If AVAILABLE: Admin processes
                                    ↓
                          If UNAVAILABLE: Order workflow
                                    ↓
        Admin → Assign Worker → Worker Orders Part → Provide ETA
                                    ↓
                          Admin Reviews ETA → Customer Notified
                                    ↓
                          Part Received → Customer Notified
                                    ↓
                          Customer Picks Up / Delivery
```

**Spare Part Request Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| customerId | FK |
| sparePartId | FK |
| bikeId | FK (optional) |
| quantity | integer |
| status | enum |
| customerNote | text |
| adminNote | text |
| workerId | FK (assigned) |
| estimatedArrival | date |
| actualArrival | date |
| createdAt | timestamp |

**Request Statuses:**
```
REQUESTED → UNDER_REVIEW → PROCESSING → ORDERED →
IN_TRANSIT → RECEIVED → READY_FOR_PICKUP → COMPLETED
                                        ↓
                                    CANCELLED
```

**Traceability Rule:** Every status change must be logged with actor, timestamp, and note.

---

### Module 013 — Content Management

**Purpose:** Allow admins to manage all customer-facing content without code changes.

**Actors:** SHOWROOM_ADMIN, SHOWROOM_MANAGER

**Content Types:**
| Type | Description |
|------|------------|
| BANNER | Homepage hero banners |
| ANNOUNCEMENT | Important showroom announcements |
| FEATURED_BIKE | Highlighted bike on homepage |
| SERVICE_PROMOTION | Featured services |
| SHOWROOM_UPDATE | News or updates |

**Content Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| type | enum |
| title | string |
| description | text |
| image | string URL |
| ctaText | string |
| ctaUrl | string |
| status | enum: DRAFT, ACTIVE, INACTIVE, EXPIRED |
| priority | integer (display order) |
| startDate | datetime |
| endDate | datetime |
| createdAt | timestamp |

**API:**
```
GET    /api/v1/content                   ← Public: active content
GET    /api/v1/admin/content             ← Admin: all content
POST   /api/v1/admin/content
PATCH  /api/v1/admin/content/:id
DELETE /api/v1/admin/content/:id
PATCH  /api/v1/admin/content/:id/publish
PATCH  /api/v1/admin/content/:id/unpublish
```

---

### Module 014 — Deals & Advertisements

**Purpose:** Manage promotional deals, discount offers, and advertising campaigns.

**Actors:** SHOWROOM_ADMIN, SHOWROOM_MANAGER

**Deal Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| title | string |
| description | text |
| discountType | enum: PERCENTAGE, FIXED_AMOUNT |
| discountValue | decimal |
| applicableTo | enum: SERVICE, SPARE_PART, BIKE, ALL |
| promoCode | string (optional) |
| image | string URL |
| status | enum: DRAFT, ACTIVE, EXPIRED |
| startDate | datetime |
| endDate | datetime |
| usageLimit | integer |
| usageCount | integer |

**Advertisement Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| title | string |
| image | string URL |
| targetUrl | string |
| placement | enum: HOME_BANNER, SIDEBAR, POPUP |
| status | enum: ACTIVE, INACTIVE |
| startDate | datetime |
| endDate | datetime |
| priority | integer |
| impressions | integer |
| clicks | integer |

---

### Module 015 — Notifications

**Purpose:** Multi-channel notification system for all user types.

**Actors:** All users (as recipients), SHOWROOM_ADMIN (as sender)

**Notification Events:**

| Trigger | Recipients |
|---------|-----------|
| Service Request Received | Admin |
| Service Request Acknowledged | Customer |
| Service Scheduled | Customer |
| Worker Assigned | Customer, Worker |
| Service Started | Customer |
| Waiting for Parts | Customer |
| Part Received / Service Resumed | Customer |
| Service Completed | Customer |
| Schedule Changed | Customer, Worker |
| Showroom Announcement | Customer |
| Worker Unavailable | Admin |
| Task Overdue | Admin |
| Spare Part Request | Admin, Worker |
| Low Inventory Alert | Admin |
| Feedback Submitted | Admin |
| Payment Received | Admin, Customer |
| Subscription Expiring | Tenant Owner |

**Channels (v1 — In-App; v2+ — extensible):**
```
IN_APP          ← v1.0 (required)
EMAIL           ← v1.0 (required)
SMS             ← v2.0
PUSH            ← v2.0 (mobile)
WHATSAPP        ← v2.0
```

**Notification Record Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| userId | FK |
| type | enum |
| title | string |
| body | text |
| channel | enum |
| status | enum: UNREAD, READ, ARCHIVED |
| referenceType | string (e.g., "SERVICE_REQUEST") |
| referenceId | UUID |
| createdAt | timestamp |

---

### Module 016 — Feedback

**Purpose:** Collect, manage, and respond to post-service customer feedback.

**Actors:** CUSTOMER (submit), SHOWROOM_ADMIN (moderate, respond)

**Feedback Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| showroomId | FK |
| customerId | FK |
| serviceRequestId | FK (optional) |
| rating | integer (1-5) |
| comment | text |
| status | enum: PENDING, APPROVED, REJECTED, RESPONDED |
| adminResponse | text |
| respondedAt | timestamp |
| createdAt | timestamp |

**Business Rules:**
- Customer can submit one feedback per completed service
- Admin can approve, reject, or respond to feedback
- Rejected feedback is not shown publicly
- Customer data is never exposed publicly in feedback displays
- Admin cannot edit customer's original feedback text

---

### Module 017 — Reports & Analytics

**Purpose:** Provide actionable business intelligence for showroom operations.

**Actors:** SHOWROOM_OWNER, SHOWROOM_ADMIN, SHOWROOM_MANAGER, ACCOUNTANT

**Report Types:**

| Report | Description |
|--------|------------|
| **Service Performance** | Requests, completions, cancellations, avg. time |
| **Worker Performance** | Tasks completed, avg. time, efficiency score |
| **Customer Acquisition** | New customers, retention, repeat visits |
| **Inventory Report** | Stock levels, movements, low-stock alerts |
| **Spare Parts Report** | Requests, fulfillment rate, order history |
| **Revenue Report** | Daily/weekly/monthly revenue breakdown |
| **Bike Sales Report** | Units sold, popular models, revenue |
| **Finance Report** | Income, expenses, profit, outstanding payments |
| **Feedback Report** | Average rating, sentiment, response rate |

**Export Formats:**
- PDF
- Excel (XLSX)
- CSV

**API:**
```
GET /api/v1/reports/service-performance?from=&to=&showroomId=
GET /api/v1/reports/worker-performance?workerId=&from=&to=
GET /api/v1/reports/revenue?from=&to=&groupBy=day|week|month
GET /api/v1/reports/inventory?showroomId=
GET /api/v1/reports/customer-retention?from=&to=
GET /api/v1/reports/export/:type?format=pdf|excel|csv
```

---

### Module 018 — Finance & Billing

**Purpose:** Manage all financial operations: invoices, payments, EMI, expenses.

**Actors:** SHOWROOM_ADMIN, ACCOUNTANT

**Invoice Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| invoiceNumber | string (unique, auto-generated) |
| tenantId | FK |
| showroomId | FK |
| customerId | FK |
| serviceRequestId | FK (optional) |
| lineItems | JSON |
| subtotal | decimal |
| taxAmount | decimal |
| taxRate | decimal |
| discountAmount | decimal |
| totalAmount | decimal |
| status | enum: DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED |
| dueDate | date |
| paidAt | timestamp |
| notes | text |
| createdAt | timestamp |

**Payment Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| invoiceId | FK |
| amount | decimal |
| method | enum: CASH, CARD, UPI, BANK_TRANSFER, EMI |
| transactionId | string |
| status | enum: PENDING, COMPLETED, FAILED, REFUNDED |
| paidAt | timestamp |

**EMI Plan Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| invoiceId | FK |
| tenorMonths | integer |
| installmentAmount | decimal |
| installments | JSON (schedule with due dates) |
| status | enum: ACTIVE, COMPLETED, DEFAULTED |

**Tax Support:**
- GST (CGST + SGST / IGST)
- Configurable tax rates per showroom

---

### Module 019 — Subscription Management

**Purpose:** Manage SaaS subscription plans, billing, and tenant access control.

**Actors:** PLATFORM_SUPER_ADMIN, SHOWROOM_OWNER

**Plan Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| name | string |
| description | text |
| price | decimal |
| billingCycle | enum: MONTHLY, YEARLY |
| features | JSON (feature flags) |
| maxShowrooms | integer |
| maxWorkers | integer |
| maxCustomers | integer |
| status | enum: ACTIVE, DEPRECATED |

**Subscription Fields:**
| Field | Type |
|-------|------|
| id | UUID |
| tenantId | FK |
| planId | FK |
| status | enum: TRIAL, ACTIVE, PAST_DUE, SUSPENDED, CANCELLED |
| startDate | date |
| endDate | date |
| autoRenew | boolean |
| trialEndsAt | date |

**Business Rules:**
- Trial period: 14 days (configurable per Super Admin)
- Subscription expiry suspends tenant access (not data deletion)
- Grace period of 7 days after expiry before suspension
- Super Admin can override subscription status

---

### Module 020 — Mobile Application

**Purpose:** Native mobile experience for customers, workers, and admins.

**Technology:** Expo + React Native + TypeScript + Expo Router

**Customer Mobile Features:**
- Browse bikes and services
- Register and manage bikes
- Book service requests
- Track service status in real-time
- View and request spare parts
- Receive push notifications
- Submit feedback
- View service history

**Worker Mobile Features:**
- View today's assigned tasks
- Update availability status
- Start, pause, update, complete tasks
- Add service notes
- Request spare parts
- View task history
- Receive push notifications

**Admin Mobile Features (Read-Only/Quick Actions):**
- Dashboard KPIs
- Service request queue
- Worker availability overview
- Quick status updates

**Mobile Performance Requirements:**
- Use `FlashList` for long lists
- Image lazy loading and caching
- Offline-aware UX (graceful degradation)
- Push notification support (Expo Notifications)
- Pagination on all list screens
- Skeleton loading states

---

## 10. RBAC — Role-Based Access Control

### Roles

| Role | Scope | Capabilities |
|------|-------|-------------|
| `PLATFORM_SUPER_ADMIN` | Platform | Full platform access, tenant management |
| `SHOWROOM_OWNER` | Tenant | Full tenant access, all showrooms |
| `SHOWROOM_ADMIN` | Showroom | Full showroom operations |
| `SHOWROOM_MANAGER` | Showroom | Operations (no financial delete, no role management) |
| `ACCOUNTANT` | Showroom | Finance module only |
| `WORKER` | Showroom | Own tasks, availability, spare part requests |
| `CUSTOMER` | Own data | Own profile, bikes, service requests |

### Authorization Matrix (Key Permissions)

| Action | SUPER_ADMIN | OWNER | ADMIN | MANAGER | ACCOUNTANT | WORKER | CUSTOMER |
|--------|:-----------:|:-----:|:-----:|:-------:|:----------:|:------:|:--------:|
| Create tenant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create showroom | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create worker | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all customers | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign service | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update service status | ❌ | ✅ | ✅ | ✅ | ❌ | ✅* | ❌ |
| Manage invoices | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View own profile | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Request service | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage content | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

*Worker can update task progress, not service request status directly.

### Authorization Enforcement Rules
1. `tenantId` is **never** trusted from client input
2. `showroomId` is **never** trusted from client input
3. Authorization middleware verifies: identity → role → tenant → showroom → resource
4. Every Route Handler calls authorization check before any business logic

---

## 11. Security Requirements

### Authentication Security
| Requirement | Implementation |
|------------|----------------|
| Password Storage | bcrypt, cost ≥ 12 |
| Token Storage | HttpOnly, Secure, SameSite=Strict cookies |
| Token Expiry | Access: 15min, Refresh: 7 days |
| Refresh Rotation | Rotate refresh token on every use |
| Session Invalidation | Logout revokes refresh token |

### Rate Limiting (Per Endpoint)
| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 req / 15min per IP |
| `/auth/register` | 3 req / hour per IP |
| `/auth/forgot-password` | 3 req / hour per IP |
| `/auth/reset-password` | 5 req / hour per token |
| Service request submission | 10 req / hour per user |
| Feedback submission | 5 req / hour per user |

### Input Validation
- All inputs validated with Zod at route handler level
- File uploads: type, size, extension, MIME type verified
- No executable files stored
- SQL injection prevented by Prisma parameterized queries
- XSS prevented by React's default escaping + CSP headers

### HTTP Security Headers
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security
CORS: allowedOrigins whitelist only
```

### Secrets Management
- All secrets in environment variables only
- `.env` never committed to git
- `.env.example` with dummy values committed
- No credentials in app bundle (mobile)
- No credentials in client-side code

---

## 12. Performance Requirements

### Target Metrics
| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Time to Interactive (TTI) | < 3.0s |
| API Response Time (p95) | < 200ms |
| List API Response Time | < 100ms |
| Search Response Time | < 300ms |
| Dashboard Load | < 2s |

### Next.js Performance Strategy
| Strategy | Usage |
|----------|-------|
| Server Components | Default for all data-fetching pages |
| Client Components | Only when interactivity required |
| Streaming + Suspense | Long-loading sections |
| `next/image` | All images (optimization + lazy loading) |
| `next/font` | Typography (eliminates FOUT) |
| Dynamic imports | Heavy components (calendars, charts) |
| Server-side pagination | All list APIs |
| Parallel data fetching | Dashboard widgets |
| Stale-while-revalidate | Public catalog content |

### Caching Policy
| Data Type | Strategy |
|-----------|---------|
| Bike catalog | Cache 1 hour, revalidate on admin update |
| Service catalog | Cache 1 hour |
| Public content/deals | Cache 30 min |
| Customer profile | No cache (user-specific) |
| Service request status | No cache (real-time critical) |
| Worker availability | No cache (real-time) |
| Financial data | No cache |

### Database Performance
- Indexes on: `tenantId`, `showroomId`, `userId`, `customerId`, `workerId`, `status`, `createdAt`, `scheduledAt`, `sku`
- Cursor-based pagination for large datasets
- Careful `select`/`include` — never fetch entire entities
- N+1 query prevention with Prisma `include`
- Database connection pooling configured

---

## 13. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Availability** | 99.9% uptime SLA |
| **Scalability** | Horizontal scaling ready (stateless API) |
| **Data Isolation** | Zero cross-tenant data leakage |
| **Compliance** | Data privacy principles (no unnecessary PII exposure) |
| **Browser Support** | Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| **Mobile Support** | iOS 14+, Android 10+ |
| **Responsive Design** | Mobile, tablet, desktop (1280px+) |
| **Accessibility** | WCAG 2.1 AA baseline |
| **Offline (Mobile)** | Graceful degradation with offline states |

---

## 14. Development Phases

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| **Phase 0** | Repository + Architecture | Monorepo, Next.js FE/BE, Expo, Prisma, CI |
| **Phase 1** | Platform Foundation | Health check, error handling, base infra |
| **Phase 2** | Authentication | Auth for all roles, JWT, cookies, rate limiting |
| **Phase 3** | Super Admin | Tenant CRUD, platform analytics, isolated auth |
| **Phase 4** | Tenant + Showroom | Tenant/showroom management, multi-tenancy |
| **Phase 5** | Customer Management | CRM, customer profile, search |
| **Phase 6** | Worker Management | Worker CRUD, invitation, specializations |
| **Phase 7** | Service Management | Service catalog, service requests, status machine |
| **Phase 8** | Scheduling + Availability | Worker scheduling, conflict detection, calendar |
| **Phase 9** | Bike Management | Catalog, customer registration, search |
| **Phase 10** | Spare Parts + Inventory | Inventory, stock alerts, supplier tracking |
| **Phase 11** | Spare Part Request Workflow | End-to-end request + order + ETA flow |
| **Phase 12** | Content + Deals | CMS, announcements, deals, ads |
| **Phase 13** | Notifications | In-app + email notifications |
| **Phase 14** | Feedback | Collection, moderation, response |
| **Phase 15** | Reports + Dashboards | Analytics, exports, KPI widgets |
| **Phase 16** | Finance + Billing | Invoices, payments, EMI, tax |
| **Phase 17** | Mobile Application | Full Expo app for all roles |
| **Phase 18** | Security Hardening | Pen test readiness, audit review |
| **Phase 19** | Performance Optimization | Caching, indexing, bundle audit |
| **Phase 20** | Production Readiness | Observability, backups, SLA review |

---

## 15. API Design Standards

### URL Convention
```
/api/v1/{resource}                    ← Collection
/api/v1/{resource}/{id}               ← Resource instance
/api/v1/{resource}/{id}/{sub}         ← Sub-resource
/api/superadmin/v1/{resource}         ← Super admin only
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": {}
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_REQUEST_NOT_FOUND",
    "message": "The requested service record was not found.",
    "details": []
  }
}
```

### Pagination Standard
- Default: page-based (`?page=1&limit=20`)
- Cursor-based for high-volume streams
- Max limit: 100 per request

---

## 16. Testing Requirements

### Unit Tests (Vitest)
- Business logic in service classes
- Zod validation schemas
- Utility functions
- Mapper functions
- Authorization helpers

### Integration Tests (Vitest + Supertest/Next.js)
- Route handlers
- Database layer (with test database)
- Authentication flow
- Authorization enforcement
- Tenant isolation verification

### E2E Tests (Playwright)

**Customer Flows:**
- Register → Login → Add Bike → Request Service → Receive Schedule → View Status
- Request Unavailable Spare Part → Receive ETA → Submit Feedback

**Admin Flows:**
- Login → Create Worker → View Availability → Receive Request → Assign Worker → Schedule

**Worker Flows:**
- Login → Update Availability → Receive Task → Update → Request Part → Complete

**Super Admin Flows:**
- Login → Create Tenant → Manage Subscription → View Platform Analytics

**Security Flows:**
- Cross-tenant access attempt (must fail with 403)
- Wrong role access attempt (must fail with 403)
- Unauthorized resource access (must fail with 403)

### Migration Tests (CI)
- `prisma validate` on every push
- Migration consistency check
- Test database migration deployment on every PR

---

## 17. CI/CD Requirements

### GitHub Actions Workflows

| Workflow | Triggers | Steps |
|----------|---------|-------|
| `ci.yml` | Push / PR | Install, lint, typecheck, unit tests, integration tests |
| `migration.yml` | Push to main | Prisma validate, migration deploy to test DB |
| `e2e.yml` | PR to main | Playwright E2E tests |
| `security.yml` | Scheduled / Push | Dependency audit, secret scanning |
| `build.yml` | PR to main | Build frontend, backend, mobile |

### Turborepo Caching
- Task caching for: lint, typecheck, build, test
- Remote caching for CI speed (Vercel Remote Cache or self-hosted)
- Selective execution based on dependency graph (only rebuild changed packages)

---

## 18. Observability & Audit

### Structured Logging
- Log level: ERROR, WARN, INFO, DEBUG
- JSON log format
- Correlation ID per request (trace across services)
- Never log: passwords, tokens, secrets, raw PII

### Audit Log Events
| Event Category | Examples |
|---------------|---------|
| Security | Login, failed login, password reset, role change |
| Worker | Created, deactivated, assignment, status change |
| Service | Created, assigned, status change, completed |
| Inventory | Stock adjusted, part ordered, received |
| Finance | Invoice created, payment recorded, refunded |
| Content | Banner created, deal published, ad updated |
| Admin | Showroom settings changed, worker role changed |
| Super Admin | Tenant created, suspended, plan changed |

### Audit Entry Schema
```json
{
  "id": "uuid",
  "actor": "userId",
  "actorRole": "SHOWROOM_ADMIN",
  "action": "SERVICE_REQUEST_ASSIGNED",
  "entity": "ServiceRequest",
  "entityId": "uuid",
  "tenantId": "uuid",
  "showroomId": "uuid",
  "metadata": {},
  "timestamp": "ISO 8601"
}
```

---

## 19. Success Metrics & KPIs

### Product KPIs

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| Tenant Onboarding | 50+ showrooms on platform |
| Customer Activation | 500+ registered customers |
| Service Requests Processed | 2,000+ via platform |
| Worker Utilization | 80%+ of showrooms using worker module |
| Customer Satisfaction | Average feedback rating ≥ 4.2/5 |
| System Uptime | ≥ 99.9% |
| API p95 Response Time | < 200ms |
| Subscription Retention | > 85% monthly retention |

### Business KPIs (Per Tenant)
| Metric | Expected Improvement |
|--------|---------------------|
| Manual paperwork | Reduced by 80% |
| Service cycle time | 40% faster |
| Spare part stockouts | Reduced by 60% |
| Customer follow-up rate | 3x improvement |
| Revenue visibility | 100% (vs. 0% previously) |

---

## 20. Out of Scope — v1.0

The following features are **explicitly excluded** from v1.0:

| Feature | Target Version |
|---------|---------------|
| SMS notifications | v2.0 |
| WhatsApp integration | v2.0 |
| Push notifications (mobile) | v2.0 |
| Multi-language (i18n) support | v2.0 |
| AI-based service recommendations | v3.0 |
| External accounting integration (Tally, QuickBooks) | v2.0 |
| Online payment gateway (Razorpay / Stripe) | v2.0 |
| Customer loyalty / points system | v2.0 |
| Franchise management | v3.0 |
| Advanced analytics (BI dashboards) | v2.0 |

---

## Appendix A — Domain Module List

```
auth/
platform-admin/
tenant/
showroom-management/
master-data/
customer/
customer-communication/
worker/
worker-availability/
service/
service-request/
service-scheduling/
bike/
spare-parts/
spare-parts-request/
inventory/
sales/
billing/
payment/
expense/
finance/
content/
deals/
advertisements/
feedback/
notification/
reports/
dashboard/
subscription/
activity/
```

---

## Appendix B — Database Migration Plan

| Migration | Tables Created |
|-----------|--------------|
| `platform_foundation` | Base schema, tenants, showrooms |
| `authentication` | users, refresh_tokens, invitations |
| `tenant_management` | tenant settings, feature flags |
| `showroom_management` | showroom details, operating hours |
| `customer_management` | customers, customer bikes |
| `worker_management` | workers, specializations, invitations |
| `service_catalog` | services, service categories |
| `service_requests` | service requests, status history |
| `service_scheduling` | schedules, worker assignments |
| `bike_catalog` | bike models, specs, inventory |
| `spare_parts` | parts, inventory, stock movements |
| `spare_part_requests` | requests, order tracking |
| `content_management` | content, announcements |
| `deals_advertisements` | deals, ads, campaigns |
| `notifications` | notifications, delivery status |
| `feedback` | feedback, admin responses |
| `finance_billing` | invoices, payments, EMI |
| `subscription_management` | plans, subscriptions |
| `audit_logs` | audit trail |
| `activity_logs` | activity tracking |

---

*Document Status: Draft — Pending Stakeholder Review*
*Next Artifact: High-Level Design (HLD)*
*Project Folder: `C:\Users\faizadev\Desktop\showroom-management`*
