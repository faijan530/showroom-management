'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LayoutDashboard, Users, Store, ShieldAlert, Home, Wrench, Package, Bike, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  let navItems = [
    { name: 'Home', href: '/', icon: Home },
  ];

  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') {
      navItems = [
        { name: 'Showroom Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Service Jobs', href: '/admin/services', icon: Wrench },
        { name: 'Vehicle Catalog', href: '/inventory/vehicles', icon: Bike },
        { name: 'Spare Parts Inventory', href: '/inventory/spare-parts', icon: Package },
        { name: 'Spare Part Orders', href: '/admin/spare-parts/requests', icon: Package },
        { name: 'Stock Inquiries Queue', href: '/inventory/inquiries', icon: MessageSquare },
        { name: 'Customer Enquiries', href: '/admin/enquiries', icon: MessageSquare },
        { name: 'Staff Directory', href: '/admin/staff', icon: Users },
      ];
    } else if (user.role === 'WORKER') {
      navItems = [
        { name: 'Worker Dashboard', href: '/worker/dashboard', icon: Wrench },
      ];
    } else if (user.role === 'INVENTORY_MANAGER') {
      navItems = [
        { name: 'Inventory Dashboard', href: '/inventory/dashboard', icon: Package },
        { name: 'Vehicle Catalog', href: '/inventory/vehicles', icon: Bike },
        { name: 'Spare Parts Inventory', href: '/inventory/spare-parts', icon: Package },
        { name: 'Spare Part Orders', href: '/admin/spare-parts/requests', icon: Package },
        { name: 'Stock Inquiries Queue', href: '/inventory/inquiries', icon: MessageSquare },
      ];
    } else if (user.role === 'USER') {
      navItems = [
        { name: 'Browse Services', href: '/customer/services', icon: Wrench },
        { name: 'My Service Requests', href: '/customer/services/requests', icon: Package },
        { name: 'Request Spare Part', href: '/customer/spare-parts/request', icon: Package },
        { name: 'My Part Requests', href: '/customer/spare-parts/requests', icon: Package },
        { name: 'Ask Part Availability', href: '/customer/enquiries/new', icon: MessageSquare },
        { name: 'My Enquiries', href: '/customer/enquiries', icon: MessageSquare },
        { name: 'My Garage', href: '/customer/vehicles', icon: Bike },
      ];
    } else if (user.role === 'SUPERADMIN') {
      navItems = [
        { name: 'Platform Dashboard', href: '/platform/dashboard', icon: ShieldAlert },
        { name: 'Showroom Management', href: '/platform/showrooms', icon: Store },
      ];
    }
  }

  return (
    <aside className="w-64 border-r border-gray-800/80 bg-gray-950/60 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {isAuthenticated && user && (
          <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1">
            <p className="text-gray-400 font-medium">Logged in as:</p>
            <p className="font-bold text-white truncate">{user.full_name}</p>
            <p className="text-[10px] uppercase font-mono text-blue-400">{user.role}</p>
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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
      </div>

      <div className="p-3 rounded-xl bg-gray-900/50 border border-gray-800 text-xs text-gray-500 space-y-0.5">
        <p className="font-semibold text-gray-400">Showroom Scope</p>
        <p className="text-[11px] text-gray-500">
          {user?.role === 'ADMIN' ? 'Showroom Operational Panel' : user?.role === 'WORKER' ? 'Technician Task Panel' : user?.role === 'INVENTORY_MANAGER' ? 'Inventory Control' : 'Marketplace Portal'}
        </p>
      </div>
    </aside>
  );
}
