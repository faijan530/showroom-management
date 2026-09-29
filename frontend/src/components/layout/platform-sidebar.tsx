'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Users, Settings, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

const platformNavItems = [
  { name: 'Platform Dashboard', href: '/platform/dashboard', icon: LayoutDashboard },
  { name: 'Showroom Management', href: '/platform/showrooms', icon: Store },
  { name: 'Platform & Showroom Users', href: '/platform/users', icon: Users },
  { name: 'Platform Settings', href: '/platform/settings', icon: Settings },
];

export function PlatformSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-rose-900/30 bg-gray-950/90 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold">Superadmin Control Center</span>
        </div>

        <nav className="space-y-1">
          {platformNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/80'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-rose-400' : 'text-gray-500')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-rose-400">Platform Scope</p>
        <p className="text-[11px] text-gray-500">Global Marketplace Governance</p>
      </div>
    </aside>
  );
}
