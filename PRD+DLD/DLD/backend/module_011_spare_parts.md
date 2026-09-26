# DLD — Backend — Module 011: Spare Parts & Inventory Manager Workflow
## Showroom Application

**Layer:** Backend (Next.js)

---

## 1. Purpose
Empowers **Inventory Managers** and **Admins** to manage spare parts inventory and process spare part availability requests:
- Add, update, edit, and delete spare part listings.
- Respond to spare part requests with expected delivery/availability time.
- Manage product stock quantity upon vehicle or spare part purchase.

---

## 2. API Endpoints

### 2.1 Manage Spare Part Catalog (Inventory Manager)
- `POST /api/inventory/spare-parts`
- `PUT /api/inventory/spare-parts/:id`
- `DELETE /api/inventory/spare-parts/:id`
- Body:
  ```json
  {
    "part_name": "Front Brake Pads",
    "part_code": "BP-2026-HERO",
    "vehicle_type": "BIKE", // BIKE, CAR, BOTH
    "price": 1200,
    "stock_quantity": 25,
    "description": "Ceramic brake pads compatible with Hero bikes"
  }
  ```

### 2.2 Respond to Spare Part Request & Stock Management
- `PATCH /api/inventory/spare-part-requests/:id/respond`
- Body:
  ```json
  {
    "expected_time": "2 Business Days",
    "availability_status": "AVAILABLE",
    "stock_quantity": 24
  }
  ```
