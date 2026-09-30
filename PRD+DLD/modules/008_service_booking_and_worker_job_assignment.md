# 📄 Module 008 — Service Booking & Worker Job Assignment

## Overview
This module facilitates vehicle servicing appointment scheduling by customers, admin job allocation to technicians, worker job acceptance/rejection, and progress updates with timestamp logs.

---

### US-008-01: Customer Vehicle Service Appointment Booking
- **As a** Customer,  
- **I want to** schedule a bike or car servicing appointment with a chosen showroom,  
- **So that** I can get my vehicle serviced at a convenient date and time.  
- **Acceptance Criteria:**
  1. Customer selects Vehicle Type (Bike/Car), Vehicle Brand/Model, Service Category (Routine Service, Major Repair, Inspection), Preferred Date & Time slot, and Description.
  2. Booking confirmation appears immediately in the customer dashboard.

---

### US-008-02: Admin Service Job Allocation to Technicians
- **As a** Showroom Admin,  
- **I want to** assign incoming service requests to specific Workers (technicians/mechanics),  
- **So that** maintenance tasks are assigned to available staff.  
- **Acceptance Criteria:**
  1. Admin views list of pending service requests and selects an available Technician from their showroom staff directory.
  2. Status changes from `Pending Assignment` to `Assigned to Worker`.

---

### US-008-03: Worker Job Acceptance & Status Updates with Timestamps
- **As a** Worker (Technician),  
- **I want to** review assigned service jobs, accept or decline them, and update job progress with live timestamps,  
- **So that** management and customers have real-time visibility on service progression.  
- **Acceptance Criteria:**
  1. Worker sees a dedicated task panel listing assigned jobs.
  2. Worker can click `Accept` or `Reject` with a reason.
  3. Worker updates status through stages (`Pending` ➔ `Accepted` ➔ `In Progress` ➔ `Completed`).
  4. Each status change logs an automatic, immutable timestamp record (e.g., *"2026-09-30 14:30 — Status changed to IN_PROGRESS by Worker"*).
