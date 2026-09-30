# 📄 Module 005 — Spare Parts Catalog & Stock Control

## Overview
This module manages spare part cataloging, pricing, compatibility tagging (Bike/Car/Universal), SKU assignment, and real-time inventory stock level status tracking.

---

### US-005-01: Add & Manage Spare Parts Listing
- **As an** Inventory Manager,  
- **I want to** catalog spare parts with compatibility details, pricing, and stock levels,  
- **So that** vehicle owners can search and request genuine replacement parts.  
- **Acceptance Criteria:**
  1. Information fields include Part Name, Part Code/SKU, Compatible Vehicle Type (`Bike`, `Car`, or `Universal`), Brand, Price, Stock Quantity, Description, and Image.
  2. Part is linked directly to the managing showroom context.

---

### US-005-02: Automated & Manual Stock Status Tracking
- **As an** Inventory Manager,  
- **I want the system to** track stock levels and tag parts as In Stock, Low Stock, or Out of Stock,  
- **So that** I can reorder inventory before supplies run out.  
- **Acceptance Criteria:**
  1. Parts with stock quantity > 5 display as `IN_STOCK`.
  2. Parts with stock quantity between 1 and 5 display a `LOW_STOCK` badge.
  3. Parts with stock quantity = 0 display as `OUT_OF_STOCK` and prevent instant order booking.
