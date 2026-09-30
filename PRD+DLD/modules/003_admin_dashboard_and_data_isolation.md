# 📄 Module 003 — Admin Dashboard & Multi-Tenant Data Isolation

## Overview
This module governs the Showroom Admin dashboard, performance summary metrics, multi-tenant data boundaries, and staff user provisioning (Workers & Inventory Managers).

---

### US-003-01: Showroom Operational Summary Dashboard
- **As a** Showroom Admin,  
- **I want to** view a summary dashboard of my showroom's key metrics,  
- **So that** I can monitor vehicle counts, spare parts stock, pending customer enquiries, and active service jobs.  
- **Acceptance Criteria:**
  1. Displays summary metric cards for: Total Bikes/Cars, Spare Parts Count, Pending Customer Enquiries, and Active Service Jobs.
  2. Metrics update automatically upon opening the dashboard.

---

### US-003-02: Strict Multi-Tenant Data Isolation
- **As a** Showroom Admin,  
- **I want to** see only data, staff, inventory, and requests belonging strictly to my showroom,  
- **So that** competitor showroom data is completely isolated and protected.  
- **Acceptance Criteria:**
  1. Admin cannot view, modify, or delete vehicles, parts, enquiries, or staff of any other showroom.
  2. All portal views, lists, and reports strictly filter data by the current Admin’s assigned showroom ID.

---

### US-003-03: Staff Account Provisioning (Workers & Inventory Managers)
- **As a** Showroom Admin,  
- **I want to** create user accounts for my technicians (Workers) and Inventory Managers,  
- **So that** I can delegate service tasks and stock management to my team.  
- **Acceptance Criteria:**
  1. Admin can select role (`Worker` or `Inventory Manager`) and input staff details (Name, Email, Phone, Password).
  2. Provisioned staff accounts automatically inherit the Admin's showroom context.
