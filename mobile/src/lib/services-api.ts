import { apiClient } from './api-client';

export type ServiceJobStatus = 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkerApproval = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  worker_approval: WorkerApproval;
  status: ServiceJobStatus;
  status_notes?: string | null;
  status_updated_at?: string;
  created_at: string;
}

export interface CreateServiceJobInput {
  customer_name: string;
  customer_phone: string;
  vehicle_type?: 'BIKE' | 'CAR';
  vehicle_details: string;
  service_description: string;
  assigned_worker_id?: string;
  target_showroom_id?: string;
}

export interface UpdateServiceJobInput {
  assigned_worker_id?: string | null;
  worker_approval?: WorkerApproval;
  status?: ServiceJobStatus;
  status_notes?: string;
}

export async function createServiceJob(input: CreateServiceJobInput): Promise<ServiceJobItem> {
  const response = await apiClient.post('/services', input);
  return response.data.data.service_job;
}

export async function getServiceJobs(status?: string): Promise<ServiceJobItem[]> {
  const params = status && status !== 'ALL' ? { status } : {};
  const response = await apiClient.get('/services', { params });
  return response.data.data.service_jobs || [];
}

export async function getServiceJobById(id: string): Promise<ServiceJobItem> {
  const response = await apiClient.get(`/services/${id}`);
  return response.data.data.service_job;
}

export async function updateServiceJob(
  id: string,
  input: UpdateServiceJobInput
): Promise<ServiceJobItem> {
  const response = await apiClient.put(`/services/${id}`, input);
  return response.data.data.service_job;
}
