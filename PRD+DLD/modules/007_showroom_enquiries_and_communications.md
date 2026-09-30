# 📄 Module 007 — Showroom Enquiries & Communications

## Overview
This module governs customer enquiries regarding vehicle purchase, pricing, spare part availability, and service consultations. Supports single showroom targeting or broadcasting to all showrooms.

---

### US-007-01: Single or Broadcast Showroom Enquiry
- **As a** Customer,  
- **I want to** submit an enquiry to a specific showroom or broadcast it to "All Showrooms",  
- **So that** I can inquire about pricing, discounts, availability, or test drives efficiently.  
- **Acceptance Criteria:**
  1. Form allows selecting Enquiry Type (`General Enquiry`, `Vehicle Purchase`, `Spare Part Availability`, `Service Consultation`).
  2. Customer can pick a target showroom OR choose "Broadcast to All Showrooms".
  3. Confirmation message displays with an enquiry reference number.

---

### US-007-02: Showroom Enquiry Inbox & Management
- **As a** Showroom Admin,  
- **I want to** receive and review customer enquiries submitted to my showroom,  
- **So that** my sales team can respond promptly to prospective buyers.  
- **Acceptance Criteria:**
  1. Inbox displays sender name, contact info, enquiry type, submission timestamp, and status (`New`, `In Review`, `Replied`).
  2. Broadcast enquiries sent by users appear in all recipient showroom inboxes.
