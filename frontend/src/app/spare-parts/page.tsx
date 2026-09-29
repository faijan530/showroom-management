'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { SparePartCard } from '@/components/public/spare-part-card';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, PackageX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SparePartsResponse {
  success: boolean;
  data: {
    spare_parts: Array<{
      id: string;
      showroom_id: string;
      part_name: string;
      part_code: string;
      category: string;
      vehicle_type: 'BIKE' | 'CAR' | 'BOTH';
      price: number;
      stock_quantity: number;
      min_stock_alert: number;
      description?: string;
      image_url?: string;
      showroom?: {
        name: string;
      };
    }>;
  };
}

export default function SparePartsCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'ALL' | 'BIKE' | 'CAR'>('ALL');

  const { data, isLoading, isError, refetch } = useQuery<SparePartsResponse>({
    queryKey: ['public-spare-parts-catalog'],
    queryFn: () => apiClient<SparePartsResponse>('/spare-parts'),
  });

  const parts = data?.data?.spare_parts || [];

  const filtered = parts.filter((p) => {
    const matchesSearch =
      p.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.part_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      vehicleTypeFilter === 'ALL' ||
      p.vehicle_type === vehicleTypeFilter ||
      p.vehicle_type === 'BOTH';

    return matchesSearch && matchesType;
  });

  return (
    <PublicPageContainer>
      {/* Header Banner */}
      <PublicPageHeader
        eyebrow="GENUINE PARTS MARKETPLACE"
        title="Original Manufacturer Spare Parts"
        description="Search genuine replacement parts, OEM components, and accessories across authorized showroom inventories."
        stats={[
          { label: 'OEM Parts Catalog', value: `${parts.length}+` },
          { label: 'Guaranteed Fit', value: '100% Genuine' },
          { label: 'Availability', value: 'Live Inventory' },
        ]}
      />

      {/* Search & Filter Panel */}
      <Card glass className="border-gray-800/80 bg-gray-900/60 backdrop-blur-xl">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
            <Input
              placeholder="Search part name, OEM code or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-950/80 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" /> Compatibility:
            </span>
            {(['ALL', 'BIKE', 'CAR'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setVehicleTypeFilter(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  vehicleTypeFilter === type
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                    : 'bg-gray-950/80 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                {type === 'ALL' ? 'All Types' : type === 'BIKE' ? 'Bike Parts' : 'Car Parts'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid / Skeletons / Error / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-80 rounded-2xl bg-gray-900/50 border border-gray-800/60 animate-pulse p-4 space-y-4">
              <div className="h-40 bg-gray-800/60 rounded-xl" />
              <div className="h-4 bg-gray-800/80 rounded w-3/4" />
              <div className="h-4 bg-gray-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card glass className="p-12 text-center space-y-4 border-rose-500/20 bg-rose-950/10">
          <PackageX className="w-12 h-12 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Unable to Load Spare Parts</h3>
            <p className="text-xs text-gray-400">There was an error fetching catalog data from showroom inventories.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-rose-500/30 text-rose-300 hover:bg-rose-950">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Connection
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card glass className="p-12 text-center space-y-4 border-gray-800 bg-gray-900/40">
          <PackageX className="w-12 h-12 text-gray-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Spare Parts Found</h3>
            <p className="text-xs text-gray-400">No parts matched your current query or compatibility selection.</p>
          </div>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} variant="outline" className="text-xs border-gray-800">
              Clear Search Filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((part) => (
            <SparePartCard
              key={part.id}
              id={part.id}
              part_name={part.part_name}
              part_code={part.part_code}
              category={part.category}
              vehicle_type={part.vehicle_type}
              price={part.price}
              stock_quantity={part.stock_quantity}
              showroom_name={part.showroom?.name}
              image_url={part.image_url}
            />
          ))}
        </div>
      )}
    </PublicPageContainer>
  );
}

