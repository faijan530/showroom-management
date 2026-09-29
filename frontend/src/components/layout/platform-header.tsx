'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { HealthBadge } from '@/components/feedback/health-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, User as UserIcon, LogOut } from 'lucide-react';

export function PlatformHeader() {
  const { user, isAuthenticated, fetchCurrentUser, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/platform/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rose-900/30 bg-gray-950/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      <Link href="/platform/dashboard" className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-red-700 shadow-lg shadow-rose-500/20">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Platform Administration
            <span className="text-[10px] uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono">
              Superadmin Only
            </span>
          </h1>
          <p className="text-xs text-gray-400">Multi-Showroom Platform Governance & Control</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <HealthBadge />

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-rose-900/40 text-xs text-gray-300">
              <UserIcon className="w-4 h-4 text-rose-400" />
              <span className="font-semibold text-white">{user.full_name}</span>
              <Badge variant="error" className="ml-1 text-[10px] py-0 px-1.5">
                {user.role}
              </Badge>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
              <LogOut className="w-4 h-4 mr-1" />
              Platform Logout
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
