# DLD — Mobile — Module 013: Content Management
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_013 | frontend/module_013

## 1. Screens
```
app/(tabs)/home.tsx      Home tab: banners, announcements, featured content
```

## 2. Home Tab
```typescript
// FlatList or ScrollView (not FlashList, content is short)
// Banner carousel: Animated horizontal swiper with auto-advance
// Announcements: Card list (latest 3)
// Featured Bikes: Horizontal FlashList
// Featured Services: Horizontal FlashList
```

## 3. Banner Carousel (Mobile)
```typescript
// Using react-native-reanimated for smooth animations
// Auto-advance every 4 seconds
// Dot indicator at bottom
// CTA button navigates to ctaUrl (internal route or webview)
```

## 4. Data Fetching
```typescript
// useQuery: GET /api/v1/content?type=BANNER (staleTime: 5min)
// useQuery: GET /api/v1/content?type=ANNOUNCEMENT (staleTime: 5min)
// Pull-to-refresh supported
```

## 5. Cross-Layer Mapping
- GET /api/v1/content (banners, announcements) -> backend module_013
- Admin content management is web-only
---
*Mobile DLD | Module 013 | Content Management*
