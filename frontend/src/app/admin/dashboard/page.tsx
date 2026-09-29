'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  Users,
  Wrench,
  Package,
  UserPlus,
  Store,
  DollarSign,
  AlertTriangle,
  Star,
  Clock,
  Activity,
  FileText,
  TrendingUp,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

interface DashboardSummaryResponse {
  success: boolean;
  data: {
    period: string;
    kpis: {
      totalRequests: number;
      pendingRequests: number;
      completedToday: number;
      revenue: number;
      newCustomers: number;
      activeWorkers: number;
      lowStockAlerts: number;
      averageRating: number;
      overdueServices: number;
    };
    charts: {
      requestsByDay: Array<{ date: string; count: number }>;
      revenueByDay: Array<{ date: string; amount: number }>;
    };
  };
}

interface AlertsResponse {
  success: boolean;
  data: {
    totalAlerts: number;
    alerts: Array<{
      id: string;
      category: string;
      severity: 'HIGH' | 'MEDIUM' | 'INFO';
      title: string;
      message: string;
      href: string;
    }>;
  };
}

interface RecentActivityResponse {
  success: boolean;
  data: {
    activities: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      actorName?: string;
      actorRole?: string;
      status?: string;
      createdAt: string;
    }>;
  };
}

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'activity'>('overview');

  // Fetch KPI Summary
  const { data: summaryData, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery<DashboardSummaryResponse>({
    queryKey: ['admin-dashboard-summary'],
    queryFn: () => apiClient<DashboardSummaryResponse>('/dashboard/summary'),
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN'),
    refetchInterval: 15000,
  });

  // Fetch Operational Alerts
  const { data: alertsData, isLoading: isAlertsLoading } = useQuery<AlertsResponse>({
    queryKey: ['admin-dashboard-alerts'],
    queryFn: () => apiClient<AlertsResponse>('/dashboard/alerts'),
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN'),
    refetchInterval: 30000,
  });

  // Fetch Activity Feed
  const { data: activityData, isLoading: isActivityLoading } = useQuery<RecentActivityResponse>({
    queryKey: ['admin-dashboard-activity'],
    queryFn: () => apiClient<RecentActivityResponse>('/dashboard/recent-activity'),
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN'),
    refetchInterval: 15000,
  });

  const kpis = summaryData?.data?.kpis;
  const alerts = alertsData?.data?.alerts || [];
  const activities = activityData?.data?.activities || [];

  return (
    <PageWrapper
      title="Showroom Operational Dashboard"
      description="Real-time KPI metrics, active operational alerts, activity feed, and administrative shortcuts."
      action={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetchSummary()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
          <Link href="/admin/staff">
            <Button variant="primary" size="sm">
              <UserPlus className="w-4 h-4 mr-1.5" /> Provision Staff
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Revenue"
            value={isSummaryLoading ? '...' : `₹${kpis?.revenue?.toLocaleString('en-IN') || 0}`}
            change="Completed Jobs & Parts"
            isPositive
            icon={DollarSign}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Active Requests"
            value={isSummaryLoading ? '...' : kpis?.pendingRequests ?? 0}
            change={`Total: ${kpis?.totalRequests ?? 0}`}
            isPositive={false}
            icon={Wrench}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Active Workers"
            value={isSummaryLoading ? '...' : kpis?.activeWorkers ?? 0}
            change="Assigned Technicians"
            isPositive
            icon={Users}
            iconColor="text-indigo-400"
          />
          <StatCard
            title="Customer Rating"
            value={isSummaryLoading ? '...' : `${kpis?.averageRating ?? 5.0} ★`}
            change="Verified Reviews"
            isPositive
            icon={Star}
            iconColor="text-amber-400"
          />
          <StatCard
            title="Low Stock Alerts"
            value={isSummaryLoading ? '...' : kpis?.lowStockAlerts ?? 0}
            change="Inventory Items"
            isPositive={kpis?.lowStockAlerts === 0}
            icon={AlertTriangle}
            iconColor="text-rose-400"
          />
          <StatCard
            title="Overdue Services"
            value={isSummaryLoading ? '...' : kpis?.overdueServices ?? 0}
            change="Requires Action"
            isPositive={kpis?.overdueServices === 0}
            icon={Clock}
            iconColor="text-orange-400"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 space-x-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Overview & Charts
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Active Alerts
            {alerts.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-rose-500/20 text-rose-400 rounded-full font-bold">
                {alerts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Recent Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Trends Chart Card */}
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" /> 7-Day Request Activity Trend
                  </CardTitle>
                  <CardDescription>Daily service jobs and spare part request volume</CardDescription>
                </CardHeader>
                <CardContent>
                  {summaryData?.data?.charts?.requestsByDay ? (
                    <div className="space-y-3">
                      {summaryData.data.charts.requestsByDay.map((item) => (
                        <div key={item.date} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-400 w-24">{item.date}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (item.count / 10) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-200 w-8 text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No chart data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Trends Chart Card */}
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> 7-Day Revenue Trend
                  </CardTitle>
                  <CardDescription>Estimated revenue generation per day (₹)</CardDescription>
                </CardHeader>
                <CardContent>
                  {summaryData?.data?.charts?.revenueByDay ? (
                    <div className="space-y-3">
                      {summaryData.data.charts.revenueByDay.map((item) => (
                        <div key={item.date} className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-400 w-24">{item.date}</span>
                          <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (item.amount / 5000) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-emerald-400 w-20 text-right">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No chart data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Workflows Grid */}
            <Card glass>
              <CardHeader>
                <CardTitle>Administrative Workflows & Operations</CardTitle>
                <CardDescription>Direct navigation to core showroom management systems</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/services">
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group">
                    <div className="flex items-center gap-3 text-blue-400 font-bold">
                      <Wrench className="w-5 h-5" />
                      <span>Service Job Center</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Assign service jobs to available technicians, track job progress, and mark completions.
                    </p>
                  </div>
                </Link>

                <Link href="/admin/spare-parts/requests">
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold">
                      <Package className="w-5 h-5" />
                      <span>Spare Part Orders</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Manage customer spare part requests, set estimated delivery dates, and update order timelines.
                    </p>
                  </div>
                </Link>

                <Link href="/admin/audit-logs">
                  <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group">
                    <div className="flex items-center gap-3 text-amber-400 font-bold">
                      <FileText className="w-5 h-5" />
                      <span>Audit Logs</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Inspect immutable system audit logs, track staff actions, and review entity changes.
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'alerts' && (
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Operational Alerts Engine
              </CardTitle>
              <CardDescription>Actionable inventory, service, and inquiry warnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAlertsLoading ? (
                <p className="text-sm text-gray-400">Loading operational alerts...</p>
              ) : alerts.length === 0 ? (
                <div className="p-8 text-center bg-gray-900/50 rounded-xl border border-gray-800">
                  <p className="text-sm text-emerald-400 font-medium">All Systems Operational!</p>
                  <p className="text-xs text-gray-500 mt-1">No active low stock or overdue service alerts at this time.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-4 hover:border-gray-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-lg ${
                          alert.severity === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{alert.title}</p>
                          <Badge variant={alert.severity === 'HIGH' ? 'error' : 'warning'}>
                            {alert.category.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                    <Link href={alert.href}>
                      <Button variant="outline" size="sm">
                        Resolve Alert
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" /> Recent Activity Feed
              </CardTitle>
              <CardDescription>Live log of system events, audit entries, and request updates (15s auto-refresh)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isActivityLoading ? (
                <p className="text-sm text-gray-400">Loading activity feed...</p>
              ) : activities.length === 0 ? (
                <p className="text-sm text-gray-500">No activity logged yet.</p>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-800 text-blue-400 mt-0.5">
                        {item.type === 'AUDIT' ? <FileText className="w-4 h-4" /> : item.type === 'SERVICE_JOB' ? <Wrench className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-200">{item.title}</p>
                          {item.status && <Badge variant="neutral">{item.status}</Badge>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                        {item.actorName && (
                          <p className="text-[11px] text-gray-500 mt-1">
                            By: <span className="text-gray-300 font-medium">{item.actorName}</span> ({item.actorRole})
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
