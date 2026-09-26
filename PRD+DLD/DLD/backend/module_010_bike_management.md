# DLD — Backend — Module 010: Vehicle Management (Bikes & Cars)
## Showroom Application

**Layer:** Backend (Next.js)

---

## 1. Purpose
Manages vehicle listings (both Bikes and Cars) for showrooms, providing CRUD endpoints for Admins and Inventory Managers, and multi-attribute filtering for end Users.

---

## 2. Dynamic Brands Support
Brands are not hardcoded. Standard examples include:
- **Bikes:** Hero, TVS, Honda, Yamaha, Royal Enfield, Suzuki, KTM, etc.
- **Cars:** Maruti, Toyota, Hyundai, Tata, Mahindra, Kia, etc.
Admins and Inventory Managers can create listings with any brand string.

---

## 3. Endpoints

### 3.1 Create / Update Vehicle (Admin or Inventory Manager)
- `POST /api/inventory/vehicles`
- `PUT /api/inventory/vehicles/:id`
- Body:
  ```json
  {
    "type": "BIKE", // or "CAR"
    "brand": "Hero",
    "model": "Splendor Plus",
    "year": 2026,
    "price": 75000,
    "color": "Black",
    "cc": 110,
    "is_top_vehicle": true,
    "stock_quantity": 10,
    "description": "High fuel economy motorcycle",
    "image_urls": ["https://..."]
  }
  ```

### 3.2 Public Vehicle Search & Filtering (Users)
- `GET /api/public/vehicles`
- Query Params:
  - `showroom_id`: Optional UUID filter
  - `brand`: Filter by brand (Hero, TVS, Maruti, Toyota, etc.)
  - `type`: `BIKE` | `CAR`
  - `price_min` & `price_max`
  - `color`: Filter by color
  - `cc_min` & `cc_max`: Engine capacity filter
  - `is_top_vehicle`: true (Highlight section)
