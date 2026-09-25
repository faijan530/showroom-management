# DLD — Mobile — Module 001: Platform Foundation
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_001 | frontend/module_001

## 1. Purpose
Expo app bootstrap: navigation setup, API client, query config, design tokens, health check on startup.

## 2. Key Files
```
mobile/
  app/_layout.tsx          Root layout (font loading, QueryProvider, SafeAreaProvider)
  src/lib/
    api-client.ts          Axios instance with base URL + auth headers
    query-client.ts        TanStack Query client config
    secure-storage.ts      Expo SecureStore wrapper
  src/components/ui/
    Button.tsx, Input.tsx, Card.tsx, Badge.tsx, Spinner.tsx
    Text.tsx, SafeScreen.tsx, Toast.tsx
```

## 3. API Client (Mobile)
```typescript
// src/lib/api-client.ts
// Mobile sends JWT in Authorization header (not cookie)
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStorage.getAccessToken();
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
// Refresh token interceptor on 401
```

## 4. Health Check on App Start
```typescript
// In app/_layout.tsx: check API reachability
useEffect(() => {
  apiClient.get('/api/health')
    .catch(() => Toast.show('Cannot reach server. Check connection.'));
}, []);
```

## 5. Cross-Layer Mapping
- GET /api/health -> backend module_001
- Token stored in Expo SecureStore (NOT AsyncStorage)
---
*Mobile DLD | Module 001 | Platform Foundation*
