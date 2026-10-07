import { apiClient } from './api-client';

export interface SubmitFeedbackInput {
  service_job_id: string;
  rating: number;
  comment?: string;
}

export interface FeedbackItem {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_display_name?: string;
  showroom_id?: string;
  showroom_name?: string;
  vehicle_details?: string;
  service_description?: string;
  rating: number;
  comment?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_response?: string | null;
  responded_at?: string | null;
  created_at: string;
}

export interface RespondFeedbackInput {
  admin_response?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export async function submitServiceFeedback(input: SubmitFeedbackInput): Promise<FeedbackItem> {
  const response = await apiClient.post('/feedback', input);
  return response.data.data.feedback;
}

export async function getAdminShowroomFeedbacks(status?: string): Promise<FeedbackItem[]> {
  const params = status && status !== 'ALL' ? { status } : {};
  const response = await apiClient.get('/admin/feedback', { params });
  return response.data.data.feedbacks || [];
}

export async function respondToFeedback(
  id: string,
  input: RespondFeedbackInput
): Promise<FeedbackItem> {
  const response = await apiClient.put(`/admin/feedback/${id}`, input);
  return response.data.data.feedback;
}
