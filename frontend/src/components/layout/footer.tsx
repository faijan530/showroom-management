'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Wrench,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Car,
  Lock,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#070a12] via-gray-950 to-[#04060b] text-gray-400 border-t border-white/[0.08] overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 relative z-10 space-y-12">
        {/* Top Feature Banner inside Footer */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-gray-900/40 border border-blue-500/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-md">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ENTERPRISE AUTOMOTIVE PLATFORM</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ready to explore vehicles or book a service?
            </h3>
            <p className="text-xs text-gray-300 max-w-xl">
              Access 500+ verified vehicles, genuine OEM spare parts, and certified service packages seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/vehicles"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all border border-blue-400/20 flex items-center gap-1.5"
            >
              <Car className="w-4 h-4" /> Browse Vehicles
            </Link>
            <Link
              href="/customer/services"
              className="px-5 py-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 text-gray-200 hover:text-white font-semibold text-xs border border-gray-800 transition-all flex items-center gap-1.5"
            >
              <Wrench className="w-4 h-4 text-blue-400" /> Book Service
            </Link>
          </div>
        </div>

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand Profile (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-lg shadow-blue-500/25 border border-white/20 group-hover:scale-105 transition-all duration-300">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200">
                  MotoHub SaaS
                </span>
                <span className="text-[10px] text-blue-400 font-mono tracking-wider uppercase">
                  Multi-Showroom Network
                </span>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Multi-showroom vehicle marketplace & operational SaaS platform. Buy, service, and maintain vehicles across certified dealership networks with real-time tracking.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 text-[11px] font-semibold text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Systems Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 text-[11px] font-semibold text-gray-300">
                <Lock className="w-3 h-3 text-blue-400" /> 256-Bit SSL
              </span>
            </div>
          </div>

          {/* Column 2: Product Catalog (3 cols) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Product Catalog
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/vehicles" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Vehicles Catalog (Bikes & Cars)</span>
                </Link>
              </li>
              <li>
                <Link href="/spare-parts" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Genuine OEM Spare Parts</span>
                </Link>
              </li>
              <li>
                <Link href="/customer/services" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Service Packages & Maintenance</span>
                </Link>
              </li>
              <li>
                <Link href="/showrooms" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Showroom Network Directory</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Platform (2 cols) */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  <span>About MotoHub</span>
                </Link>
              </li>
              <li>
                <Link href="/customer/feedback" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Verified Reviews</span>
                </Link>
              </li>
              <li>
                <Link href="/platform/showrooms" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Dealership Onboarding</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Account & Portals (3 cols) */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-extrabold text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Portals & Account
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/auth/login" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Customer & Staff Sign In</span>
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  <span>Register Customer Account</span>
                </Link>
              </li>
              <li>
                <Link href="/platform/login" className="group flex items-center gap-1.5 text-gray-400 hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  <span>SuperAdmin Control Center</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-medium">
          <p>© 2026 MotoHub Multi-Showroom SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 100% Verified Showroom Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

