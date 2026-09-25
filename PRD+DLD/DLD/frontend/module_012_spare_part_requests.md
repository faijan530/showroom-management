# DLD — Frontend — Module 012: Spare Part Requests
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_012 | mobile/module_012

## 1. Routes
```
app/(customer)/spare-parts/
  request/page.tsx          Request a part
  requests/page.tsx         My part requests list
  requests/[id]/page.tsx    Track request
app/(admin)/spare-parts/
  requests/page.tsx         All part requests
  requests/[id]/page.tsx    Request detail + actions
```

## 2. Customer Request Flow
```
Step 1: Search part -> shows availability status
Step 2: Select quantity + add note + select bike (optional)
Step 3: Submit -> POST /api/v1/spare-part-requests
Customer sees status tracker after submission
```

## 3. Request Status Tracker (Customer)
Timeline: REQUESTED -> UNDER_REVIEW -> ORDERED -> IN_TRANSIT -> RECEIVED -> READY -> COMPLETED
ETA displayed when available.

## 4. Admin Request Management
Request detail: Shows customer info, part info, status history, assigned worker.
Action buttons vary by status: [Assign Worker] [Confirm ETA] [Mark Received] [Mark Ready]

## 5. Cross-Layer Mapping
- POST /api/v1/spare-part-requests         -> backend module_012
- GET /api/v1/me/spare-part-requests       -> backend module_012
- PATCH /api/v1/spare-part-requests/:id/*  -> backend module_012
---
*Frontend DLD | Module 012 | Spare Part Requests*
