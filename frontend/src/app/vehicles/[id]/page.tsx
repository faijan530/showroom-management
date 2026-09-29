'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bike, Car, Store, Phone, Mail, MapPin, ArrowLeft, Wrench, MessageSquare, ShieldCheck } from 'lucide-react';

interface VehicleDetailResponse {
  success: boolean;
  data: {
    vehicle: {
      id: string;
      showroom_id: string;
      showroom?: {
        id: string;
        name: string;
        code: string;
        address: string;
        contactPhone: string;
        contactEmail: string;
      };
      title: string;
      type: 'BIKE' | 'CAR';
      brand: string;
      model: string;
      year: number;
      price: number;
      color: string;
      engine_cc: number;
      stock_quantity: number;
      description?: string;
      image_url?: string;
      created_at: string;
    };
  };
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const id = params?.id as string;

  const { data, isLoading, isError } = useQuery<VehicleDetailResponse>({
    queryKey: ['public-vehicle-detail', id],
    queryFn: () => apiClient<VehicleDetailResponse>(`/vehicles/${id}`),
    enabled: !!id,
  });

  const vehicle = data?.data?.vehicle;

  const handleProtectedAction = (targetPath: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(targetPath)}`);
    } else {
      router.push(targetPath);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper title="Loading Vehicle Specifications...">
        <div className="p-12 text-center text-gray-400 font-medium">Fetching product specifications from showroom inventory...</div>
      </PageWrapper>
    );
  }

  if (isError || !vehicle) {
    return (
      <PageWrapper title="Vehicle Not Found">
        <div className="p-8 text-center bg-gray-900 rounded-xl border border-gray-800 space-y-4">
          <p className="text-gray-400">The requested vehicle listing could not be found or has been unlisted.</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Marketplace Catalog
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const enquiryPath = `/customer/enquiries/new?targetShowroomId=${vehicle.showroom_id}&enquiryType=VEHICLE_PURCHASE&vehicleDetails=${encodeURIComponent(`${vehicle.title} (${vehicle.brand} ${vehicle.model})`)}`;
  const serviceBookingPath = `/customer/services/request?targetShowroomId=${vehicle.showroom_id}&vehicleType=${vehicle.type}&vehicleDetails=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}`;

  return (
    <PageWrapper
      title={`${vehicle.brand} ${vehicle.model} (${vehicle.year})`}
      description={`Authorized Dealership Listing — ${vehicle.showroom?.name || 'Showroom Network'}`}
      action={
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Catalog
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Showcase Card */}
          <Card glass className="overflow-hidden space-y-4">
            <div className="h-72 bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-6 border-b border-gray-800 relative">
              {vehicle.image_url ? (
                <img
                  src={vehicle.image_url}
                  alt={vehicle.title}
                  className="max-h-full object-contain drop-shadow-xl"
                />
              ) : (
                <div className="text-center text-gray-600 space-y-2">
                  {vehicle.type === 'BIKE' ? <Bike className="w-20 h-20 mx-auto" /> : <Car className="w-20 h-20 mx-auto" />}
                  <p className="text-xs uppercase font-mono tracking-widest text-gray-500">Official Product Image</p>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge variant={vehicle.type === 'BIKE' ? 'info' : 'neutral'}>
                  {vehicle.type}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant={vehicle.stock_quantity > 0 ? 'success' : 'error'}>
                  {vehicle.stock_quantity > 0 ? `${vehicle.stock_quantity} Units Available` : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{vehicle.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{vehicle.brand} • {vehicle.model} • {vehicle.color}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Ex-Showroom Price</p>
                  <p className="text-2xl font-black text-emerald-400">₹{vehicle.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {vehicle.description && (
                <div className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 text-xs text-gray-300 space-y-1">
                  <p className="font-semibold text-gray-200">Vehicle Description:</p>
                  <p className="leading-relaxed text-gray-400">{vehicle.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specifications & Showroom Contact */}
          <div className="space-y-6">
            {/* Technical Specs Grid */}
            <Card glass>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Brand</span>
                  <span className="font-bold text-gray-200 text-sm">{vehicle.brand}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Model</span>
                  <span className="font-bold text-gray-200 text-sm">{vehicle.model}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Manufacturing Year</span>
                  <span className="font-bold text-gray-200 text-sm">{vehicle.year}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Engine Capacity</span>
                  <span className="font-bold text-gray-200 text-sm">{vehicle.engine_cc} CC</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Color Variant</span>
                  <span className="font-bold text-gray-200 text-sm">{vehicle.color}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Vehicle Category</span>
                  <span className="font-bold text-gray-200 text-sm">{vehicle.type}</span>
                </div>
              </CardContent>
            </Card>

            {/* Dealership Info Box */}
            <Card glass>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" /> Authorized Dealership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                  <p className="font-bold text-white text-sm">{vehicle.showroom?.name || 'Showroom Dealership'}</p>
                  <p className="text-gray-400 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    {vehicle.showroom?.address || 'Showroom Address'}
                  </p>
                  <div className="flex items-center gap-4 text-gray-300 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" /> {vehicle.showroom?.contactPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-400" /> {vehicle.showroom?.contactEmail}
                    </span>
                  </div>
                </div>

                {/* Direct Protected Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button variant="primary" onClick={() => handleProtectedAction(enquiryPath)} className="w-full font-bold text-xs">
                    <MessageSquare className="w-4 h-4 mr-1.5" /> Send Purchase Enquiry
                  </Button>

                  <Button variant="outline" onClick={() => handleProtectedAction(serviceBookingPath)} className="w-full font-bold text-xs">
                    <Wrench className="w-4 h-4 mr-1.5" /> Book Service Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
