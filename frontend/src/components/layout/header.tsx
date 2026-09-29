'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { HealthBadge } from '@/components/feedback/health-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User as UserIcon, LogOut, LogIn, UserPlus } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, fetchCurrentUser, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Showroom SaaS Platform</h1>
          <p className="text-xs text-gray-400">Multi-Showroom Marketplace & Management</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <HealthBadge />

        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-white">{user.full_name}</span>
              <Badge variant={user.role === 'SUPERADMIN' ? 'error' : user.role === 'ADMIN' ? 'warning' : 'info'} className="ml-1 text-[10px] py-0 px-1.5">
                {user.role}
              </Badge>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="secondary" size="sm">
                <LogIn className="w-4 h-4 mr-1" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="primary" size="sm">
                <UserPlus className="w-4 h-4 mr-1" />
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
