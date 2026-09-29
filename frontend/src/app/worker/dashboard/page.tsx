'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function WorkerDashboardPage() {
  return (
    <PageWrapper
      title="Worker & Technician Panel"
      description="View assigned vehicle service jobs, update repair status, and log timestamp checkpoints."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Service Jobs"
            value="0 Jobs"
            change="Pending Acceptance"
            isPositive
            icon={Wrench}
            iconColor="text-blue-400"
          />
          <StatCard
            title="In Progress"
            value="0 Jobs"
            change="Active Servicing"
            isPositive
            icon={Clock}
            iconColor="text-amber-400"
          />
          <StatCard
            title="Completed Jobs"
            value="0 Jobs"
            change="This Month"
            isPositive
            icon={CheckCircle2}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Role Scope"
            value="WORKER"
            change="Showroom Technician"
            isPositive
            icon={AlertCircle}
            iconColor="text-indigo-400"
          />
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>Assigned Repair & Service Tasks</span>
            </CardTitle>
            <CardDescription>Service jobs assigned to you by your Showroom Admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
              <Wrench className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-sm font-semibold text-gray-300">No Service Jobs Assigned Yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                When your Showroom Admin assigns bike or car service requests to you (Module 008), they will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
