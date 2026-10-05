import { apiClient } from './api-client';
import { Vehicle, VehicleFilterParams } from '../types/vehicle';

export async function getVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
  const queryParams: Record<string, string> = {};

  if (params?.type && params.type !== 'ALL') {
    queryParams.type = params.type;
  }
  if (params?.brand && params.brand.trim() !== '') {
    queryParams.brand = params.brand.trim();
  }
  if (params?.showroom_id) {
    queryParams.showroom_id = params.showroom_id;
  }

  const response = await apiClient.get('/vehicles', { params: queryParams });
  return response.data.data.vehicles || [];
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const response = await apiClient.get(`/vehicles/${id}`);
  return response.data.data.vehicle;
}
