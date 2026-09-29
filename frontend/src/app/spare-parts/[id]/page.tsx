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
import { Package, Store, ArrowLeft, ShoppingBag, MessageSquare, ShieldCheck } from 'lucide-react';

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
      <PageWrapper title="Loading Spare Part Specifications...">
        <div className="p-12 text-center text-gray-400 font-medium">Fetching spare part specs from showroom inventory...</div>
      </PageWrapper>
    );
  }

  if (isError || !part) {
    return (
      <PageWrapper title="Spare Part Not Found">
        <div className="p-8 text-center bg-gray-900 rounded-xl border border-gray-800 space-y-4">
          <p className="text-gray-400">The requested spare part listing could not be found or is no longer listed.</p>
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Marketplace
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const orderPath = `/customer/spare-parts/request?partId=${part.id}&showroomId=${part.showroom_id}&partName=${encodeURIComponent(part.part_name)}`;
  const enquiryPath = `/customer/enquiries/new?targetShowroomId=${part.showroom_id}&enquiryType=SPARE_PART_PURCHASE&message=${encodeURIComponent(`Enquiry regarding availability of ${part.part_name} (${part.part_code})`)}`;

  return (
    <PageWrapper
      title={part.part_name}
      description={`Part Code: ${part.part_code} • Category: ${part.category}`}
      action={
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Catalog
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spare Part Showcase */}
          <Card glass className="overflow-hidden space-y-4">
            <div className="h-72 bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center p-6 border-b border-gray-800 relative">
              {part.image_url ? (
                <img
                  src={part.image_url}
                  alt={part.part_name}
                  className="max-h-full object-contain drop-shadow-xl"
                />
              ) : (
                <div className="text-center text-gray-600 space-y-2">
                  <Package className="w-20 h-20 mx-auto text-emerald-500/40" />
                  <p className="text-xs uppercase font-mono tracking-widest text-gray-500">Genuine Spare Part</p>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge variant="info">
                  {part.vehicle_type} Compatible
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant={part.stock_quantity > 0 ? 'success' : 'error'}>
                  {part.stock_quantity > 0 ? `${part.stock_quantity} In Stock` : 'Out of Stock'}
                </Badge>
              </div>
            </div>

            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{part.part_name}</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Code: {part.part_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-medium">Unit Price</p>
                  <p className="text-2xl font-black text-emerald-400">₹{part.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {part.description && (
                <div className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800 text-xs text-gray-300 space-y-1">
                  <p className="font-semibold text-gray-200">Part Description & Compatibility Notes:</p>
                  <p className="leading-relaxed text-gray-400">{part.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specifications & Actions */}
          <div className="space-y-6">
            <Card glass>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Part Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Part Name</span>
                  <span className="font-bold text-gray-200 text-sm">{part.part_name}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Part Code / OEM #</span>
                  <span className="font-bold text-gray-200 font-mono text-sm">{part.part_code}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Category</span>
                  <span className="font-bold text-gray-200 text-sm">{part.category}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-gray-500 block">Vehicle Compatibility</span>
                  <span className="font-bold text-gray-200 text-sm">{part.vehicle_type}</span>
                </div>
              </CardContent>
            </Card>

            <Card glass>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-400" /> Available at Dealership
                </CardTitle>
                <CardDescription>Stock Location: {part.showroom?.name || 'Showroom Network'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                  <p className="font-bold text-white text-sm">{part.showroom?.name || 'Authorized Showroom'}</p>
                  <p className="text-gray-400">Inventory code: {part.showroom?.code}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="primary" onClick={() => handleProtectedAction(orderPath)} className="w-full font-bold text-xs">
                    <ShoppingBag className="w-4 h-4 mr-1.5" /> Order Spare Part
                  </Button>

                  <Button variant="outline" onClick={() => handleProtectedAction(enquiryPath)} className="w-full font-bold text-xs">
                    <MessageSquare className="w-4 h-4 mr-1.5" /> Ask Stock Availability
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
