# DLD — Frontend — Module 016: Feedback
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_016 | mobile/module_016

## 1. Routes
```
app/(customer)/feedback/
  page.tsx                 Public feedback page (approved only)
  submit/[serviceId]/page.tsx  Submit feedback for a completed service
  history/page.tsx         My submitted feedback
app/(admin)/feedback/
  page.tsx                 All feedback (admin view)
  [id]/page.tsx            Feedback detail + respond
```

## 2. Feedback Submit Form (Customer)
```typescript
// 5-star rating component + comment textarea
// Only shown when service status = COMPLETED and no feedback yet
const form = useForm({ resolver: zodResolver(feedbackSchema) });
// feedbackSchema: rating (1-5), comment (optional, max 500 chars)
// POST /api/v1/feedback with serviceRequestId
```

## 3. Star Rating Component
```typescript
// Interactive star rating: 1-5 stars
// Hover state shows gold stars
// Selected state persists gold stars
// Label: "Terrible | Poor | Average | Good | Excellent"
```

## 4. Admin Feedback View
List with tabs: All | Pending | Approved | Rejected
Each row: Customer (first name only) | Rating stars | Comment excerpt | Date | Status | Actions
Actions: [Approve] [Reject] [Respond]
Respond: textarea -> PATCH /api/v1/admin/feedback/:id/respond

## 5. Public Feedback Display
Approved feedback shown on /feedback page.
Customer shown as first name + last initial only (privacy).
Average rating badge displayed prominently.

## 6. Cross-Layer Mapping
- POST /api/v1/feedback                   -> backend module_016
- GET /api/v1/feedback (public, cached)   -> backend module_016
- PATCH /api/v1/admin/feedback/:id/*      -> backend module_016
---
*Frontend DLD | Module 016 | Feedback*
