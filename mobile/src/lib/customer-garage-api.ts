import { apiClient } from './api-client';

export interface CustomerVehicleItem {
  id: string;
  user_id: string;
  title: string;
  vehicle_type: 'BIKE' | 'CAR';
  reg_number: string;
  brand: string;
  model: string;
  year: number;
  created_at: string;
}

export interface AddCustomerVehicleInput {
  title: string;
  vehicle_type: 'BIKE' | 'CAR';
  reg_number: string;
  brand: string;
  model: string;
  year: number;
}

export async function getCustomerGarageVehicles(): Promise<CustomerVehicleItem[]> {
  const response = await apiClient.get('/customer/vehicles');
  return response.data.data.vehicles || [];
}

export async function addCustomerGarageVehicle(
  input: AddCustomerVehicleInput
): Promise<CustomerVehicleItem> {
  const response = await apiClient.post('/customer/vehicles', input);
  return response.data.data.vehicle;
}
