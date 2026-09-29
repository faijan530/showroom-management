import { UserRole } from '@prisma/client';

export type Role = UserRole;

export interface JwtPayload {
  id: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  showroomId: string | null;
  fullName: string;
}

export interface UserResponse {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  showroom_id: string | null;
}
