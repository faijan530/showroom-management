export type VehicleType = 'BIKE' | 'CAR';

export interface Vehicle {
  id: string;
  showroom_id: string;
  showroom_name?: string;
  showroom_code?: string;
  title: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  engine_cc: number;
  stock_quantity: number;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
}

export interface VehicleFilterParams {
  type?: VehicleType | 'ALL';
  brand?: string;
  showroom_id?: string;
}
