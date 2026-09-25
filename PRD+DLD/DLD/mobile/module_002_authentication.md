# DLD — Mobile — Module 002: Authentication
**Layer:** Mobile (Expo) | **Mapped To:** backend/module_002 | frontend/module_002

## 1. Screens
```
app/auth/
  login.tsx           Login screen (all roles)
  register.tsx        Customer registration
  forgot-password.tsx Forgot password
  reset-password.tsx  Reset password (deep link)
  worker-setup.tsx    Worker account setup (deep link)
```

## 2. Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}
// On login: store accessToken + refreshToken in Expo SecureStore
// On app start: read token from SecureStore, call GET /auth/me to validate
```

## 3. Login Screen
```typescript
// React Hook Form + Zod
const { control, handleSubmit } = useForm({ resolver: zodResolver(loginSchema) });
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/api/v1/auth/login', data),
  onSuccess: async ({ data }) => {
    await SecureStorage.setTokens(data.accessToken, data.refreshToken);
    authStore.setUser(data.user);
    // Navigate based on role
    if (data.user.role === 'WORKER') router.replace('/(worker)/dashboard');
    else if (data.user.role === 'CUSTOMER') router.replace('/(tabs)/');
    else router.replace('/(admin)/dashboard');
  },
});
```

## 4. Token Refresh (Interceptor)
```typescript
// On 401 response:
// 1. Get refreshToken from SecureStore
// 2. POST /api/v1/auth/refresh-token
// 3. Store new tokens
// 4. Retry original request
```

## 5. Deep Link: Worker Setup
```
URL: myapp://worker/setup?token=xxx
Handled in app/auth/worker-setup.tsx
Extracts token from URL params -> POST /api/v1/auth/worker/setup
```

## 6. Cross-Layer Mapping
- POST /api/v1/auth/login          -> backend module_002
- POST /api/v1/auth/refresh-token  -> backend module_002
- GET  /api/v1/auth/me             -> backend module_002
- Token in Expo SecureStore (mobile) vs HttpOnly cookie (web)
---
*Mobile DLD | Module 002 | Authentication*
