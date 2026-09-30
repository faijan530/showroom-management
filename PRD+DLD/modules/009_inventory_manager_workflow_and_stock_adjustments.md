# 📄 Module 009 — Inventory Manager Workflow & Stock Adjustments

## Overview
This module defines the workflow for Inventory Managers to process spare part availability queries, provide estimated delivery times, and manage automatic/manual stock quantity adjustments.

---

### US-009-01: Spare Part Availability Request Processing
- **As an** Inventory Manager,  
- **I want to** receive part availability queries and respond with stock confirmation and estimated delivery time,  
- **So that** customers know when their requested spare part will be ready.  
- **Acceptance Criteria:**
  1. Manager receives notification of customer part request.
  2. Manager can select availability status (`In Stock Ready for Pickup`, `Dispatched from Central Warehouse`, `Out of Stock`) and input Expected Availability Date/Days.

---

### US-009-02: Automated & Manual Inventory Stock Adjustment
- **As an** Inventory Manager,  
- **I want** stock levels to decrease automatically upon confirmed orders or manually when stock arrives,  
- **So that** displayed stock counts match actual physical inventory.  
- **Acceptance Criteria:**
  1. Buying a spare part or finalizing a vehicle sale decrements quantity count by the purchased amount.
  2. Manual stock intake form allows adding incoming stock quantity with an audit note.
