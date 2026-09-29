'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Button } from '@/components/ui/button';
import { Store, Users, Cpu, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'SUPERADMIN':
          router.push('/platform/dashboard');
          break;
        case 'ADMIN':
        case 'INVENTORY_MANAGER':
          router.push('/admin/dashboard');
          break;
        case 'WORKER':
          router.push('/worker/dashboard');
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <PageWrapper
      title="Showroom SaaS Platform"
      description="Multi-Showroom Vehicle & Service Marketplace."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Platform Modules" value="Active" change="Module 003 Live" isPositive icon={Cpu} />
          <StatCard title="Database Engine" value="PostgreSQL" change="Prisma Singleton" isPositive icon={ShieldCheck} iconColor="text-emerald-400" />
          <StatCard title="System Roles" value="5 Roles" change="Multi-Tenant Scoped" isPositive icon={Users} iconColor="text-indigo-400" />
          <StatCard title="Architecture" value="App Router" change="React 19 + TypeScript" isPositive icon={Store} iconColor="text-amber-400" />
        </div>

        <div className="p-8 text-center rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold text-white">Welcome to Showroom SaaS Marketplace</h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Please sign in with your account to access your dedicated operational panel.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button variant="primary" onClick={() => router.push('/auth/login')}>
              Showroom Account Sign In
            </Button>
            <Button variant="secondary" onClick={() => router.push('/platform/login')}>
              Superadmin Platform Portal
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
