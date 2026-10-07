export type SparePartVehicleType = 'BIKE' | 'CAR' | 'BOTH';

export interface SparePart {
  id: string;
  showroom_id: string;
  showroom_name?: string;
  showroom_code?: string;
  part_name: string;
  part_code: string;
  category: string;
  vehicle_type: SparePartVehicleType;
  price: number;
  stock_quantity: number;
  min_stock_alert: number;
  is_low_stock?: boolean;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
}

export interface CreateSparePartInput {
  showroom_id?: string;
  part_name: string;
  part_code: string;
  category?: string;
  vehicle_type: SparePartVehicleType;
  price: number;
  stock_quantity: number;
  min_stock_alert?: number;
  description?: string;
  image_url?: string;
}

export interface SparePartFilterParams {
  showroom_id?: string;
  category?: string;
  vehicle_type?: SparePartVehicleType | 'ALL';
  low_stock?: boolean;
  search?: string;
}
