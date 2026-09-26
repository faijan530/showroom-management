# DLD — Backend — Module 002: Authentication & Role Credentials
## Showroom Application

**Layer:** Backend (Next.js)

---

## 1. Purpose
Provides authentication services for all 5 system roles:
- **Superadmin**
- **Admin**
- **Worker**
- **Inventory Manager**
- **User / Customer**

It manages secure credential creation, login validation, JWT issuance, and RBAC middleware authorization.

---

## 2. API Endpoints

### 2.1 Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@showroom.com",
    "password": "SecurePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "usr-123",
        "full_name": "Showroom Admin",
        "email": "admin@showroom.com",
        "role": "ADMIN",
        "showroom_id": "shw-456"
      }
    }
  }
  ```

### 2.2 Provision Staff Credentials (Admin Action)
- **Endpoint:** `POST /api/admin/staff`
- **Access:** Admin
- **Request Body:**
  ```json
  {
    "full_name": "John Worker",
    "email": "worker@showroom.com",
    "password": "WorkerPassword123",
    "phone": "+1234567890",
    "role": "WORKER" // or "INVENTORY_MANAGER"
  }
  ```
- **Behavior:** Automatically links the created account to the authenticated Admin's `showroom_id`.

---

## 3. RBAC & Data Isolation Middleware

```typescript
export function requireRole(allowedRoles: Role[]) {
  return async (req: NextRequest) => {
    const user = await verifyJwtToken(req);
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }
    return user;
  };
}
```
