# 📄 Module 001 — Platform Foundation & Authentication

## Overview
This module covers user authentication, role-based access control, self-service customer registration, and user profile management across all 5 system roles: Superadmin, Showroom Admin, Worker, Inventory Manager, and Customer.

---

### US-001-01: Multi-Role Unified Secure Login
- **As a** registered platform user (*Superadmin, Showroom Admin, Worker, Inventory Manager, or Customer*),  
- **I want to** log in securely using my credentials from a central login portal,  
- **So that** I am directed to my specific role dashboard with appropriate system permissions.  
- **Acceptance Criteria:**
  1. The login system recognizes user role upon validation and redirects to the correct portal view.
  2. Clear, user-friendly error messages appear for invalid email or password credentials.
  3. Active sessions persist securely until explicit logout or session expiry.

---

### US-001-02: Self-Service Customer Registration
- **As a** new customer,  
- **I want to** register an account using basic profile details,  
- **So that** I can track my vehicle enquiries, service requests, and spare part orders.  
- **Acceptance Criteria:**
  1. Mandatory fields include Full Name, Email Address, Phone Number, and Password.
  2. Duplicate email registrations are prevented with an immediate notification.
  3. On successful registration, the customer is logged in automatically and redirected to the marketplace home.

---

### US-001-03: User Profile & Password Management
- **As any** logged-in platform user,  
- **I want to** update my personal profile information and change my password,  
- **So that** my contact details remain accurate and my account stays secure.  
- **Acceptance Criteria:**
  1. Password change requires verifying the current password before setting a new one.
  2. Profile updates immediately reflect across all relevant dashboard and header components.
