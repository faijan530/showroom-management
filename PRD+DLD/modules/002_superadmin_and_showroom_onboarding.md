# 📄 Module 002 — Superadmin & Showroom Onboarding

## Overview
This module defines the capabilities for platform Superadmins to manage showroom branches, onboard new dealerships, create showroom admin accounts, and control operational status platform-wide.

---

### US-002-01: Register & Onboard New Showrooms
- **As a** Superadmin,  
- **I want to** register a new showroom branch with complete business details,  
- **So that** new dealership branches can join the platform marketplace.  
- **Acceptance Criteria:**
  1. Input fields include Showroom Name, Address, Contact Phone, Email, City, State, and Logo/Banner image.
  2. Showroom status defaults to `Active` upon creation.
  3. Registered showroom appears immediately in public discovery and administration lists.

---

### US-002-02: Provision Showroom Admin Accounts
- **As a** Superadmin,  
- **I want to** create and attach a Showroom Admin account to a specific registered showroom,  
- **So that** the appointed dealership manager can access and manage their showroom operations.  
- **Acceptance Criteria:**
  1. Superadmin selects target showroom from a list of active registered showrooms.
  2. Admin credentials (Name, Email, Password) are created and attached to the chosen showroom.
  3. System verifies that an admin account is successfully tied to exactly one showroom context.

---

### US-002-03: Showroom Activation & Status Control
- **As a** Superadmin,  
- **I want to** activate, deactivate, or edit registered showrooms,  
- **So that** I can control platform participation and operational status.  
- **Acceptance Criteria:**
  1. Deactivating a showroom hides its vehicles and spare parts from public marketplace search.
  2. Reactivating a showroom restores full visibility of its catalog instantly.
