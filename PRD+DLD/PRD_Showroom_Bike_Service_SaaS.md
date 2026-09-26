# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Showroom Application — Multi-Showroom Vehicle & Service Marketplace

---

| Field | Value |
|-------|-------|
| **Product Name** | Showroom Application |
| **Version** | 2.0 — Final Source of Truth |
| **Date** | September 26, 2026 |
| **Author** | Lead Product Architect |
| **Status** | Approved & Active |
| **Classification** | Single Source of Truth |

---

> [!IMPORTANT]
> **REQUIREMENT RESET NOTICE**: This document represents the **SINGLE SOURCE OF TRUTH** for the Showroom Application. All previous concepts regarding complex SaaS billing, multi-tenant subscription tiers, automated notification engines, complex workforce/revenue analytics, feature flags, and automated service assignment algorithms are **OBSOLETE AND REMOVED**.

---

## Table of Contents

1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Core Product Concept](#2-core-product-concept)
3. [User Roles & RBAC Matrix](#3-user-roles--rbac-matrix)
4. [System Panels Overview](#4-system-panels-overview)
5. [Role Detailed Requirements](#5-role-detailed-requirements)
   - [5.1 Superadmin](#51-superadmin)
   - [5.2 Admin (Showroom Owner/Manager)](#52-admin-showroom-ownermanager)
   - [5.3 Worker (Mechanic/Technician)](#53-worker-mechanictechnician)
   - [5.4 Inventory Manager](#54-inventory-manager)
   - [5.5 User / Customer](#55-user--customer)
6. [Feature Modules — Detailed Specifications](#6-feature-modules--detailed-specifications)
   - [Module 001 — Platform Foundation & Authentication](#module-001--platform-foundation--authentication)
   - [Module 002 — Superadmin & Showroom Management](#module-002--superadmin--showroom-management)
   - [Module 003 — Admin Dashboard & Data Isolation](#module-003--admin-dashboard--data-isolation)
   - [Module 004 — Vehicle Management (Bikes & Cars)](#module-004--vehicle-management-bikes--cars)
   - [Module 005 — Spare Parts Catalog & Stock Control](#module-005--spare-parts-catalog--stock-control)
   - [Module 006 — User Discovery & Marketplace Browsing](#module-006--user-discovery--marketplace-browsing)
   - [Module 007 — Showroom Enquiries & Communications](#module-007--showroom-enquiries--communications)
   - [Module 008 — Service Requests & Worker Job Assignment](#module-008--service-requests--worker-job-assignment)
   - [Module 009 — Inventory Manager Workflow & Order Stock Adjustment](#module-009--inventory-manager-workflow--order-stock-adjustment)
7. [Admin Data Isolation Rules](#7-admin-data-isolation-rules)
8. [Removed & Obsolete Functionality](#8-removed--obsolete-functionality)
9. [Non-Functional & Performance Requirements](#9-non-functional--performance-requirements)

---

## 1. Executive Summary & Vision

The **Showroom Application** is a practical, user-friendly multi-showroom marketplace and management platform for automobiles (Bikes and Cars) and spare parts. 

The platform bridges customers, showroom owners, workers, inventory managers, and platform superadmins, providing a seamless marketplace for browsing vehicles, purchasing spare parts, sending showroom enquiries, and scheduling bike or car service appointments.

---

## 2. Core Product Concept

- **Local Marketplace Experience**: Users can browse vehicles and spare parts from multiple registered showrooms.
- **Multi-Vehicle Support**: Supports both **Bikes** (e.g., Hero, TVS, Honda, Yamaha, etc.) and **Cars** (e.g., Maruti, Toyota, Hyundai, Tata, etc.). Brands are dynamic and customizable per showroom.
- **Showroom Collection Isolation**: Each Admin manages only their specific showroom's collection, staff credentials, requests, and inventory.
- **Simple & Practical Workflows**: Avoids unnecessary enterprise SaaS complexity. Prioritizes clean user browsing, easy enquiry submission, straightforward service job assignment, and direct stock updates.

---

## 3. User Roles & RBAC Matrix

The system strict defines **5 Main User Roles**:

| Role | Primary Responsibilities | Created By | Scope of Access |
|------|--------------------------|------------|-----------------|
| **1. Superadmin** | Manages platform showrooms, creates Admin credentials, ensures marketplace smooth operation | System / Seed Credentials | Platform-wide |
| **2. Admin** | Manages own showroom collection (bikes/cars/parts), creates Worker & Inventory Manager credentials, assigns service jobs, views showroom enquiries | Superadmin | Own Showroom Only |
| **3. Worker** | Views assigned service jobs, approves/rejects jobs, updates job status with timestamp | Admin | Assigned Jobs Only |
| **4. Inventory Manager** | Manages vehicle and spare parts details, handles spare part availability requests, updates stock quantities on purchases | Admin | Own Showroom Inventory Only |
| **5. User / Customer** | Browses/filters bikes & cars, browses/filters spare parts, submits enquiries to single or all showrooms, requests servicing | Self Registration / Guest | Public Marketplace + Own Requests |

---

## 4. System Panels Overview

1. **User / Marketplace Panel**: Public portal for discovering top vehicles, filtering bikes & cars, browsing spare parts, submitting enquiries, and booking service requests.
2. **Superadmin Panel**: Management portal for creating showrooms, provisioning Admin credentials, and monitoring overall marketplace operation.
3. **Admin Panel**: Showroom operational dashboard for managing inventory, assigning service jobs to workers, handling customer enquiries, and managing staff credentials.
4. **Worker Panel**: Simplified task panel for technicians to view assigned service jobs, accept/reject assignments, and update job status with timestamps.
5. **Inventory Manager Panel**: Focused inventory management portal for CRUD operations on vehicles and spare parts, responding to part availability queries, and managing stock counts.

---

## 5. Role Detailed Requirements

### 5.1 Superadmin
1. Log in securely using Superadmin credentials.
2. Onboard and create new Showrooms in the system.
3. Create Admin credentials linked to specific Showrooms.
4. Manage, activate, or deactivate Showrooms.
5. Ensure overall platform reliability for vehicles (Bikes & Cars) and spare parts listings.

### 5.2 Admin (Showroom Owner / Manager)
1. Log in using credentials provisioned by Superadmin.
2. Manage Showroom collection: Upload, update, and manage Bikes, Cars, and Spare Parts.
3. Create credentials for **Workers** (technicians/mechanics) belonging to their showroom.
4. Create credentials for **Inventory Managers** belonging to their showroom.
5. Receive and view user requests for:
   - Spare part purchase
   - Bike servicing
   - Car servicing
   - Service appointment
   - Showroom enquiry / interest request
6. Assign incoming service requests or minor repair jobs to Workers.
7. **Strict Isolation**: Admins can ONLY see, manage, and modify data associated with their own showroom.

### 5.3 Worker (Mechanic / Technician)
1. Log in using credentials provisioned by their Showroom Admin.
2. View assigned service tasks and repair jobs.
3. Approve or reject an assigned service job.
4. Update service job status (e.g., Pending ➔ Accepted ➔ In Progress ➔ Completed / Rejected) accompanied by explicit completion/update timestamps.

### 5.4 Inventory Manager
1. Log in using credentials provisioned by their Showroom Admin.
2. Full CRUD capability (Add, Update, Edit, Delete) for:
   - Bike details (Brand, model, specs, price, color, CC, images)
   - Car details (Brand, model, specs, price, color, CC, images)
   - Spare parts details (Part name, category, vehicle compatibility, price, stock quantity)
3. Receive spare part requests and respond with expected availability time and stock status.
4. Manage stock quantities automatically or manually upon vehicle or spare part purchase.

### 5.5 User / Customer
1. Homepage dashboard featuring **Top Vehicles** (featured/prominent vehicles).
2. Browse full vehicle catalog (Bikes and Cars across multiple showrooms).
3. Filter vehicles dynamically by:
   - Showroom
   - Company / Brand (e.g., Hero, TVS, Maruti, Toyota, etc.)
   - Price range
   - Color
   - CC (Engine displacement)
   - Vehicle Type (Bike / Car)
4. Dedicated **Spare Parts** section to browse and filter parts by showroom, part name, vehicle type, and price.
5. Submit enquiries/requests to a specific showroom or send a broadcast enquiry to all relevant showrooms.
6. Request servicing appointments for Bikes or Cars.

---

## 6. Feature Modules — Detailed Specifications

### Module 001 — Platform Foundation & Authentication
- User login endpoint for all 5 roles (Superadmin, Admin, Worker, Inventory Manager, User).
- Role-based token generation and access authorization.
- Simple credential management without complex third-party OAuth2 dependencies.

### Module 002 — Superadmin & Showroom Management
- Showroom registration with details (Name, Address, Contact Info, Logo/Image).
- Admin account creation attached to a showroom ID.
- Showroom list and status management.

### Module 003 — Admin Dashboard & Data Isolation
- Dashboard displaying showroom summary (Total Vehicles, Active Spare Parts, Pending Requests, Assigned Worker Jobs).
- Server-side tenant filtering enforcing strict data isolation (queries filtered strictly by `showroom_id`).

### Module 004 — Vehicle Management (Bikes & Cars)
- Dynamic vehicle creation supporting both Bikes and Cars.
- Attributes: Title, Type (`BIKE` | `CAR`), Brand/Company, Model, Year, Price, Color, Engine CC, Stock Quantity, Description, Images, Showroom ID.
- Admin & Inventory Manager edit/delete permissions.

### Module 005 — Spare Parts Catalog & Stock Control
- Spare parts listing with Part Name, Part Code, Price, Compatible Vehicle Types (Bike/Car), Description, Stock Quantity, Images.
- Real-time stock status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).

### Module 006 — User Discovery & Marketplace Browsing
- Public catalog endpoints with multi-attribute filtering (Showroom, Brand, Price, Color, CC, Type).
- "Top Vehicles" highlight section for featured showroom listings.
- Public spare parts browsing with compatibility filtering.

### Module 007 — Showroom Enquiries & Communications
- Enquiry creation form for users: Select single showroom OR select "All Showrooms".
- Request types: General Enquiry, Vehicle Interest, Spare Part Enquiry, Service Enquiry.
- Showroom Admin inbox to view, read, and respond to enquiries.

### Module 008 — Service Requests & Worker Job Assignment
- Service request form for users (Select Vehicle Type, Service Description, Preferred Date/Time, Showroom).
- Admin job allocation interface to select an available Worker.
- Worker job view: Accept / Reject actions.
- Status update logs with timestamps (e.g. `2026-09-26 14:30:00 - Worker updated status to IN_PROGRESS`).

### Module 009 — Inventory Manager Workflow & Order Stock Adjustment
- Inventory task queue for spare part availability inquiries.
- Expected delivery time response interface.
- Automatic decrement of stock quantity upon confirmed vehicle or spare part purchase.

---

## 7. Admin Data Isolation Rules

1. **Server-Side Enforcement**: All database queries initiated by an Admin, Worker, or Inventory Manager MUST implicitly include the authenticated user's `showroom_id`.
2. **No Cross-Showroom Leakage**: Showroom A Admin cannot view, modify, or list vehicles, spare parts, worker details, or enquiries belonging to Showroom B.
3. **User Public Exemption**: End Users / Customers can browse public vehicle and spare part listings across all active showrooms.

---

## 8. Removed & Obsolete Functionality

The following previous components are **EXPLICITLY REMOVED**:

- ❌ Multi-tenant SaaS subscription management & plan tiers (Free, Pro, Enterprise)
- ❌ SaaS billing, payment gateways, & subscription invoices
- ❌ Complex service state workflow engines & automated worker assignment rules
- ❌ Automated notification system (SMS / Email / WhatsApp integration)
- ❌ Worker productivity analytics, revenue analytics, & platform health dashboards
- ❌ Feature flags, A/B testing, & telemetry tracking
- ❌ OAuth2 / Social Login dependencies

---

## 9. Non-Functional & Performance Requirements

- **Simplicity & Maintainability**: Clean, straightforward code architecture without over-engineering.
- **Response Time**: Marketplace catalog filtering response < 200ms.
- **Mobile Responsive**: Full UI support across mobile browsers and responsive viewports.
- **Data Integrity**: Foreign key constraints and atomic transaction updates on stock inventory.
