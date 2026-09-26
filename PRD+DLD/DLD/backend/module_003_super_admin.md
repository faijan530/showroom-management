# DLD — Backend — Module 003: Superadmin & Showroom Management
## Showroom Application

**Layer:** Backend (Next.js)

---

## 1. Purpose
Allows the **Superadmin** to onboard and manage Showrooms, create Admin credentials for newly registered showrooms, and monitor overall marketplace functionality.

---

## 2. Requirements Covered
1. Superadmin authentication.
2. Add a Showroom after logging in.
3. Manage active Showrooms.
4. Provision Showroom Admin credentials.
5. Multi-vehicle platform (Bikes & Cars).

---

## 3. Endpoints

### 3.1 Create Showroom
- `POST /api/superadmin/showrooms`
- Body: `{ name, code, address, contact_phone, contact_email, logo_url }`

### 3.2 List Showrooms
- `GET /api/superadmin/showrooms`

### 3.3 Create Showroom Admin Credentials
- `POST /api/superadmin/admins`
- Body: `{ showroom_id, full_name, email, password, phone }`
- Assigns role `ADMIN` tied strictly to `showroom_id`.
