# DLD — Frontend — Module 002: Authentication
**Layer:** Frontend (Next.js) | **Mapped To:** backend/module_002 | mobile/module_002

## 1. Purpose
Login, register, forgot/reset password pages. Auth state management. Route protection middleware.

## 2. Pages and Routes
```
app/auth/
  login/page.tsx          Login page (all roles)
  register/page.tsx       Customer registration
  forgot-password/page.tsx Forgot password form
  reset-password/page.tsx Reset password (via token URL param)
  worker/setup/page.tsx   Worker account setup (via invitation link)
```

## 3. Auth Store (Zustand)
```typescript
// store/auth.store.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

## 4. Route Protection (Next.js Middleware)
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;
  const isPublic = publicRoutes.some(r => pathname.startsWith(r));
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  if (token && pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

## 5. Login Page Component
```typescript
// app/auth/login/page.tsx (Client Component)
const form = useForm({ resolver: zodResolver(loginSchema) });
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/api/v1/auth/login', data),
  onSuccess: () => router.push('/dashboard'),
  onError: (err) => toast.error(err.message),
});
```

## 6. Forms (React Hook Form + Zod)
- loginSchema: email + password
- registerSchema: firstName, lastName, email, password, phone
- forgotPasswordSchema: email
- resetPasswordSchema: password + confirmPassword
- workerSetupSchema: password + confirmPassword

## 7. Role-Based Redirect After Login
```typescript
switch (user.role) {
  case 'CUSTOMER':        router.push('/dashboard');
  case 'WORKER':          router.push('/worker/dashboard');
  case 'SHOWROOM_ADMIN':  router.push('/admin/dashboard');
  case 'SHOWROOM_MANAGER':router.push('/admin/dashboard');
  case 'PLATFORM_SUPER_ADMIN': router.push('/superadmin/dashboard');
}
```

## 8. Cross-Layer Mapping
- POST /api/v1/auth/login         -> backend module_002
- POST /api/v1/auth/register      -> backend module_002
- Cookies set by backend (HttpOnly) -> frontend reads via GET /auth/me
---
*Frontend DLD | Module 002 | Authentication*
