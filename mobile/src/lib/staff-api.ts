import { apiClient } from './api-client';

export interface StaffMember {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  role: 'WORKER' | 'INVENTORY_MANAGER';
  created_at: string;
}

export interface CreateStaffInput {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
  role: 'WORKER' | 'INVENTORY_MANAGER';
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  const response = await apiClient.get('/admin/staff');
  return response.data.data.staff || [];
}

export async function createStaffMember(input: CreateStaffInput): Promise<StaffMember> {
  const response = await apiClient.post('/admin/staff', input);
  return response.data.data.staff;
}
