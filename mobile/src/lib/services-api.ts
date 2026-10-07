import { apiClient } from './api-client';

export interface ServiceJobItem {
  id: string;
  showroom_id: string;
  showroom_name?: string;
  customer_name: string;
  customer_phone: string;
  vehicle_type: 'BIKE' | 'CAR';
  vehicle_details: string;
  service_description: string;
  assigned_worker_id?: string | null;
  assigned_worker_name?: string | null;
  assigned_worker_phone?: string | null;
  worker_approval: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_notes?: string | null;
  created_at: string;
}

export async function getServiceJobs(status?: string): Promise<ServiceJobItem[]> {
  const params = status && status !== 'ALL' ? { status } : {};
  const response = await apiClient.get('/services', { params });
  return response.data.data.service_jobs || [];
}
