export interface Showroom {
  id: string;
  name: string;
  code: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  logo_url?: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  user_count?: number;
  created_at: string;
}

export interface CreateShowroomInput {
  name: string;
  code: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  logo_url?: string;
}

export interface CreateAdminInput {
  showroom_id: string;
  full_name: string;
  phone: string;
  email?: string;
  password: string;
}
