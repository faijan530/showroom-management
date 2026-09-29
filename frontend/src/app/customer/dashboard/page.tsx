'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Wrench, Package, Bike, MessageSquare, Star, Plus, ArrowRight, ShieldCheck } from 'lucide-react';

interface CustomerDashboardResponse {
  success: boolean;
  data: {
    serviceRequestsCount: number;
    partRequestsCount: number;
    vehiclesCount: number;
    enquiriesCount: number;
    recentServiceRequests: Array<{
      id: string;
      service_description: string;
      status: string;
      created_at: string;
    }>;
    recentPartRequests: Array<{
      id: string;
      part_name: string;
      status: string;
      created_at: string;
    }>;
  };
}

export default function CustomerDashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery<CustomerDashboardResponse>({
    queryKey: ['customer-dashboard-summary'],
    queryFn: () => apiClient<CustomerDashboardResponse>('/customer/dashboard-summary'),
    enabled: !!user,
  });

  const dashboardData = data?.data;

  return (
    <PageWrapper
      title={`Welcome back, ${user?.full_name || 'Customer'}!`}
      description="Track your service job status, spare part orders, registered vehicles, and showroom enquiries."
      action={
        <Link href="/customer/services/request">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Book Service Request
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Service Requests"
            value={isLoading ? '...' : dashboardData?.serviceRequestsCount ?? 0}
            change="Active & Past Jobs"
            isPositive
            icon={Wrench}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Spare Part Orders"
            value={isLoading ? '...' : dashboardData?.partRequestsCount ?? 0}
            change="Order Timeline"
            isPositive
            icon={Package}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Registered Vehicles"
            value={isLoading ? '...' : dashboardData?.vehiclesCount ?? 0}
            change="In Your Garage"
            isPositive
            icon={Bike}
            iconColor="text-indigo-400"
          />
          <StatCard
            title="Showroom Enquiries"
            value={isLoading ? '...' : dashboardData?.enquiriesCount ?? 0}
            change="Messages Sent"
            isPositive
            icon={MessageSquare}
            iconColor="text-amber-400"
          />
        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/customer/services/request">
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Book Service Job</p>
                <p className="text-xs text-gray-400 mt-0.5">Schedule a bike or car service with authorized technician</p>
              </div>
            </div>
          </Link>

          <Link href="/customer/spare-parts/request">
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Request Spare Part</p>
                <p className="text-xs text-gray-400 mt-0.5">Order genuine parts directly from showroom inventory</p>
              </div>
            </div>
          </Link>

          <Link href="/customer/enquiries/new">
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Ask Availability</p>
                <p className="text-xs text-gray-400 mt-0.5">Send direct inquiry to showroom managers</p>
              </div>
            </div>
          </Link>

          <Link href="/customer/vehicles">
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Bike className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">My Garage</p>
                <p className="text-xs text-gray-400 mt-0.5">Manage registered vehicles and service history</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Service Requests Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-400" /> Recent Service Requests
                </CardTitle>
                <CardDescription>Status tracker for your recent bookings</CardDescription>
              </div>
              <Link href="/customer/services/requests">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-xs text-gray-400">Loading service requests...</p>
              ) : !dashboardData?.recentServiceRequests || dashboardData.recentServiceRequests.length === 0 ? (
                <p className="text-xs text-gray-500">No service requests submitted yet.</p>
              ) : (
                dashboardData.recentServiceRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{req.service_description}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {new Date(req.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <Badge variant={req.status === 'COMPLETED' ? 'success' : req.status === 'IN_PROGRESS' ? 'warning' : 'neutral'}>
                      {req.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" /> Recent Spare Part Orders
                </CardTitle>
                <CardDescription>Track spare part order updates</CardDescription>
              </div>
              <Link href="/customer/spare-parts/requests">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="text-xs text-gray-400">Loading part orders...</p>
              ) : !dashboardData?.recentPartRequests || dashboardData.recentPartRequests.length === 0 ? (
                <p className="text-xs text-gray-500">No spare part orders placed yet.</p>
              ) : (
                dashboardData.recentPartRequests.map((part) => (
                  <div key={part.id} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">{part.part_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {new Date(part.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <Badge variant={part.status === 'COMPLETED' || part.status === 'READY' ? 'success' : 'neutral'}>
                      {part.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
