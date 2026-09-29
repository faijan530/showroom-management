'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  ShieldCheck,
  Store,
  Users,
  Wrench,
  Package,
  Bike,
  Car,
  Star,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Layers,
  Activity,
  Cpu,
  Sparkles,
  Lock,
  MessageSquare
} from 'lucide-react';

interface ShowroomsResponse {
  success: boolean;
  data: {
    showrooms: Array<{
      id: string;
      name: string;
      code: string;
      address: string;
      contactPhone: string;
      status: string;
    }>;
  };
}

export default function Home() {
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore();
  const router = useRouter();

  const [categoryTab, setCategoryTab] = useState<'vehicles' | 'parts' | 'services'>('vehicles');

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Fetch real showrooms for Showroom Finder panel if available
  const { data: showroomData } = useQuery<ShowroomsResponse>({
    queryKey: ['public-showrooms-list'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  const showrooms = showroomData?.data?.showrooms || [];
  const topShowroom = showrooms[0];

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 selection:bg-blue-600 selection:text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
        {/* ================================================== */}
        {/* 1. HERO SECTION & SIDE SHOWROOM FINDER CONTAINER */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Hero Card (8 Cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-gray-900/90 via-gray-950 to-[#0c1220] border border-gray-800/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Background Glow Accents */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Small Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Trusted by Multiple Showrooms Across India</span>
              </div>

              {/* Main Headings */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Your Complete <br />
                  <span className="bg-gradient-to-r from-white via-blue-100 to-gray-300 bg-clip-text text-transparent">
                    Vehicle Ecosystem
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl font-black text-blue-400 tracking-wide">
                  Buy • Service • Maintain
                </p>
              </div>

              {/* Supporting Subtitle */}
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                Explore vehicles, book services, order genuine spare parts and connect with verified showrooms — all in one platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/customer/services')}
                  className="bg-white text-gray-950 hover:bg-gray-200 font-bold px-6 py-3 text-xs rounded-xl shadow-lg shadow-white/10"
                >
                  Explore Vehicles <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/customer/services/request')}
                  className="bg-gray-900/80 border-gray-800 text-gray-200 hover:text-white hover:bg-gray-850 px-6 py-3 text-xs rounded-xl"
                >
                  <Wrench className="w-4 h-4 mr-2 text-blue-400" /> Book a Service
                </Button>
              </div>

              {/* Trust Statistics Bar */}
              <div className="pt-6 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-blue-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm">100+</p>
                    <p className="text-[10px] text-gray-400">Trusted Showrooms</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-emerald-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm">10K+</p>
                    <p className="text-[10px] text-gray-400">Happy Customers</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-indigo-400">
                    <Bike className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm">50K+</p>
                    <p className="text-[10px] text-gray-400">Vehicles & Parts</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm">4.8★</p>
                    <p className="text-[10px] text-gray-400">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Automotive Hero Visual Banner & Feature List Overlay */}
            <div className="mt-8 rounded-2xl border border-gray-800/80 bg-gray-950 overflow-hidden relative group">
              <img
                src="/hero_showroom.jpg"
                alt="Premium Showroom Network"
                className="w-full h-64 sm:h-80 object-cover object-center group-hover:scale-102 transition-transform duration-700 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

              {/* Top Banner Tag */}
              <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-gray-800 text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-widest">
                PREMIUM SHOWROOM NETWORK
              </div>

              {/* Floating Feature List Overlay (Right Overlay matching reference) */}
              <div className="absolute bottom-4 right-4 hidden sm:flex flex-col gap-2 bg-gray-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-gray-800/90 text-xs max-w-xs shadow-xl">
                <div className="flex items-center gap-2 text-gray-200">
                  <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Wide Range of Vehicles & Brands</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Certified Showrooms Across Cities</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Expert Service & Maintenance</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-semibold text-[11px]">Genuine Spare Parts Availability</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />
                  <span className="font-semibold text-[11px]">Verified Customer Reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Hero Showroom Finder Panel (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800/80 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xl">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Find the Best Showrooms <br />
                <span className="text-blue-400">Near You</span>
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Compare vehicles, services and genuine spare parts from verified showrooms.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/platform/showrooms')}
                className="w-full bg-gray-900 border-gray-700 text-blue-400 hover:text-white hover:bg-gray-800 text-xs font-bold rounded-xl py-2.5"
              >
                Browse Showrooms <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>

            {/* Stylized Map Visual with Showroom Card Preview */}
            <div className="rounded-2xl border border-gray-800 bg-[#0a0f1d] p-4 relative h-64 flex flex-col justify-between overflow-hidden">
              {/* Map Grid Background Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Floating Location Marker */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-mono text-blue-300">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>Network Map Active</span>
                </div>
              </div>

              {/* Showroom Preview Card Overlay */}
              <div className="relative z-10 p-3 rounded-xl bg-gray-900/95 border border-gray-800 backdrop-blur-md space-y-2 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold text-white text-xs">
                        {topShowroom ? topShowroom.name : 'Apex Motors'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {topShowroom ? topShowroom.address : 'Bangalore'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-[10px]">
                    <span className="font-bold text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" /> 4.8
                    </span>
                    <span className="text-gray-500 block">1.2 km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. ROLE EXPERIENCE CARDS (Horizontal 5-Card Row)   */}
        {/* ================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">Role-Based Product Workflows</h2>
              <p className="text-xs text-gray-400">Isolated experience portals tailored for every platform role</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Customer */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Customer</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Book services, order parts, manage your vehicles and track everything in one place.
                  </p>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-gray-400 border-b border-gray-850 pb-1 font-mono">
                    <span>My Garage</span>
                    <span className="text-purple-400 font-bold">2 Vehicles</span>
                  </div>
                  <div className="p-1.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-200">Apache RTR 160</span>
                    <Badge variant="success" className="text-[9px] py-0">COMPLETED</Badge>
                  </div>
                </div>
              </div>

              <Link href="/customer/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs text-purple-300 border-gray-800 hover:bg-purple-500/10">
                  View Workflow <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Card 2: Showroom Admin */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Store className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Showroom Admin</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Manage showroom operations, assign technicians, handle requests and monitor performance.
                  </p>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-gray-400 border-b border-gray-850 pb-1 font-mono">
                    <span>Operations</span>
                    <span className="text-emerald-400 font-bold">₹15.4K Rev</span>
                  </div>
                  <div className="p-1.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-200">Assign Technician</span>
                    <Badge variant="warning" className="text-[9px] py-0">PENDING</Badge>
                  </div>
                </div>
              </div>

              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs text-emerald-300 border-gray-800 hover:bg-emerald-500/10">
                  View Workflow <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Card 3: Inventory Manager */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Inventory Manager</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Manage vehicle inventory, spare parts stock and respond to availability enquiries.
                  </p>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-gray-400 border-b border-gray-850 pb-1 font-mono">
                    <span>Stock Control</span>
                    <span className="text-amber-400 font-bold">4 Low Items</span>
                  </div>
                  <div className="p-1.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-200">Adjust Stock (+5)</span>
                    <Badge variant="info" className="text-[9px] py-0">UPDATED</Badge>
                  </div>
                </div>
              </div>

              <Link href="/inventory/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs text-amber-300 border-gray-800 hover:bg-amber-500/10">
                  View Workflow <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Card 4: Technician / Worker */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Wrench className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Technician / Worker</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    View assigned jobs, update service progress and log completion notes.
                  </p>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-gray-400 border-b border-gray-850 pb-1 font-mono">
                    <span>Task Queue</span>
                    <span className="text-sky-400 font-bold">3 Assigned</span>
                  </div>
                  <div className="p-1.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-200">Oil Replacement</span>
                    <Badge variant="info" className="text-[9px] py-0">IN_PROGRESS</Badge>
                  </div>
                </div>
              </div>

              <Link href="/worker/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs text-sky-300 border-gray-800 hover:bg-sky-500/10">
                  View Workflow <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Card 5: Platform SuperAdmin */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-pink-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Platform SuperAdmin</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Onboard showrooms, manage the platform and monitor global metrics.
                  </p>
                </div>

                {/* Dashboard Preview Mockup */}
                <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-gray-400 border-b border-gray-850 pb-1 font-mono">
                    <span>Platform Overview</span>
                    <span className="text-pink-400 font-bold">12 Showrooms</span>
                  </div>
                  <div className="p-1.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-200">Audit Logs</span>
                    <Badge variant="neutral" className="text-[9px] py-0">ACTIVE</Badge>
                  </div>
                </div>
              </div>

              <Link href="/platform/dashboard">
                <Button variant="outline" size="sm" className="w-full text-xs text-pink-300 border-gray-800 hover:bg-pink-500/10">
                  View Workflow <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. WHY CHOOSE SECTION & POPULAR CATEGORIES GRID     */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Why Choose Section (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-gray-900/80 border border-gray-800/80 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>WHY CHOOSE MOTOHUB</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                Everything You Need for a Better Vehicle Experience
              </h2>

              <p className="text-xs text-gray-300 leading-relaxed">
                A unified platform that connects customers, showrooms and experts for vehicles, spare parts and professional servicing.
              </p>
            </div>

            {/* 2x2 Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/90 space-y-1.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 w-fit">
                  <Store className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs">Verified Showrooms</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Authorized and trusted dealerships across multiple cities.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/90 space-y-1.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                  <Package className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs">Genuine Spare Parts</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Original parts with real-time availability and stock updates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/90 space-y-1.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 w-fit">
                  <Wrench className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-xs">Professional Servicing</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Certified technicians and transparent service tracking.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/90 space-y-1.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 w-fit">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <h4 className="font-bold text-white text-xs">Complete Transparency</h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Reviews, ratings and real-time updates for a trusted experience.
                </p>
              </div>
            </div>
          </div>

          {/* Popular Categories Section (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-gray-900/80 border border-gray-800/80 p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Popular Categories</h2>
                <p className="text-xs text-gray-400">Browse vehicle models, parts catalog and repair packages</p>
              </div>

              {/* Category Tab Selector */}
              <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 space-x-1">
                <button
                  onClick={() => setCategoryTab('vehicles')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryTab === 'vehicles' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Vehicles
                </button>
                <button
                  onClick={() => setCategoryTab('parts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryTab === 'parts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Spare Parts
                </button>
                <button
                  onClick={() => setCategoryTab('services')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    categoryTab === 'services' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Services
                </button>
              </div>
            </div>

            {/* 4 Category Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: Bikes */}
              <Link href="/customer/services" className="group">
                <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col justify-between h-48 hover:border-blue-500/50 transition-all">
                  <div className="h-32 bg-gray-900 overflow-hidden relative">
                    <img
                      src="/category_bikes.jpg"
                      alt="Bikes"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Bikes</span>
                    <span className="text-blue-400 font-semibold text-[10px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Card 2: Cars */}
              <Link href="/customer/services" className="group">
                <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col justify-between h-48 hover:border-blue-500/50 transition-all">
                  <div className="h-32 bg-gray-900 overflow-hidden relative">
                    <img
                      src="/category_cars.jpg"
                      alt="Cars"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Cars</span>
                    <span className="text-blue-400 font-semibold text-[10px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Card 3: Engine Parts */}
              <Link href="/customer/spare-parts/request" className="group">
                <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col justify-between h-48 hover:border-blue-500/50 transition-all">
                  <div className="h-32 bg-gray-900 overflow-hidden relative">
                    <img
                      src="/category_engine.jpg"
                      alt="Engine Parts"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate">Engine Parts</span>
                    <span className="text-blue-400 font-semibold text-[10px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>

              {/* Card 4: Brakes & Suspension */}
              <Link href="/customer/spare-parts/request" className="group">
                <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col justify-between h-48 hover:border-blue-500/50 transition-all">
                  <div className="h-32 bg-gray-900 overflow-hidden relative">
                    <img
                      src="/category_brakes.jpg"
                      alt="Brakes & Suspension"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate">Brakes & Susp.</span>
                    <span className="text-blue-400 font-semibold text-[10px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 4. CUSTOMER TESTIMONIALS & FINAL CTA BANNER       */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Customer Testimonials Section (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-gray-900/80 border border-gray-800/80 p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">What Our Customers Say</h2>
                <p className="text-xs text-gray-400">Verified feedback from vehicle owners across India</p>
              </div>
              <Link href="/customer/feedback" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    RM
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Rahul Mehta</h4>
                    <p className="text-[10px] text-gray-400">Bangalore</p>
                  </div>
                  <div className="ml-auto flex items-center text-amber-400 text-xs font-bold gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> 5.0
                  </div>
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  &quot;Excellent service and genuine parts. The entire booking process was smooth and transparent.&quot;
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                    PS
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Priya Sharma</h4>
                    <p className="text-[10px] text-gray-400">Hyderabad</p>
                  </div>
                  <div className="ml-auto flex items-center text-amber-400 text-xs font-bold gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> 5.0
                  </div>
                </div>
                <p className="text-xs text-gray-300 italic leading-relaxed">
                  &quot;Found the perfect bike and the servicing experience was amazing. Highly recommended!&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA Banner (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md w-fit text-white">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Multiple Showrooms. <br />
                One Powerful Platform.
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Connect your dealership or sign up as a customer to access authorized showroom sales, inventory, and repair servicing.
              </p>
            </div>

            <div className="relative z-10">
              <Link href="/auth/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-white text-blue-900 hover:bg-gray-100 font-extrabold text-sm py-3.5 rounded-xl shadow-xl"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
