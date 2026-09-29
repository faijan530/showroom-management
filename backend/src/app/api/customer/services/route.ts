import { NextRequest } from 'next/server';
import { ApiResponse } from '@/shared/response/api-response';

export async function GET(req: NextRequest) {
  const serviceCatalog = [
    {
      id: 'srv-gen-01',
      title: 'Full General Servicing & Inspection',
      vehicle_type: 'BOTH',
      price: 699,
      duration: '2 Hours',
      features: [
        '50-Point Safety Check',
        'Engine Tune-Up',
        'Spark Plug Cleaning',
        'Brake Adjustment',
        'Chain Lubrication',
      ],
      description: 'Comprehensive general maintenance and safety inspection for bikes & cars.',
    },
    {
      id: 'srv-oil-02',
      title: 'Synthetic Engine Oil & Filter Change',
      vehicle_type: 'BOTH',
      price: 899,
      duration: '45 Mins',
      features: [
        'Premium 10W-30 Synthetic Oil',
        'Oil Filter Replacement',
        'Engine Flushing',
        'Waste Oil Recycling',
      ],
      description: 'Maximize engine lifespan and fuel efficiency with genuine synthetic motor oil.',
    },
    {
      id: 'srv-brk-03',
      title: 'Disc Brake Pad & Fluid Replacement',
      vehicle_type: 'BOTH',
      price: 450,
      duration: '1 Hour',
      features: [
        'Front & Rear Brake Pad Check',
        'Brake Fluid Bleeding (DOT 4)',
        'Rotor Polish',
        'Brake Lever Adjustment',
      ],
      description: 'Essential brake safety maintenance for responsive stopping power.',
    },
    {
      id: 'srv-wsh-04',
      title: 'Deep Foam Wash & Teflon Polish',
      vehicle_type: 'BOTH',
      price: 350,
      duration: '1 Hour',
      features: [
        'High-Pressure Foam Wash',
        'Underbody Cleaning',
        'Teflon Body Coating Polish',
        'Tyre Dressing',
      ],
      description: 'Restore showroom shine with high-pressure snow foam washing.',
    },
  ];

  return ApiResponse.success({ services: serviceCatalog });
}
