'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Package, Store, Cpu, AlertCircle } from 'lucide-react';

export default function InventoryDashboardPage() {
  return (
    <PageWrapper
      title="Inventory Manager Panel"
      description="Manage showroom vehicle catalog (Bikes & Cars), spare parts inventory, and stock counts."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Showroom Vehicles"
            value="0 Listed"
            change="Bikes & Cars"
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Showroom Inventory & Catalog Management</span>
            </CardTitle>
            <CardDescription>Catalog CRUD & Stock Adjustments (Modules 004 & 005)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
              <Package className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">Catalog Module Initializing</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Full CRUD for vehicle listings (Bikes & Cars) and spare parts stock management will be enabled in Module 004 & 005.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
