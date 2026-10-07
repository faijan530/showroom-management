import { apiClient } from './api-client';
import { Showroom, CreateShowroomInput, CreateAdminInput } from '../types/showroom';

export async function getShowrooms(): Promise<Showroom[]> {
  const response = await apiClient.get('/superadmin/showrooms');
  return response.data.data.showrooms || [];
}

export async function createShowroom(input: CreateShowroomInput): Promise<Showroom> {
  const response = await apiClient.post('/superadmin/showrooms', input);
  return response.data.data.showroom;
}

export async function updateShowroomStatus(
  id: string,
  status: 'ACTIVE' | 'SUSPENDED'
): Promise<Showroom> {
  const response = await apiClient.patch(`/superadmin/showrooms/${id}/status`, { status });
  return response.data.data.showroom;
}

export async function provisionShowroomAdmin(input: CreateAdminInput): Promise<any> {
  const response = await apiClient.post('/superadmin/admins', input);
  return response.data.data.admin;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  actor_name: string;
  actor_role: string;
  showroom_name: string;
  created_at: string;
}

export async function getAuditLogs(): Promise<AuditLogItem[]> {
  const response = await apiClient.get('/superadmin/audit-logs');
  return response.data.data.logs || [];
}

