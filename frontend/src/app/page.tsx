'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Store,
  Bike,
  Car,
  Package,
  Wrench,
  Star,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Tag,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

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
    }>;
  };
}

interface FeedbacksResponse {
  success: boolean;
  data: {
    feedbacks: Array<{
      id: string;
      rating: number;
      comment?: string;
      admin_response?: string;
      user_name?: string;
      showroom_name?: string;
      created_at: string;
    }>;
  };
}

export default function Home() {
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'ALL' | 'BIKE' | 'CAR'>('ALL');
  const [activeTab, setActiveTab] = useState<'vehicles' | 'parts' | 'services' | 'reviews'>('vehicles');

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Fetch Vehicles
  const { data: vehicleData, isLoading: isVehiclesLoading } = useQuery<VehiclesResponse>({
    queryKey: ['public-vehicles-list', vehicleTypeFilter],
    queryFn: () =>
      apiClient<VehiclesResponse>(
        `/vehicles${vehicleTypeFilter !== 'ALL' ? `?type=${vehicleTypeFilter}` : ''}`
      ),
  });

  // Fetch Spare Parts
  const { data: partsData, isLoading: isPartsLoading } = useQuery<SparePartsResponse>({
    queryKey: ['public-spare-parts-list'],
    queryFn: () => apiClient<SparePartsResponse>('/spare-parts'),
  });

  // Fetch Reviews
  const { data: feedbackData, isLoading: isFeedbackLoading } = useQuery<FeedbacksResponse>({
    queryKey: ['public-feedbacks-list'],
    queryFn: () => apiClient<FeedbacksResponse>('/feedback'),
  });

  const vehicles = vehicleData?.data?.vehicles || [];
  const parts = partsData?.data?.spare_parts || [];
  const reviews = feedbackData?.data?.feedbacks || [];

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParts = parts.filter(
    (p) =>
      p.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.part_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper
      title="Multi-Showroom Marketplace"
      description="Explore authorized vehicles, genuine spare parts catalog, and book repair servicing across verified showrooms."
    >
      <div className="space-y-8">
        {/* Marketplace Hero Showcase Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-gray-900 via-blue-950/40 to-gray-900 border border-gray-800 p-8 sm:p-12 overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge variant="info">Authorized Showroom Marketplace</Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Discover Bikes, Cars & Genuine Spare Parts
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Browse ex-showroom prices, compare vehicle specifications, order genuine spare parts directly, or schedule repair services with certified technicians.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              {!isAuthenticated ? (
                <Button variant="primary" size="lg" onClick={() => router.push('/auth/login')}>
                  Customer Portal Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    if (user?.role === 'ADMIN') router.push('/admin/dashboard');
                    else if (user?.role === 'WORKER') router.push('/worker/dashboard');
                    else if (user?.role === 'INVENTORY_MANAGER') router.push('/inventory/dashboard');
                    else if (user?.role === 'SUPERADMIN') router.push('/platform/dashboard');
                    else router.push('/customer/dashboard');
                  }}
                >
                  My Workspace Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Link href="/customer/services">
                <Button variant="outline" size="lg">
                  <Wrench className="w-4 h-4 mr-2 text-blue-400" /> Browse Service Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Global Marketplace Search & Tab Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <Input
                placeholder="Search vehicles, brands, or part codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Marketplace Navigation Tabs */}
            <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 space-x-1 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'vehicles'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" /> Vehicle Catalog ({filteredVehicles.length})
              </button>
              <button
                onClick={() => setActiveTab('parts')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'parts'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Spare Parts ({filteredParts.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5" /> Verified Reviews ({reviews.length})
              </button>
            </div>
          </div>

          {/* Vehicle Type Filter Pills if in Vehicles tab */}
          {activeTab === 'vehicles' && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Type:
              </span>
              <button
                onClick={() => setVehicleTypeFilter('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  vehicleTypeFilter === 'ALL'
                    ? 'bg-gray-800 text-white border-blue-500'
                    : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                All Vehicles
              </button>
              <button
                onClick={() => setVehicleTypeFilter('BIKE')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  vehicleTypeFilter === 'BIKE'
                    ? 'bg-gray-800 text-blue-400 border-blue-500'
                    : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                Bikes Only
              </button>
              <button
                onClick={() => setVehicleTypeFilter('CAR')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  vehicleTypeFilter === 'CAR'
                    ? 'bg-gray-800 text-indigo-400 border-indigo-500'
                    : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                Cars Only
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Vehicle Products Grid */}
        {activeTab === 'vehicles' && (
          <div className="space-y-4">
            {isVehiclesLoading ? (
              <div className="p-12 text-center text-sm text-gray-400">Loading authorized showroom vehicle listings...</div>
            ) : filteredVehicles.length === 0 ? (
              <div className="p-12 text-center bg-gray-900 rounded-2xl border border-gray-800">
                <p className="text-sm text-gray-400">No vehicle listings match your search filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <Card key={vehicle.id} glass className="flex flex-col justify-between hover:border-blue-500/40 transition-all group overflow-hidden">
                    <div className="space-y-3">
                      {/* Image Thumbnail Container */}
                      <div className="h-48 bg-gray-900 border-b border-gray-800 flex items-center justify-center p-4 relative">
                        {vehicle.image_url ? (
                          <img
                            src={vehicle.image_url}
                            alt={vehicle.title}
                            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center text-gray-600">
                            {vehicle.type === 'BIKE' ? <Bike className="w-12 h-12 mx-auto" /> : <Car className="w-12 h-12 mx-auto" />}
                            <p className="text-[10px] uppercase font-mono tracking-wider text-gray-500 mt-1">Official Listing</p>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant={vehicle.type === 'BIKE' ? 'info' : 'neutral'}>
                            {vehicle.type}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge variant={vehicle.stock_quantity > 0 ? 'success' : 'error'}>
                            {vehicle.stock_quantity > 0 ? `${vehicle.stock_quantity} In Stock` : 'Sold Out'}
                          </Badge>
                        </div>
                      </div>

                      {/* Info Body */}
                      <CardContent className="space-y-2 pt-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                              {vehicle.title}
                            </h3>
                            <p className="text-xs text-gray-400">{vehicle.brand} • {vehicle.model} ({vehicle.year})</p>
                          </div>
                          <span className="text-xs font-mono text-gray-400 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                            {vehicle.engine_cc} CC
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/60">
                          <span className="text-xs text-gray-400">Color: {vehicle.color}</span>
                          <span className="text-lg font-black text-emerald-400">
                            ₹{vehicle.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </CardContent>
                    </div>

                    {/* View Product CTA */}
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
        )}

        {/* Tab 2: Spare Parts Grid */}
        {activeTab === 'parts' && (
          <div className="space-y-4">
            {isPartsLoading ? (
              <div className="p-12 text-center text-sm text-gray-400">Loading spare parts catalog...</div>
            ) : filteredParts.length === 0 ? (
              <div className="p-12 text-center bg-gray-900 rounded-2xl border border-gray-800">
                <p className="text-sm text-gray-400">No spare parts match your search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredParts.map((part) => (
                  <Card key={part.id} glass className="flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="info">{part.category}</Badge>
                        <Badge variant={part.stock_quantity > 0 ? 'success' : 'error'}>
                          {part.stock_quantity > 0 ? `${part.stock_quantity} Units` : 'Out of Stock'}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-sm">{part.part_name}</h4>
                        <p className="text-xs font-mono text-gray-500 mt-0.5">Code: {part.part_code}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                        <span className="text-gray-400">{part.vehicle_type} Compatible</span>
                        <span className="font-bold text-emerald-400 text-base">₹{part.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link href={`/spare-parts/${part.id}`}>
                        <Button variant="outline" className="w-full text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> View Part & Order
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Verified Customer Reviews Showcase */}
        {activeTab === 'reviews' && (
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Verified Customer Ratings & Reviews
              </CardTitle>
              <CardDescription>Public customer feedback post service completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isFeedbackLoading ? (
                <p className="text-sm text-gray-400">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No verified reviews available yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{item.user_name || 'Verified Customer'}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: item.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 italic">&quot;{item.comment}&quot;</p>
                      {item.admin_response && (
                        <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-blue-300 mt-2 space-y-0.5">
                          <p className="font-semibold text-[10px] uppercase text-blue-400">Showroom Response:</p>
                          <p>{item.admin_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
