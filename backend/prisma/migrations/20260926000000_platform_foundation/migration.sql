-- Create Showrooms Table
CREATE TABLE "showrooms" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "name"          TEXT NOT NULL,
  "code"          TEXT NOT NULL UNIQUE,
  "address"       TEXT NOT NULL,
  "contact_phone" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "logo_url"      TEXT,
  "status"        TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "showrooms_pkey" PRIMARY KEY ("id")
);

-- Create Users Table (5 Roles)
CREATE TYPE "user_role" AS ENUM ('SUPERADMIN', 'ADMIN', 'WORKER', 'INVENTORY_MANAGER', 'USER');

CREATE TABLE "users" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "showroom_id"   UUID,
  "full_name"     TEXT NOT NULL,
  "email"         TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "phone"         TEXT,
  "role"          "user_role" NOT NULL DEFAULT 'USER',
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_showroom_fkey" FOREIGN KEY ("showroom_id") REFERENCES "showrooms"("id") ON DELETE CASCADE
);
