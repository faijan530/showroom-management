'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Bike, Car, Search, Eye, SlidersHorizontal, ArrowLeft } from 'lucide-react';

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
    }>;
  };
}

export default function VehiclesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BIKE' | 'CAR'>('ALL');

  const { data, isLoading } = useQuery<VehiclesResponse>({
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
    <PageWrapper
      title="Vehicles Catalog (Bikes & Cars)"
      description="Browse authorized dealership listings, specs, ex-showroom pricing, and stock status."
    >
      <div className="space-y-6">
        {/* Search & Filter Controls */}
        <Card glass>
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <Input
                placeholder="Search by brand, model, or vehicle title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Category:
              </span>
              <button
                onClick={() => setTypeFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  typeFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400'
                }`}
              >
                All Vehicles
              </button>
              <button
                onClick={() => setTypeFilter('BIKE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  typeFilter === 'BIKE' ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400'
                }`}
              >
                Bikes
              </button>
              <button
                onClick={() => setTypeFilter('CAR')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  typeFilter === 'CAR' ? 'bg-blue-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400'
                }`}
              >
                Cars
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading vehicle listings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-gray-900 rounded-2xl border border-gray-800 text-gray-400">
            No vehicle listings match your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vehicle) => (
              <Card key={vehicle.id} glass className="flex flex-col justify-between hover:border-blue-500/40 transition-all overflow-hidden group">
                <div>
                  <div className="h-48 bg-gray-900 border-b border-gray-800 flex items-center justify-center p-4 relative">
                    {vehicle.image_url ? (
                      <img src={vehicle.image_url} alt={vehicle.title} className="max-h-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="text-center text-gray-600">
                        {vehicle.type === 'BIKE' ? <Bike className="w-12 h-12 mx-auto" /> : <Car className="w-12 h-12 mx-auto" />}
                        <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500 mt-1">Authorized Listing</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={vehicle.type === 'BIKE' ? 'info' : 'neutral'}>{vehicle.type}</Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={vehicle.stock_quantity > 0 ? 'success' : 'error'}>
                        {vehicle.stock_quantity > 0 ? `${vehicle.stock_quantity} In Stock` : 'Sold Out'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="space-y-2 pt-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base">{vehicle.title}</h3>
                        <p className="text-xs text-gray-400">{vehicle.brand} • {vehicle.model} ({vehicle.year})</p>
                      </div>
                      <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                        {vehicle.engine_cc} CC
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/60">
                      <span className="text-xs text-gray-400">Color: {vehicle.color}</span>
                      <span className="text-lg font-black text-emerald-400">₹{vehicle.price.toLocaleString('en-IN')}</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <Button variant="outline" className="w-full text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> View Product Specifications
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
