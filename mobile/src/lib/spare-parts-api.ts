import { apiClient } from './api-client';
import {
  SparePart,
  CreateSparePartInput,
  SparePartFilterParams,
} from '../types/spare-part';

export async function getSpareParts(
  params?: SparePartFilterParams
): Promise<SparePart[]> {
  const queryParams: Record<string, string> = {};

  if (params?.showroom_id) {
    queryParams.showroom_id = params.showroom_id;
  }
  if (params?.category) {
    queryParams.category = params.category;
  }
  if (params?.vehicle_type && params.vehicle_type !== 'ALL') {
    queryParams.vehicle_type = params.vehicle_type;
  }
  if (params?.low_stock) {
    queryParams.low_stock = 'true';
  }
  if (params?.search && params.search.trim() !== '') {
    queryParams.search = params.search.trim();
  }

  const response = await apiClient.get('/spare-parts', { params: queryParams });
  return response.data.data.spare_parts || [];
}

export async function getSparePartById(id: string): Promise<SparePart> {
  const response = await apiClient.get(`/spare-parts/${id}`);
  return response.data.data.spare_part;
}

export async function createSparePart(
  input: CreateSparePartInput
): Promise<SparePart> {
  const response = await apiClient.post('/spare-parts', input);
  return response.data.data.spare_part;
}
