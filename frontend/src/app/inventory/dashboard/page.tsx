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

interface SparePart {
  id: string;
  part_name: string;
  part_code: string;
  stock_quantity: number;
  min_stock_alert: number;
  is_low_stock: boolean;
}

interface SparePartsResponse {
  success: boolean;
  data: { spare_parts: SparePart[] };
}

export default function InventoryDashboardPage() {
  const { user } = useAuthStore();
  const showroomId = user?.showroom_id;

  const { data: vehicleData, isLoading: isVehiclesLoading } = useQuery<VehiclesResponse>({
    queryKey: ['showroom-vehicles', showroomId],
    queryFn: () => apiClient<VehiclesResponse>(`/vehicles${showroomId ? `?showroom_id=${showroomId}` : ''}`),
  });

  const { data: sparePartData, isLoading: isPartsLoading } = useQuery<SparePartsResponse>({
    queryKey: ['showroom-spare-parts', showroomId],
    queryFn: () => apiClient<SparePartsResponse>(`/spare-parts${showroomId ? `?showroom_id=${showroomId}` : ''}`),
  });

  const vehicles = vehicleData?.data?.vehicles || [];
  const totalVehicles = vehicles.length;
  const totalStockUnits = vehicles.reduce((acc, v) => acc + (v.stock_quantity || 0), 0);
  const bikeCount = vehicles.filter((v) => v.type === 'BIKE').length;
  const carCount = vehicles.filter((v) => v.type === 'CAR').length;

  const spareParts = sparePartData?.data?.spare_parts || [];
  const totalParts = spareParts.length;
  const totalPartsUnits = spareParts.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  const lowStockParts = spareParts.filter((p) => p.is_low_stock);
  const lowStockCount = lowStockParts.length;

  const isLoading = isVehiclesLoading || isPartsLoading;

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
            value={isLoading ? 'Loading...' : `${totalParts} Items`}
            change={isLoading ? 'Fetching data...' : `${totalPartsUnits} Units Available`}
            isPositive
            icon={Package}
            iconColor="text-amber-400"
          />
          <StatCard
            title="Low Stock Alerts"
            value={isLoading ? 'Loading...' : `${lowStockCount} Items`}
            change={lowStockCount > 0 ? 'Reorder Threshold Triggered' : 'Stock Levels Healthy'}
            isPositive={lowStockCount === 0}
            icon={AlertCircle}
            iconColor={lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicles Card */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="w-5 h-5 text-blue-400" />
                  <span>Vehicle Inventory</span>
                </CardTitle>
                <CardDescription>Bikes & Cars Catalog</CardDescription>
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
              {isVehiclesLoading ? (
                <div className="p-6 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                  <Package className="w-6 h-6 text-gray-600 mx-auto animate-pulse" />
                  <p className="text-xs text-gray-400">Loading vehicles...</p>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                  <Store className="w-6 h-6 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">No Vehicles Listed</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicles.slice(0, 4).map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl border border-gray-800/80 bg-gray-900/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {v.type === 'BIKE' ? <Bike className="w-4 h-4 text-blue-400" /> : <Car className="w-4 h-4 text-indigo-400" />}
                        <span className="text-xs font-bold text-gray-200">{v.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">{v.stock_quantity} units</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spare Parts Card */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>Spare Parts & Stock</span>
                </CardTitle>
                <CardDescription>Replacement parts & threshold alerts</CardDescription>
              </div>
              <Link
                href="/inventory/spare-parts"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-all"
              >
                <span>Manage Parts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {isPartsLoading ? (
                <div className="p-6 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                  <Package className="w-6 h-6 text-gray-600 mx-auto animate-pulse" />
                  <p className="text-xs text-gray-400">Loading spare parts...</p>
                </div>
              ) : spareParts.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                  <Package className="w-6 h-6 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400">No Spare Parts Listed</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {spareParts.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-gray-800/80 bg-gray-900/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-200">{p.part_name}</p>
                        <p className="text-[10px] text-blue-400 font-mono">{p.part_code}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-200">{p.stock_quantity} units</span>
                        {p.is_low_stock && (
                          <p className="text-[10px] text-rose-400 font-bold">Low Stock Alert</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

