'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Store, Users, ShieldAlert, Plus, ShieldCheck } from 'lucide-react';

interface ShowroomsResponse {
  success: boolean;
  data: {
    showrooms: Array<{
      id: string;
      name: string;
      code: string;
      status: string;
      user_count: number;
    }>;
  };
}

export default function SuperadminDashboardPage() {
  const { data, isLoading } = useQuery<ShowroomsResponse>({
    queryKey: ['superadmin-showrooms-summary'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
    retry: 1,
  });

  const showrooms = data?.data?.showrooms || [];
  const activeCount = showrooms.filter((s) => s.status === 'ACTIVE').length;
  const suspendedCount = showrooms.filter((s) => s.status === 'SUSPENDED').length;
  const totalUsers = showrooms.reduce((acc, curr) => acc + curr.user_count, 0);

  return (
    <PageWrapper
      title="Superadmin Control Center"
      description="Global marketplace monitoring, showroom onboarding, and platform governance."
      action={
        <Link href="/superadmin/showrooms">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" /> Manage Showrooms
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Showrooms"
            value={isLoading ? '...' : showrooms.length}
            change={`${activeCount} Active`}
            isPositive
            icon={Store}
          />
          <StatCard
            title="Active Showrooms"
            value={isLoading ? '...' : activeCount}
            change="Operational"
            isPositive
            icon={ShieldCheck}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Suspended Showrooms"
            value={isLoading ? '...' : suspendedCount}
            change={suspendedCount > 0 ? 'Requires Review' : 'Zero Suspended'}
            isPositive={suspendedCount === 0}
            icon={ShieldAlert}
            iconColor="text-rose-400"
          />
          <StatCard
            title="Platform Staff & Users"
            value={isLoading ? '...' : totalUsers}
            change="Across Showrooms"
            isPositive
            icon={Users}
            iconColor="text-indigo-400"
          />
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle>Superadmin Governance Actions</CardTitle>
            <CardDescription>Direct shortcuts to platform administrative workflows</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/superadmin/showrooms">
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2">
                <div className="flex items-center gap-3 text-blue-400 font-bold">
                  <Store className="w-5 h-5" />
                  <span>Showroom Onboarding & Credentials</span>
                </div>
                <p className="text-xs text-gray-400">
                  Register new showroom entities and provision dedicated Showroom Admin credentials tied to specific showrooms.
                </p>
              </div>
            </Link>

            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-2 opacity-80">
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <ShieldCheck className="w-5 h-5" />
                <span>Multi-Tenant Data Security</span>
              </div>
              <p className="text-xs text-gray-400">
                All showroom administrators and staff are strictly isolated to their assigned `showroom_id` (Anti-IDOR enforced).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
