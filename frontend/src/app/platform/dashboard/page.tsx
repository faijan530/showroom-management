'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Store, Users, ShieldAlert, Plus, ShieldCheck, ArrowRight } from 'lucide-react';

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

export default function PlatformDashboardPage() {
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
      title="Platform Administration Dashboard"
      description="Global marketplace monitoring, showroom onboarding, and platform security governance."
      action={
        <Link href="/platform/showrooms">
          <Button variant="primary" className="bg-rose-600 hover:bg-rose-500 text-white font-bold">
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
            change={suspendedCount > 0 ? 'Requires Action' : 'Zero Suspended'}
            isPositive={suspendedCount === 0}
            icon={ShieldAlert}
            iconColor="text-rose-400"
          />
          <StatCard
            title="Total Showroom Users"
            value={isLoading ? '...' : totalUsers}
            change="Across All Tenancies"
            isPositive
            icon={Users}
            iconColor="text-indigo-400"
          />
        </div>

        <Card glass className="border-rose-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Platform Administration Workflows</span>
            </CardTitle>
            <CardDescription>Direct shortcuts to platform governance and showroom lifecycle actions</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/platform/showrooms">
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-rose-500/50 transition-all cursor-pointer space-y-2 group">
                <div className="flex items-center justify-between text-rose-400 font-bold">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5" />
                    <span>Showroom Onboarding & Credentials</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-gray-400">
                  Register new showroom entities and provision dedicated Showroom Admin credentials bound to specific showrooms.
                </p>
              </div>
            </Link>

            <Link href="/platform/users">
              <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-rose-500/50 transition-all cursor-pointer space-y-2 group">
                <div className="flex items-center justify-between text-indigo-400 font-bold">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>Platform & Showroom Users</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-gray-400">
                  Monitor platform administrators and inspect showroom staff directory and roles across the platform.
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
