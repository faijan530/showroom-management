# DLD — Backend — Module 008: Service Requests & User Enquiries
## Showroom Application

**Layer:** Backend (Next.js)

---

## 1. Purpose
Handles user-submitted service requests (Bike or Car servicing) and showroom enquiries:
- Users select vehicle type, request details, and target showroom.
- Enquiries can be sent to a specific showroom OR broadcasted to all relevant showrooms.
- Showroom Admins view requests in their inbox and assign servicing to Workers.

---

## 2. Endpoints

### 2.1 Submit Service Request (User)
- `POST /api/public/service-requests`
- Body:
  ```json
  {
    "target_showroom_id": "shw-001",
    "vehicle_type": "BIKE", // or "CAR"
    "vehicle_name": "TVS Apache RTR 200",
    "service_type": "General Servicing",
    "customer_name": "Alex",
    "customer_phone": "+19876543210",
    "notes": "Engine oil change and brake check"
  }
  ```

### 2.2 Submit Showroom Enquiry (User)
- `POST /api/public/enquiries`
- Body:
  ```json
  {
    "target_showroom_id": "shw-001", // Nullable if broadcast_to_all is true
    "broadcast_to_all": true,
    "enquiry_type": "SPARE_PART_PURCHASE",
    "customer_name": "Sam",
    "customer_phone": "+19876543211",
    "message": "Inquiring about Maruti Swift brake pads availability"
  }
  ```
