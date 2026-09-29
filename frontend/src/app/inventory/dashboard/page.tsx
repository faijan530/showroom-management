'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Package, Store, Cpu, AlertCircle, ArrowRight, Bike, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

interface Vehicle {
  id: string;
  title: string;
  type: 'BIKE' | 'CAR';
  stock_quantity: number;
}

interface VehiclesResponse {
  success: boolean;
  data: { vehicles: Vehicle[] };
}

export default function InventoryDashboardPage() {
  const { user } = useAuthStore();
  const showroomId = user?.showroom_id;

  const { data, isLoading } = useQuery<VehiclesResponse>({
    queryKey: ['showroom-vehicles', showroomId],
    queryFn: () => apiClient<VehiclesResponse>(`/vehicles${showroomId ? `?showroom_id=${showroomId}` : ''}`),
  });

  const vehicles = data?.data?.vehicles || [];
  const totalVehicles = vehicles.length;
  const totalStockUnits = vehicles.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);
  const bikeCount = vehicles.filter((v) => v.type === 'BIKE').length;
  const carCount = vehicles.filter((v) => v.type === 'CAR').length;

  return (
    <PageWrapper
      title="Inventory Manager Panel"
      description="Manage showroom vehicle catalog (Bikes & Cars), spare parts inventory, and stock counts."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Showroom Vehicles"
            value={isLoading ? 'Loading...' : `${totalVehicles} Listed`}
            change={isLoading ? 'Fetching data...' : `${totalStockUnits} Stock Units (${bikeCount} Bikes, ${carCount} Cars)`}
            isPositive
            icon={Store}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Spare Parts Catalog"
            value="0 Items"
            change="Active Parts"
            isPositive
            icon={Package}
            iconColor="text-amber-400"
          />
          <StatCard
            title="Low Stock Alerts"
            value="0 Items"
            change="Reorder Needed"
            isPositive
            icon={AlertCircle}
            iconColor="text-rose-400"
          />
          <StatCard
            title="Role Scope"
            value="INVENTORY"
            change="Showroom Manager"
            isPositive
            icon={Cpu}
            iconColor="text-emerald-400"
          />
        </div>

        <Card glass>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span>Showroom Inventory & Catalog Management</span>
              </CardTitle>
              <CardDescription>Catalog CRUD & Stock Adjustments (Modules 004 & 005)</CardDescription>
            </div>
            <Link
              href="/inventory/vehicles"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all"
            >
              <span>Manage Vehicles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                <Package className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
                <p className="text-sm font-semibold text-gray-300">Loading catalog data...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                <Package className="w-8 h-8 text-gray-600 mx-auto" />
                <p className="text-sm font-semibold text-gray-300">No Vehicles Listed Yet</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click &quot;Manage Vehicles&quot; to add bikes and cars to your showroom inventory.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
                  <span>RECENTLY LISTED VEHICLES</span>
                  <span>{vehicles.length} VEHICLE(S)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vehicles.slice(0, 6).map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl border border-gray-800/80 bg-gray-900/40 hover:bg-gray-900/70 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-gray-800/60 text-gray-300">
                          {v.type === 'BIKE' ? <Bike className="w-4 h-4 text-blue-400" /> : <Car className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-200 line-clamp-1">{v.title}</p>
                          <p className="text-[11px] text-gray-400">
                            {v.type} • {v.stock_quantity} units in stock
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

