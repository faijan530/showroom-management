import { apiClient } from './api-client';

export type EnquiryType =
  | 'GENERAL'
  | 'VEHICLE_PURCHASE'
  | 'SPARE_PART_PURCHASE'
  | 'SERVICE_INQUIRY';

export type EnquiryStatus = 'PENDING' | 'RESPONDED' | 'CLOSED';

export interface CreateEnquiryInput {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  enquiry_type: EnquiryType;
  message: string;
  target_showroom_id?: string;
  broadcast_to_all?: boolean;
}

export interface EnquiryItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  enquiry_type: EnquiryType;
  message: string;
  target_showroom_id?: string | null;
  target_showroom_name?: string | null;
  broadcast_to_all: boolean;
  status: EnquiryStatus;
  response_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<EnquiryItem> {
  const response = await apiClient.post('/enquiries', input);
  return response.data.data.enquiry;
}

export async function getCustomerEnquiries(): Promise<EnquiryItem[]> {
  const response = await apiClient.get('/enquiries');
  return response.data.data.enquiries || [];
}

export async function getShowroomEnquiries(params?: {
  status?: EnquiryStatus;
  enquiry_type?: EnquiryType;
}): Promise<EnquiryItem[]> {
  const response = await apiClient.get('/enquiries', { params });
  return response.data.data.enquiries || [];
}

export async function respondToEnquiry(
  id: string,
  input: {
    status?: EnquiryStatus;
    response_notes?: string;
  }
): Promise<EnquiryItem> {
  const response = await apiClient.put(`/enquiries/${id}`, input);
  return response.data.data.enquiry;
}

