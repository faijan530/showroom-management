'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Search,
  MapPin,
  Moon,
  Compass,
  Bike,
  Package,
  Wrench,
  Store,
  Menu,
  X
} from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, fetchCurrentUser, logout } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-xl px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Product Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                MotoHub <span className="text-blue-500 text-xs font-mono font-normal">SaaS</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">
              Vehicles
            </Link>
            <Link href="/customer/spare-parts/request" className="hover:text-white transition-colors">
              Spare Parts
            </Link>
            <Link href="/customer/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <Link href="/platform/showrooms" className="hover:text-white transition-colors">
              Showrooms
            </Link>
            <Link href="/customer/feedback" className="hover:text-white transition-colors">
              About
            </Link>
          </nav>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search vehicles, spare parts, services or showrooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-900/90 border border-gray-800 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </form>

        {/* Right: Location, Theme Toggle, Login / Register */}
        <div className="flex items-center gap-3">
          {/* Location Badge Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Bangalore</span>
          </div>

          {/* Theme Toggle Button */}
          <button className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors">
            <Moon className="w-4 h-4" />
          </button>

          {/* User Session Auth State */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href={
                  user.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : user.role === 'WORKER'
                    ? '/worker/dashboard'
                    : user.role === 'INVENTORY_MANAGER'
                    ? '/inventory/dashboard'
                    : user.role === 'SUPERADMIN'
                    ? '/platform/dashboard'
                    : '/customer/dashboard'
                }
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 hover:border-blue-500/40 transition-all">
                  <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-bold text-white max-w-[100px] truncate">{user.full_name}</span>
                  <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                    {user.role}
                  </Badge>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="secondary" size="sm" className="text-xs bg-gray-900 border-gray-800 hover:bg-gray-850">
                  <LogIn className="w-3.5 h-3.5 mr-1 text-gray-400" /> Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm" className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden pt-3 pb-2 border-t border-gray-800 mt-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search vehicles, parts, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-900 border border-gray-800 rounded-xl text-gray-200"
            />
          </form>
          <nav className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-300">
            <Link href="/" className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-center">
              Vehicles
            </Link>
            <Link href="/customer/spare-parts/request" className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-center">
              Spare Parts
            </Link>
            <Link href="/customer/services" className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-center">
              Services
            </Link>
            <Link href="/platform/showrooms" className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-center">
              Showrooms
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
