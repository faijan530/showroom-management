'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Users, Wrench, Package, UserPlus, Store } from 'lucide-react';

interface AdminDashboardResponse {
  success: boolean;
  data: {
    summary: {
      showroom_id: string;
      showroom_name: string;
      total_staff: number;
      workers_count: number;
      inventory_managers_count: number;
    };
  };
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'ADMIN') {
      if (user.role === 'INVENTORY_MANAGER') {
        router.replace('/inventory/dashboard');
      } else if (user.role === 'WORKER') {
        router.replace('/worker/dashboard');
      } else if (user.role === 'SUPERADMIN') {
        router.replace('/platform/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useQuery<AdminDashboardResponse>({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () => apiClient<AdminDashboardResponse>('/admin/dashboard'),
    enabled: !!user && user.role === 'ADMIN',
    retry: 1,
  });

  const summary = data?.data?.summary;

  if (user && user.role !== 'ADMIN') {
    return null;
  }

  return (
    <PageWrapper
      title={`Showroom Dashboard — ${summary?.showroom_name || 'Loading...'}`}
      description="Operational management, staff provisioning, and inventory oversight for your showroom."
      action={
        <Link href="/admin/staff">
          <Button variant="primary">
            <UserPlus className="w-4 h-4 mr-1.5" /> Provision Staff Member
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Showroom"
            value={isLoading ? '...' : summary?.showroom_name || 'Assigned'}
            change="Isolated Scope"
            isPositive
            icon={Store}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Total Showroom Staff"
            value={isLoading ? '...' : summary?.total_staff ?? 0}
            change="Operational Team"
            isPositive
            icon={Users}
            iconColor="text-indigo-400"
          />
          <StatCard
            title="Technicians / Workers"
            value={isLoading ? '...' : summary?.workers_count ?? 0}
            change="Service Assignments"
            isPositive
            icon={Wrench}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Inventory Managers"
            value={isLoading ? '...' : summary?.inventory_managers_count ?? 0}
            change="Stock & Catalog"
            isPositive
            icon={Package}
            iconColor="text-amber-400"
          />
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle>Showroom Operations & Management</CardTitle>
            <CardDescription>Direct shortcuts to showroom administrative workflows</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/staff">
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group">
                <div className="flex items-center gap-3 text-blue-400 font-bold">
                  <UserPlus className="w-5 h-5" />
                  <span>Showroom Staff Directory & Provisioning</span>
                </div>
                <p className="text-xs text-gray-400">
                  Provision new Technician (Worker) and Inventory Manager credentials linked strictly to your showroom ID.
                </p>
              </div>
            </Link>

            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-2 opacity-80">
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <Store className="w-5 h-5" />
                <span>Multi-Tenant Data Security</span>
              </div>
              <p className="text-xs text-gray-400">
                All inquiries, service requests, inventory, and staff members are strictly isolated to your assigned showroom context.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
