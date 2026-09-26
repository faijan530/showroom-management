# Showroom Application — Multi-Showroom Vehicle & Service Marketplace

A multi-showroom marketplace and operational management platform for **Bikes and Cars**, spare parts cataloging, customer enquiries, and workshop service assignments.

---

## 📚 Documentation Index

| Document | Path | Description | Status |
|----------|------|-------------|--------|
| **PRD (v2.0)** | [PRD_Showroom_Bike_Service_SaaS.md](file:///c:/Users/faizadev/Desktop/showroom-management/PRD+DLD/PRD_Showroom_Bike_Service_SaaS.md) | Single Source of Truth Product Requirements Document | ✅ Active |
| **HLD (v2.0)** | [HLD_Showroom_Bike_Service_SaaS.md](file:///c:/Users/faizadev/Desktop/showroom-management/PRD+DLD/HLD_Showroom_Bike_Service_SaaS.md) | High-Level Architecture, Schemas, & API Map | ✅ Active |
| **Backend DLD** | [PRD+DLD/DLD/backend/](file:///c:/Users/faizadev/Desktop/showroom-management/PRD+DLD/DLD/backend/) | Detailed Low-Level Design for Backend Modules | ✅ Active |
| **Frontend DLD** | [PRD+DLD/DLD/frontend/](file:///c:/Users/faizadev/Desktop/showroom-management/PRD+DLD/DLD/frontend/) | Detailed Low-Level Design for Web Panels | ✅ Active |
| **Mobile DLD** | [PRD+DLD/DLD/mobile/](file:///c:/Users/faizadev/Desktop/showroom-management/PRD+DLD/DLD/mobile/) | Detailed Low-Level Design for Mobile Views | ✅ Active |

---

## 👥 5 System Roles & Panels

1. **Superadmin**: Creates Showrooms, provisions Showroom Admin credentials, and maintains overall marketplace operation.
2. **Admin**: Manages own showroom collection (bikes, cars, spare parts), provisions Worker & Inventory Manager credentials, receives user enquiries/requests, and assigns service jobs.
3. **Worker**: Logged-in technician who views assigned service tasks, approves/rejects jobs, and updates job statuses with timestamps.
4. **Inventory Manager**: Manages vehicle specs and spare parts catalog (CRUD), handles part availability queries, and manages stock quantities.
5. **User / Customer**: Marketplace user who browses/filters vehicles (by Showroom, Brand, Price, Color, CC) and spare parts, discovers Top Vehicles, sends enquiries (single or all showrooms), and requests servicing.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 19, TypeScript)
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + RBAC
- **Validation**: Zod
- **Mobile**: Expo / React Native (Responsive Web + Mobile)

---

## 🔒 Strict Admin Data Isolation
Each Showroom Admin, Worker, and Inventory Manager is strictly scoped to their assigned `showroom_id`. Cross-showroom data leakage is prevented via server-side session checks.
