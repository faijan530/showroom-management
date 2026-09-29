'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Users, Wrench, Package, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Showrooms', href: '/showrooms', icon: Store },
  { name: 'Users & Roles', href: '/users', icon: Users },
  { name: 'Service Jobs', href: '/services', icon: Wrench },
  { name: 'Inventory & Parts', href: '/inventory', icon: Package },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-800/80 bg-gray-950/60 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/80'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-blue-400' : 'text-gray-500')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800 text-xs text-gray-500">
        <p className="font-semibold text-gray-400">Module 001 Active</p>
        <p>Platform Foundation v1.0</p>
      </div>
    </aside>
  );
}
