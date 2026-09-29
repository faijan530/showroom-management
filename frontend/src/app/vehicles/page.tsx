'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { VehicleCard } from '@/components/public/vehicle-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, PackageX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VehiclesResponse {
  success: boolean;
  data: {
    vehicles: Array<{
      id: string;
      showroom_id: string;
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
      showroom?: {
        name: string;
      };
    }>;
  };
}

export default function VehiclesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BIKE' | 'CAR'>('ALL');

  const { data, isLoading, isError, refetch } = useQuery<VehiclesResponse>({
    queryKey: ['public-vehicles-catalog', typeFilter],
    queryFn: () => apiClient<VehiclesResponse>(`/vehicles${typeFilter !== 'ALL' ? `?type=${typeFilter}` : ''}`),
  });

  const vehicles = data?.data?.vehicles || [];

  const filtered = vehicles.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PublicPageContainer>
      {/* Header Banner */}
      <PublicPageHeader
        eyebrow="VEHICLE MARKETPLACE"
        title="Explore Authorized Vehicles"
        description="Discover bikes and cars from verified showrooms across the network with full specs and ex-showroom pricing."
        stats={[
          { label: 'Listings Available', value: `${vehicles.length}+` },
          { label: 'Authorized Network', value: 'Verified Dealerships' },
          { label: 'Pricing', value: 'Transparent Ex-Showroom' },
        ]}
      />

      {/* Search & Category Filter Bar */}
      <Card glass className="border-gray-800/80 bg-gray-900/60 backdrop-blur-xl">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
            <Input
              placeholder="Search by brand, model, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-950/80 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" /> Filter:
            </span>
            {(['ALL', 'BIKE', 'CAR'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setTypeFilter(category)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  typeFilter === category
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-500'
                    : 'bg-gray-950/80 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                {category === 'ALL' ? 'All Vehicles' : category === 'BIKE' ? 'Bikes' : 'Cars'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid / Skeleton / Error / Empty States */}
      {isLoading ? (
        <LoadingSpinner
          variant="card"
          size="md"
          title="Loading Vehicle Listings..."
          message="Fetching bikes and cars from authorized showroom inventories..."
        />
      ) : isError ? (
        <Card glass className="p-12 text-center space-y-4 border-rose-500/20 bg-rose-950/10">
          <PackageX className="w-12 h-12 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Unable to Load Vehicles</h3>
            <p className="text-xs text-gray-400">There was an issue connecting to the marketplace API server.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-rose-500/30 text-rose-300 hover:bg-rose-950">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Connection
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card glass className="p-12 text-center space-y-4 border-gray-800 bg-gray-900/40">
          <PackageX className="w-12 h-12 text-gray-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Vehicles Found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search keywords or switching vehicle category filters.</p>
          </div>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} variant="outline" className="text-xs border-gray-800">
              Clear Search Query
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              id={vehicle.id}
              title={vehicle.title}
              type={vehicle.type}
              brand={vehicle.brand}
              model={vehicle.model}
              year={vehicle.year}
              price={vehicle.price}
              color={vehicle.color}
              engine_cc={vehicle.engine_cc}
              stock_quantity={vehicle.stock_quantity}
              showroom_name={vehicle.showroom?.name}
              image_url={vehicle.image_url}
            />
          ))}
        </div>
      )}
    </PublicPageContainer>
  );
}

