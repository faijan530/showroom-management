# DLD — Mobile — Module 016: Feedback
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_016 | frontend/module_016

## 1. Screens
```
app/(customer)/feedback/
  submit/[serviceId].tsx    Submit feedback (post-service)
  history.tsx               My feedback history
```

## 2. Submit Feedback Screen
```typescript
// Shown via push notification / service completion screen prompt
// 5-star animated rating (react-native-ratings or custom)
// Comment TextInput (multiline, max 500 chars)
// Submit: POST /api/v1/feedback { rating, comment, serviceRequestId }
// Success: confetti animation + thank you message
```

## 3. Post-Service Prompt
```typescript
// After service_requests/:id screen shows COMPLETED status:
// Show "How was your experience?" card with star rating
// Dismiss: hide for this session
// Tap stars: navigate to feedback/submit/[serviceId]
```

## 4. Feedback History
FlashList: service name | Rating stars | Date | Status badge (Pending/Approved)
Shows admin response if available.

## 5. Cross-Layer Mapping
- POST /api/v1/feedback              -> backend module_016
- GET /api/v1/me/feedback            -> backend module_016
---
*Mobile DLD | Module 016 | Feedback*
