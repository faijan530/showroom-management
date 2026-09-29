'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  User as UserIcon,
  LogOut,
  LogIn,
  Search,
  Moon,
  Compass,
  Menu,
  X,
  Sparkles,
  Car,
  Wrench,
  Store,
  Info,
  Package,
} from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, fetchCurrentUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

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

  const handleThemeToggle = () => {
    toast('info', 'SaaS Dark Mode Active');
  };

  const navLinks = [
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Spare Parts', href: '/spare-parts', icon: Package },
    { name: 'Services', href: '/customer/services', icon: Wrench },
    { name: 'Showrooms', href: '/showrooms', icon: Store },
    { name: 'About', href: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-gray-950/75 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top subtle glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Product Logo & Brand Mark */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <Compass className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 flex items-center gap-2">
                MotoHub
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SaaS
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-300">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500/40 text-white font-bold shadow-md shadow-blue-500/10'
                      : 'border-transparent text-gray-300 hover:text-white hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm lg:max-w-md relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search vehicles, OEM parts, services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 text-xs bg-gray-900/90 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
          />
          <kbd className="hidden sm:inline-block absolute right-3 top-2 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-950 border border-gray-800 rounded-md shadow-sm">
            ⌘K
          </kbd>
        </form>

        {/* Right: Theme Toggle & User Auth */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            title="SaaS Dark Theme"
            className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 hover:bg-gray-800/80 transition-all shadow-sm"
          >
            <Moon className="w-4 h-4 text-blue-400" />
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
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 text-xs text-gray-200 hover:border-blue-500/40 transition-all shadow-md group">
                  <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-white max-w-[100px] sm:max-w-[130px] truncate">
                    {user.full_name}
                  </span>
                  <Badge variant="neutral" className="text-[10px] py-0 px-1.5 bg-blue-500/10 text-blue-300 border-blue-500/20">
                    {user.role}
                  </Badge>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 p-2.5 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="secondary" size="sm" className="text-xs bg-gray-900/90 border-gray-800 hover:bg-gray-800 text-gray-200 rounded-xl px-3.5">
                  <LogIn className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm" className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 px-4 rounded-xl border border-blue-400/30 transition-all">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden pt-3 pb-4 px-4 border-t border-gray-800/80 bg-gray-950/95 backdrop-blur-xl mt-2 space-y-3 animate-fade-up">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles, OEM parts, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </form>
          <nav className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-300">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 font-bold'
                      : 'bg-gray-900/80 border-gray-800 hover:border-blue-500/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

