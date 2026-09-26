# Showroom Application — Product Requirements Summary (v2.0)

This document is aligned with the active PRD [PRD_Showroom_Bike_Service_SaaS.md](file:///c:/Users/faizadev/Desktop/showroom-management/PRD+DLD/PRD_Showroom_Bike_Service_SaaS.md).

## Core Application Overview
The Showroom Application is a multi-showroom vehicle marketplace and management system for **Bikes and Cars**, spare parts sales, showroom enquiries, and service request assignments.

## 5 Roles
1. **Superadmin**: Platform operator who creates showrooms, creates Admin accounts, and maintains marketplace operations.
2. **Admin**: Showroom owner/manager who manages their own showroom collection (bikes, cars, spare parts), creates Worker & Inventory Manager credentials, receives user enquiries/requests, and assigns service jobs to workers.
3. **Worker**: Showroom technician who receives assigned service tasks, approves/rejects them, and updates task statuses with timestamps.
4. **Inventory Manager**: Manages vehicle specs and spare part details (CRUD), handles part availability requests, and manages product stock levels.
5. **User / Customer**: Browses and filters bikes & cars (by Showroom, Brand, Price, Color, CC), browses spare parts, discovers Top Vehicles, sends enquiries to single or all showrooms, and requests servicing.

## Strictly Obsolete & Removed
- SaaS subscription management and billing
- Complex service workflow engines and automated worker assignment
- Worker productivity & revenue analytics
- Automated SMS/Email/Push notifications
- Feature flags & platform telemetry
