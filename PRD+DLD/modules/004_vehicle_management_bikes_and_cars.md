# 📄 Module 004 — Vehicle Management (Bikes & Cars)

## Overview
This module handles vehicle inventory creation, specification updates, image management, category tagging (Bike/Car), price configuration, and stock management for individual showrooms.

---

### US-004-01: Add New Vehicles (Bikes & Cars)
- **As an** Inventory Manager or Showroom Admin,  
- **I want to** add new vehicle listings under either Bike or Car category,  
- **So that** customers can browse available vehicle models online.  
- **Acceptance Criteria:**
  1. Form fields include Category (`Bike` / `Car`), Brand/Company, Model Name, Model Year, Engine CC, Price, Color, Stock Quantity, Description, and Image Uploads.
  2. Brand selection supports dynamic custom brands per showroom.
  3. Added vehicles immediately update the showroom inventory and public marketplace.

---

### US-004-02: Edit & Update Vehicle Specifications
- **As an** Inventory Manager or Showroom Admin,  
- **I want to** update price, stock, color, images, or specifications of existing vehicles,  
- **So that** listed vehicle details remain accurate for potential buyers.  
- **Acceptance Criteria:**
  1. Modifications update immediately on public vehicle detail pages.
  2. Vehicle automatically displays Out of Stock badge if stock quantity reaches zero.

---

### US-004-03: Vehicle Removal & Archive
- **As an** Inventory Manager or Showroom Admin,  
- **I want to** remove or archive discontinued vehicle models,  
- **So that** customers do not enquire about unavailable stock.  
- **Acceptance Criteria:**
  1. Confirmation modal prompts the user before deleting a vehicle record.
  2. Archived/Deleted vehicles are immediately removed from public search results.
