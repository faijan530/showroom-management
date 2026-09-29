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
import { Store, ArrowLeft, ShoppingBag, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

interface SparePartDetailResponse {
  success: boolean;
  data: {
    spare_part: {
      id: string;
      showroom_id: string;
      showroom?: {
        id: string;
        name: string;
        code: string;
      };
      part_name: string;
      part_code: string;
      category: string;
      vehicle_type: 'BIKE' | 'CAR' | 'BOTH';
      price: number;
      stock_quantity: number;
      min_stock_alert: number;
      is_low_stock: boolean;
      description?: string;
      image_url?: string;
      created_at: string;
    };
  };
}

export default function SparePartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const id = params?.id as string;

  const { data, isLoading, isError } = useQuery<SparePartDetailResponse>({
    queryKey: ['public-part-detail', id],
    queryFn: () => apiClient<SparePartDetailResponse>(`/spare-parts/${id}`),
    enabled: !!id,
  });

  const part = data?.data?.spare_part;

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
          Loading spare part specifications...
        </div>
      </PublicPageContainer>
    );
  }

  if (isError || !part) {
    return (
      <PublicPageContainer>
        <Card glass className="p-12 text-center border-gray-800 bg-gray-900/40 space-y-4">
          <p className="text-gray-400 text-sm">The requested spare part listing could not be found or is no longer listed.</p>
          <Button variant="outline" onClick={() => router.push('/spare-parts')} className="border-gray-800 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Spare Parts Catalog
          </Button>
        </Card>
      </PublicPageContainer>
    );
  }

  const lowerCat = part.category.toLowerCase();
  const imageSrc =
    part.image_url && part.image_url.trim().length > 0
      ? part.image_url
      : lowerCat.includes('brake')
      ? '/category_brakes.jpg'
      : '/category_engine.jpg';

  const orderPath = `/customer/spare-parts/request?partId=${part.id}&showroomId=${part.showroom_id}&partName=${encodeURIComponent(part.part_name)}`;
  const enquiryPath = `/customer/enquiries/new?targetShowroomId=${part.showroom_id}&enquiryType=SPARE_PART_PURCHASE&message=${encodeURIComponent(`Enquiry regarding availability of ${part.part_name} (${part.part_code})`)}`;

  return (
    <PublicPageContainer>
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="border-gray-800 text-xs bg-gray-900/80">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Spare Parts
        </Button>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Part ID: <code className="text-gray-300 font-mono">{part.id.slice(0, 8)}</code></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spare Part Showcase */}
        <Card glass className="overflow-hidden border-gray-800/80 bg-gray-900/40 space-y-4 shadow-2xl">
          <div className="h-80 sm:h-96 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0b101c] flex items-center justify-center p-4 relative overflow-hidden border-b border-gray-800/80">
            <img
              src={imageSrc}
              alt={part.part_name}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60 pointer-events-none" />

            <div className="absolute top-4 left-4">
              <Badge variant="info" className="shadow-lg backdrop-blur-md">
                {part.vehicle_type} Compatible
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <Badge variant={part.stock_quantity > 0 ? 'success' : 'error'} className="shadow-lg backdrop-blur-md">
                {part.stock_quantity > 0 ? `${part.stock_quantity} Units Available` : 'Out of Stock'}
              </Badge>
            </div>
          </div>

          <CardContent className="space-y-4 p-6 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">{part.part_name}</h1>
                <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2">
                  <span>OEM Code:</span>
                  <code className="text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {part.part_code}
                  </code>
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Unit Price</p>
                <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  ₹{part.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {part.description && (
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs space-y-1.5">
                <p className="font-bold text-gray-200 uppercase tracking-wider text-[11px] text-blue-400">Description & Compatibility Notes</p>
                <p className="leading-relaxed text-gray-300">{part.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specifications & Dealership Actions */}
        <div className="space-y-6">
          <Card glass className="border-gray-800/80 bg-gray-900/60">
            <CardHeader className="border-b border-gray-800/60 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Technical Component Specs
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3.5 text-xs pt-4">
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Part Name</span>
                <span className="font-extrabold text-white text-sm">{part.part_name}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">OEM Part Code</span>
                <span className="font-extrabold text-blue-300 font-mono text-sm">{part.part_code}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Category</span>
                <span className="font-extrabold text-white text-sm">{part.category}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-1">
                <span className="text-gray-400 text-[11px] block font-medium">Vehicle Compatibility</span>
                <span className="font-extrabold text-white text-sm">{part.vehicle_type}</span>
              </div>
            </CardContent>
          </Card>

          <Card glass className="border-gray-800/80 bg-gray-900/60 space-y-4">
            <CardHeader className="border-b border-gray-800/60 pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Store className="w-4 h-4 text-blue-400" /> Authorized Showroom Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-1.5">
                <p className="font-bold text-white text-sm">{part.showroom?.name || 'Authorized Dealership'}</p>
                <p className="text-gray-400 text-xs font-mono">Dealer Code: {part.showroom?.code || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleProtectedAction(orderPath)}
                  className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" /> Order Spare Part
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleProtectedAction(enquiryPath)}
                  className="w-full font-bold text-xs bg-gray-950 border-gray-800 hover:bg-gray-800 text-gray-200"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" /> Ask Stock Availability
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicPageContainer>
  );
}

