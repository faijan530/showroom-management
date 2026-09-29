'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Phone, Mail, MapPin, ArrowLeft, Wrench, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

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
      <PublicPageContainer>
        <div className="h-96 rounded-3xl bg-gray-900/50 border border-gray-800 animate-pulse p-8 flex items-center justify-center text-gray-400">
          Loading vehicle specifications...
        </div>
      </PublicPageContainer>
    );
  }

  if (isError || !vehicle) {
    return (
      <PublicPageContainer>
        <Card glass className="p-12 text-center border-gray-800 bg-gray-900/40 space-y-4">
          <p className="text-gray-400 text-sm">The requested vehicle listing could not be found or has been unlisted.</p>
          <Button variant="outline" onClick={() => router.push('/vehicles')} className="border-gray-800 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Vehicles Catalog
          </Button>
        </Card>
      </PublicPageContainer>
    );
  }

  const imageSrc =
    vehicle.image_url && vehicle.image_url.trim().length > 0
      ? vehicle.image_url
      : vehicle.type === 'BIKE'
      ? '/category_bikes.jpg'
      : '/category_cars.jpg';

  const enquiryPath = `/customer/enquiries/new?targetShowroomId=${vehicle.showroom_id}&enquiryType=VEHICLE_PURCHASE&vehicleDetails=${encodeURIComponent(`${vehicle.title} (${vehicle.brand} ${vehicle.model})`)}`;
  const serviceBookingPath = `/customer/services/request?targetShowroomId=${vehicle.showroom_id}&vehicleType=${vehicle.type}&vehicleDetails=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}`;

  return (
    <PublicPageContainer>
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="border-gray-800 text-xs bg-gray-900/80">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Vehicles
        </Button>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Listing ID: <code className="text-gray-300 font-mono">{vehicle.id.slice(0, 8)}</code></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Image Showcase */}
        <Card glass className="overflow-hidden border-gray-800/80 bg-gray-900/40 space-y-4 shadow-2xl">
          <div className="h-80 sm:h-96 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0b101c] flex items-center justify-center p-4 relative overflow-hidden border-b border-gray-800/80">
            <img
              src={imageSrc}
              alt={vehicle.title}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60 pointer-events-none" />

            <div className="absolute top-4 left-4">
              <Badge variant={vehicle.type === 'BIKE' ? 'info' : 'neutral'} className="shadow-lg backdrop-blur-md">
                {vehicle.type}
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge variant={vehicle.stock_quantity > 0 ? 'success' : 'error'} className="shadow-lg backdrop-blur-md">
                {vehicle.stock_quantity > 0 ? `${vehicle.stock_quantity} Units Available` : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          <CardContent className="space-y-4 p-6 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">{vehicle.title}</h1>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  {vehicle.brand} • {vehicle.model} • Manufacturing Year: {vehicle.year}
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ex-Showroom Price</p>
                <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  ₹{vehicle.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {vehicle.description && (
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs space-y-1.5">
                <p className="font-bold text-gray-200 uppercase tracking-wider text-[11px] text-blue-400">Description & Highlights</p>
                <p className="leading-relaxed text-gray-300">{vehicle.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specifications & Showroom Card */}
        <div className="space-y-6">
          <Card glass className="border-gray-800/80 bg-gray-900/60">
            <CardHeader className="border-b border-gray-800/60 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Technical Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3.5 text-xs pt-4">
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Manufacturer / Brand</span>
                <span className="font-extrabold text-white text-sm">{vehicle.brand}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Model Variant</span>
                <span className="font-extrabold text-white text-sm">{vehicle.model}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Manufacturing Year</span>
                <span className="font-extrabold text-white text-sm">{vehicle.year}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Engine Displacement</span>
                <span className="font-extrabold text-blue-400 font-mono text-sm">{vehicle.engine_cc} CC</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Color Finish</span>
                <span className="font-extrabold text-white text-sm capitalize">{vehicle.color}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Body Type</span>
                <span className="font-extrabold text-white text-sm">{vehicle.type}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dealership Details & Action CTAs */}
          <Card glass className="border-gray-800/80 bg-gray-900/60 space-y-4">
            <CardHeader className="border-b border-gray-800/60 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Store className="w-4 h-4 text-emerald-400" /> Authorized Dealership Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-2">
                <p className="font-bold text-white text-sm">{vehicle.showroom?.name || 'Authorized Showroom'}</p>
                <p className="text-gray-400 flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  {vehicle.showroom?.address || 'Verified Dealership Address'}
                </p>
                <div className="flex items-center gap-4 text-gray-300 pt-2 border-t border-gray-800/60 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {vehicle.showroom?.contactPhone || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> {vehicle.showroom?.contactEmail || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleProtectedAction(enquiryPath)}
                  className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" /> Ask Availability / Price
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleProtectedAction(serviceBookingPath)}
                  className="w-full font-bold text-xs bg-gray-950 border-gray-800 hover:bg-gray-800 text-gray-200"
                >
                  <Wrench className="w-4 h-4 mr-1.5" /> Book Service Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicPageContainer>
  );
}

