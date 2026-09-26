# 🏗️ HIGH-LEVEL DESIGN (HLD)
## Showroom Application — Multi-Showroom Vehicle & Service Marketplace

---

| Field | Value |
|-------|-------|
| **Product Name** | Showroom Application |
| **Version** | 2.0 — Aligned with PRD v2.0 |
| **Date** | September 26, 2026 |
| **Status** | Approved |
| **Classification** | Single Source of Truth Architecture |

---

## 1. System Architecture Overview

```
                               ┌──────────────────────────────────────────────┐
                               │             USER / MARKETPLACE               │
                               │  - Browse Vehicles (Bikes & Cars)            │
                               │  - Filter (Showroom, Brand, Price, Color, CC)│
                               │  - Browse Spare Parts                        │
                               │  - Send Enquiries (Single / All Showrooms)  │
                               │  - Request Service / Spare Part Purchase     │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           NEXT.JS API ROUTE HANDLERS          │
                               │           (REST API / JWT Auth / RBAC)       │
                               └───────┬──────────────┬──────────────┬────────┘
                                       │              │              │
                    ┌──────────────────┘              │              └──────────────────┐
                    ▼                                 ▼                                 ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐   ┌───────────────────────────────┐
│       SUPERADMIN PANEL        │   │          ADMIN PANEL          │   │      WORKER PANEL (Mobile/Web)│
│ - Create / Manage Showrooms   │   │ - Manage Showroom Collection  │   │ - View Assigned Service Jobs  │
│ - Provision Admin Accounts    │   │ - Create Worker/Inv Mgr Creds │   │ - Approve / Reject Job        │
│ - Marketplace Oversight       │   │ - View Enquiries & Requests   │   │ - Update Job Status + Time    │
└───────────────────────────────┘   │ - Assign Service Jobs         │   └───────────────────────────────┘
                                    └──────────────┬────────────────┘
                                                   │
                                                   ▼
                                    ┌───────────────────────────────┐
                                    │    INVENTORY MANAGER PANEL    │
                                    │ - Vehicle CRUD (Bikes & Cars) │
                                    │ - Spare Parts CRUD            │
                                    │ - Stock & Availability Update │
                                    └───────────────────────────────┘
```

---

## 2. Main Data Schemas (Prisma / PostgreSQL)

### 2.1 Showroom Table (`Showroom`)
- `id`: UUID (Primary Key)
- `name`: String
- `code`: String (Unique)
- `address`: String
- `contact_email`: String
- `contact_phone`: String
- `logo_url`: String (Optional)
- `created_at`: Timestamp

### 2.2 User / Account Table (`User`)
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password_hash`: String
- `full_name`: String
- `phone`: String
- `role`: Enum (`SUPERADMIN`, `ADMIN`, `WORKER`, `INVENTORY_MANAGER`, `USER`)
- `showroom_id`: UUID (Foreign Key to `Showroom`, Nullable for `SUPERADMIN` and `USER`)
- `created_at`: Timestamp

### 2.3 Vehicle Table (`Vehicle`)
- `id`: UUID (Primary Key)
- `showroom_id`: UUID (Foreign Key to `Showroom`)
- `type`: Enum (`BIKE`, `CAR`)
- `brand`: String (e.g. Hero, TVS, Maruti, Toyota, etc.)
- `model`: String
- `year`: Int
- `price`: Decimal
- `color`: String
- `cc`: Int (Engine Capacity)
- `is_top_vehicle`: Boolean (Default: false)
- `stock_quantity`: Int
- `description`: Text
- `image_urls`: String Array
- `created_at`: Timestamp

### 2.4 Spare Part Table (`SparePart`)
- `id`: UUID (Primary Key)
- `showroom_id`: UUID (Foreign Key to `Showroom`)
- `part_name`: String
- `part_code`: String
- `vehicle_type`: Enum (`BIKE`, `CAR`, `BOTH`)
- `price`: Decimal
- `stock_quantity`: Int
- `description`: Text
- `image_urls`: String Array
- `created_at`: Timestamp

### 2.5 Enquiry / Request Table (`Enquiry`)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `User`, Nullable for guest users)
- `target_showroom_id`: UUID (Foreign Key to `Showroom`, Nullable if broadcast to all)
- `broadcast_to_all`: Boolean (Default: false)
- `enquiry_type`: Enum (`GENERAL`, `VEHICLE_PURCHASE`, `SPARE_PART_PURCHASE`, `SERVICE_INQUIRY`)
- `customer_name`: String
- `customer_phone`: String
- `customer_email`: String
- `message`: Text
- `status`: Enum (`PENDING`, `RESPONDED`, `CLOSED`)
- `created_at`: Timestamp

### 2.6 Service Job & Worker Assignment Table (`ServiceJob`)
- `id`: UUID (Primary Key)
- `showroom_id`: UUID (Foreign Key to `Showroom`)
- `customer_name`: String
- `customer_phone`: String
- `vehicle_type`: Enum (`BIKE`, `CAR`)
- `vehicle_details`: String (e.g. Model, Reg Number)
- `service_description`: Text
- `assigned_worker_id`: UUID (Foreign Key to `User`, Nullable)
- `worker_approval`: Enum (`PENDING`, `APPROVED`, `REJECTED`)
- `status`: Enum (`REQUESTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
- `status_updated_at`: Timestamp
- `created_at`: Timestamp

---

## 3. Strict Admin Data Isolation Flow

All endpoints for Admin, Worker, and Inventory Manager extract `showroom_id` directly from the authenticated session context (`JWT payload`). 

```typescript
// Middleware / Route Handler Scoping Pattern
const currentUser = await getAuthUser(req);

if (currentUser.role !== 'SUPERADMIN' && currentUser.role !== 'USER') {
  // Enforce Showroom Scoping
  queryCondition.showroom_id = currentUser.showroom_id;
}
```

---

## 4. API Endpoints Map

### Authentication & Provisioning
- `POST /api/auth/login` — Log in for all 5 roles.
- `POST /api/superadmin/showrooms` — Superadmin creates Showroom.
- `POST /api/superadmin/admins` — Superadmin provisions Showroom Admin credentials.
- `POST /api/admin/staff` — Admin provisions Worker or Inventory Manager credentials.

### Marketplace (Public User Access)
- `GET /api/public/vehicles` — Browse & filter vehicles (Filter parameters: `showroom_id`, `brand`, `price_min`, `price_max`, `color`, `cc`, `type`, `top_vehicles`).
- `GET /api/public/spare-parts` — Browse & filter spare parts across showrooms.
- `POST /api/public/enquiries` — Send enquiry to a specific showroom or broadcast to all.
- `POST /api/public/service-requests` — Submit bike or car service request.

### Showroom Operations (Admin, Worker, Inventory Manager)
- `GET /api/admin/enquiries` — Showroom Admin views incoming enquiries.
- `GET /api/admin/service-jobs` — Showroom Admin views service requests.
- `POST /api/admin/service-jobs/assign` — Admin assigns service job to a Worker.
- `GET /api/worker/jobs` — Worker views assigned service jobs.
- `PATCH /api/worker/jobs/:id/respond` — Worker approves or rejects assigned job.
- `PATCH /api/worker/jobs/:id/status` — Worker updates job status with timestamp.
- `GET/POST/PUT/DELETE /api/inventory/vehicles` — Inventory Manager / Admin CRUD for bikes & cars.
- `GET/POST/PUT/DELETE /api/inventory/spare-parts` — Inventory Manager / Admin CRUD for spare parts.
- `PATCH /api/inventory/spare-parts/:id/stock` — Inventory Manager responds to part requests / updates stock.
