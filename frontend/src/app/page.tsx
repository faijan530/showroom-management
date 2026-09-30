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
  MapPin,
  ChevronRight,
  Search,
  Filter,
  Flame,
  Clock,
  ThumbsUp,
  Settings,
  Disc,
  Zap,
  Battery,
  ShieldAlert,
  Sparkles,
  Compass,
  CheckCircle2
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

interface VehiclesResponse {
  success: boolean;
  data: {
    vehicles: Array<{
      id: string;
      title: string;
      type: 'BIKE' | 'CAR';
      brand: string;
      model: string;
      year: number;
      price: number;
      color: string;
      engine_cc: number;
      stock_quantity: number;
      showroom_name?: string;
      image_url?: string;
    }>;
  };
}

// Structured mock vehicles fallback when DB has no records yet
const MOCK_FEATURED_VEHICLES = [
  {
    id: 'mock-1',
    title: 'Yamaha YZF R15 V4',
    type: 'BIKE' as const,
    brand: 'Yamaha',
    model: 'YZF R15 V4',
    year: 2025,
    price: 182000,
    color: 'Racing Blue',
    engine_cc: 155,
    stock_quantity: 5,
    rating: '4.9',
    reviews_count: 128,
    showroom_name: 'Apex Motors',
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mock-2',
    title: 'Hero Splendor+ XTEC',
    type: 'BIKE' as const,
    brand: 'Hero',
    model: 'Splendor+ XTEC',
    year: 2025,
    price: 79900,
    color: 'Black & Gold',
    engine_cc: 100,
    stock_quantity: 12,
    rating: '4.8',
    reviews_count: 340,
    showroom_name: 'City Honda & Motors',
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mock-3',
    title: 'Maruti Suzuki Swift ZXi',
    type: 'CAR' as const,
    brand: 'Maruti Suzuki',
    model: 'Swift ZXi',
    year: 2025,
    price: 649000,
    color: 'Luster Blue',
    engine_cc: 1197,
    stock_quantity: 3,
    rating: '4.7',
    reviews_count: 95,
    showroom_name: 'Star Auto Hub',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mock-4',
    title: 'Hyundai Creta SX Tech',
    type: 'CAR' as const,
    brand: 'Hyundai',
    model: 'Creta SX',
    year: 2025,
    price: 1399000,
    color: 'Titan Grey',
    engine_cc: 1497,
    stock_quantity: 4,
    rating: '4.9',
    reviews_count: 210,
    showroom_name: 'Prime Dealerships',
    image_url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
  },
];

export default function Home() {
  const { fetchCurrentUser } = useAuthStore();
  const router = useRouter();

  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [showroomSearch, setShowroomSearch] = useState<string>('');

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Fetch real showrooms for Showroom Finder panel
  const { data: showroomData } = useQuery<ShowroomsResponse>({
    queryKey: ['public-showrooms-list'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  // Fetch real vehicles for Featured section
  const { data: vehiclesData } = useQuery<VehiclesResponse>({
    queryKey: ['public-featured-vehicles'],
    queryFn: () => apiClient<VehiclesResponse>('/vehicles'),
  });

  const showrooms = showroomData?.data?.showrooms || [];
  const realVehicles = vehiclesData?.data?.vehicles || [];

  // Filter showrooms by city or search if provided
  const filteredShowrooms = showrooms.filter((s) => {
    const matchesCity = selectedCity === 'All Cities' || s.address.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch = !showroomSearch || s.name.toLowerCase().includes(showroomSearch.toLowerCase()) || s.address.toLowerCase().includes(showroomSearch.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const topShowroom = filteredShowrooms[0] || showrooms[0];

  // Vehicles list: use real backend vehicles if present, else structured fallback
  const displayVehicles = realVehicles.length > 0 ? realVehicles.slice(0, 4) : MOCK_FEATURED_VEHICLES;

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 selection:bg-blue-600 selection:text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-16 sm:space-y-24">
        
        {/* ================================================== */}
        {/* 1. HERO SECTION & REDESIGNED SHOWROOM FINDER      */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Hero Card (8 Cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-gray-900/90 via-gray-950 to-[#0c1220] border border-gray-800/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glow Accents */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Badge */}
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
                  onClick={() => router.push('/vehicles')}
                  className="bg-white text-gray-950 hover:bg-gray-200 font-bold px-6 py-3 text-xs rounded-xl shadow-lg shadow-white/10"
                >
                  Explore Vehicles <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/services')}
                  className="bg-gray-900/80 border-gray-800 text-gray-200 hover:text-white hover:bg-gray-850 px-6 py-3 text-xs rounded-xl"
                >
                  <Wrench className="w-4 h-4 mr-2 text-blue-400" /> Book a Service
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/spare-parts')}
                  className="bg-gray-900/80 border-gray-800 text-gray-200 hover:text-white hover:bg-gray-850 px-5 py-3 text-xs rounded-xl hidden sm:inline-flex"
                >
                  <Package className="w-4 h-4 mr-2 text-emerald-400" /> Browse Parts
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

            {/* Automotive Hero Visual Banner */}
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

              {/* Floating Feature List Overlay */}
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
              </div>
            </div>
          </div>

          {/* Right Side: Redesigned Showroom Discovery Panel (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-gray-900/95 via-gray-900 to-gray-950 border border-gray-800/80 p-6 flex flex-col justify-between space-y-5 relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              {/* Header Badge & Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold">
                    LOCATION DISCOVERY
                  </span>
                  <Badge variant="info" className="text-[10px] py-0.5 px-2">
                    {showrooms.length > 0 ? `${showrooms.length} Showrooms` : '12+ Verified'}
                  </Badge>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Find the Best Showrooms <span className="text-blue-400">Near You</span>
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Compare vehicles, services and genuine spare parts from verified showrooms.
                </p>
              </div>

              {/* Location Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search city, area or showroom..."
                  value={showroomSearch}
                  onChange={(e) => setShowroomSearch(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {['All Cities', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 border ${
                      selectedCity === city
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/20'
                        : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Interactive Stylized Map Visual with Live Pins */}
              <div className="rounded-2xl border border-gray-800 bg-[#0a0f1d] p-4 relative h-56 flex flex-col justify-between overflow-hidden group">
                {/* Map Grid Pattern */}
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Simulated Map Roads/Lines */}
                <svg className="absolute inset-0 w-full h-full stroke-blue-500/10 fill-none" strokeWidth="1">
                  <path d="M 0,40 Q 100,80 200,30 T 400,100" />
                  <path d="M 50,200 Q 150,100 250,180 T 350,50" />
                </svg>

                {/* Map Status Header */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-mono text-blue-300 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Network Map</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">India Coverage</span>
                </div>

                {/* Map Location Pins */}
                <div className="relative z-10 flex items-center justify-around py-2">
                  <div className="flex flex-col items-center gap-1 group/pin cursor-pointer">
                    <div className="p-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 group-hover/pin:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono text-gray-300 bg-gray-950/80 px-1.5 py-0.5 rounded border border-gray-800">
                      Bangalore
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 group/pin cursor-pointer">
                    <div className="p-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 group-hover/pin:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono text-gray-300 bg-gray-950/80 px-1.5 py-0.5 rounded border border-gray-800">
                      Mumbai
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 group/pin cursor-pointer">
                    <div className="p-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 group-hover/pin:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono text-gray-300 bg-gray-950/80 px-1.5 py-0.5 rounded border border-gray-800">
                      Delhi
                    </span>
                  </div>
                </div>

                {/* Showroom Preview Card Overlay */}
                <div className="relative z-10 p-3 rounded-xl bg-gray-900/95 border border-gray-800 backdrop-blur-md space-y-1.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate">
                          {topShowroom ? topShowroom.name : 'Apex Motors Hub'}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {topShowroom ? topShowroom.address : 'Indiranagar, Bangalore'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[10px] shrink-0">
                      <span className="font-bold text-amber-400 flex items-center justify-end gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> 4.9
                      </span>
                      <span className="text-emerald-400 font-medium block">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Primary CTA */}
            <div className="pt-2 relative z-10">
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/platform/showrooms')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                Browse Showrooms <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 2. CATEGORY DISCOVERY SECTION ("Explore MotoHub")  */}
        {/* ================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5" /> Quick Navigation
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Explore MotoHub</h2>
              <p className="text-xs sm:text-sm text-gray-400">Discover everything MotoHub has to offer for your vehicle needs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Vehicles */}
            <Link href="/vehicles" className="group">
              <div className="h-full rounded-2xl bg-gray-900/80 border border-gray-800/90 p-5 hover:border-blue-500/50 hover:bg-gray-900 transition-all duration-300 flex flex-col justify-between space-y-4 group-hover:shadow-xl group-hover:shadow-blue-500/5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Car className="w-6 h-6" />
                    </div>
                    <Badge variant="info" className="text-[10px]">Bikes & Cars</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Vehicles</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Explore available vehicles across multiple verified showrooms with dynamic specs.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:text-white transition-colors">
                  <span>Browse Vehicles</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 2: Spare Parts */}
            <Link href="/spare-parts" className="group">
              <div className="h-full rounded-2xl bg-gray-900/80 border border-gray-800/90 p-5 hover:border-emerald-500/50 hover:bg-gray-900 transition-all duration-300 flex flex-col justify-between space-y-4 group-hover:shadow-xl group-hover:shadow-emerald-500/5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Package className="w-6 h-6" />
                    </div>
                    <Badge variant="success" className="text-[10px]">100% Genuine</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">Spare Parts</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Find genuine/OEM replacement spare parts with real-time stock availability.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold group-hover:text-white transition-colors">
                  <span>Find Spare Parts</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 3: Services */}
            <Link href="/services" className="group">
              <div className="h-full rounded-2xl bg-gray-900/80 border border-gray-800/90 p-5 hover:border-sky-500/50 hover:bg-gray-900 transition-all duration-300 flex flex-col justify-between space-y-4 group-hover:shadow-xl group-hover:shadow-sky-500/5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <Badge variant="info" className="text-[10px]">Certified Techs</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">Services</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Book vehicle servicing, oil changes, detailing and repair appointments seamlessly.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-sky-400 font-semibold group-hover:text-white transition-colors">
                  <span>Book Services</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 4: Showrooms */}
            <Link href="/platform/showrooms" className="group">
              <div className="h-full rounded-2xl bg-gray-900/80 border border-gray-800/90 p-5 hover:border-amber-500/50 hover:bg-gray-900 transition-all duration-300 flex flex-col justify-between space-y-4 group-hover:shadow-xl group-hover:shadow-amber-500/5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Store className="w-6 h-6" />
                    </div>
                    <Badge variant="warning" className="text-[10px]">Verified Network</Badge>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Showrooms</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Discover authorized multi-brand showrooms and connect directly with local dealers.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold group-hover:text-white transition-colors">
                  <span>Discover Showrooms</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ================================================== */}
        {/* 3. FEATURED VEHICLES SECTION                      */}
        {/* ================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Hot Listings
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Featured Vehicles</h2>
              <p className="text-xs sm:text-sm text-gray-400">Explore top-rated bikes and cars available across verified showrooms</p>
            </div>
            <Link href="/vehicles" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0">
              View All Vehicles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayVehicles.map((vehicle: any) => (
              <div
                key={vehicle.id}
                className="rounded-2xl bg-gray-900/80 border border-gray-800/90 overflow-hidden hover:border-gray-700 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Vehicle Image */}
                  <div className="h-44 bg-gray-950 overflow-hidden relative">
                    <img
                      src={vehicle.image_url || (vehicle.type === 'BIKE' ? '/category_bikes.jpg' : '/category_cars.jpg')}
                      alt={vehicle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                    
                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <Badge variant={vehicle.type === 'BIKE' ? 'info' : 'success'} className="text-[10px] font-bold">
                        {vehicle.type}
                      </Badge>
                    </div>

                    {/* Showroom Badge */}
                    <div className="absolute bottom-2 left-3 text-[10px] font-medium text-gray-300 flex items-center gap-1">
                      <Store className="w-3 h-3 text-blue-400" />
                      <span>{vehicle.showroom_name || 'Verified Showroom'}</span>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{vehicle.brand}</span>
                        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {vehicle.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-amber-400 text-xs font-bold gap-0.5 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{vehicle.rating || '4.8'}</span>
                      </div>
                    </div>

                    {/* Specs Pill List */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800">
                        {vehicle.engine_cc} CC
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800">
                        {vehicle.year} Model
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gray-950 border border-gray-800">
                        {vehicle.color || 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Action */}
                <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-800/50 mt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Ex-Showroom Price</span>
                    <span className="font-black text-white text-sm">
                      ₹{Number(vehicle.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/vehicles')}
                    className="text-xs bg-gray-950 border-gray-800 text-blue-400 hover:text-white hover:bg-blue-600 rounded-xl"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================== */}
        {/* 4. POPULAR SPARE PARTS DISCOVERY                  */}
        {/* ================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                <Package className="w-3.5 h-3.5" /> Genuine Catalog
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Popular Spare Parts</h2>
              <p className="text-xs sm:text-sm text-gray-400">Genuine OEM parts and replacement accessories for bikes & cars</p>
            </div>
            <Link href="/spare-parts" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0">
              Browse Spare Parts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Category 1 */}
            <Link href="/spare-parts" className="group">
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 text-center hover:border-emerald-500/40 hover:bg-gray-900 transition-all flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Disc className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">Brake Parts</h4>
                <span className="text-[10px] text-gray-400">Pads, Rotors & Fluids</span>
              </div>
            </Link>

            {/* Category 2 */}
            <Link href="/spare-parts" className="group">
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 text-center hover:border-emerald-500/40 hover:bg-gray-900 transition-all flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">Engine Parts</h4>
                <span className="text-[10px] text-gray-400">Pistons & Spark Plugs</span>
              </div>
            </Link>

            {/* Category 3 */}
            <Link href="/spare-parts" className="group">
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 text-center hover:border-emerald-500/40 hover:bg-gray-900 transition-all flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Filter className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">Filters</h4>
                <span className="text-[10px] text-gray-400">Air, Oil & Cabin</span>
              </div>
            </Link>

            {/* Category 4 */}
            <Link href="/spare-parts" className="group">
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 text-center hover:border-emerald-500/40 hover:bg-gray-900 transition-all flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <Battery className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-sky-400 transition-colors">Batteries</h4>
                <span className="text-[10px] text-gray-400">12V Long-Life Units</span>
              </div>
            </Link>

            {/* Category 5 */}
            <Link href="/spare-parts" className="group">
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 text-center hover:border-emerald-500/40 hover:bg-gray-900 transition-all flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-purple-400 transition-colors">Tyres & Wheels</h4>
                <span className="text-[10px] text-gray-400">Tubeless Radial Tyres</span>
              </div>
            </Link>

            {/* Category 6 */}
            <Link href="/spare-parts" className="group">
              <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800/90 text-center hover:border-emerald-500/40 hover:bg-gray-900 transition-all flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-xs group-hover:text-rose-400 transition-colors">Accessories</h4>
                <span className="text-[10px] text-gray-400">Helmets, Covers & LED</span>
              </div>
            </Link>
          </div>
        </div>

        {/* ================================================== */}
        {/* 5. VEHICLE SERVICES SECTION                       */}
        {/* ================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider mb-1">
                <Wrench className="w-3.5 h-3.5" /> Maintenance & Care
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Vehicle Services</h2>
              <p className="text-xs sm:text-sm text-gray-400">Professional servicing and repair options by certified showroom technicians</p>
            </div>
            <Link href="/services" className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0">
              Book a Service <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Service 1 */}
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-sky-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <Badge variant="info" className="text-[10px]">Popular</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-sky-400 transition-colors">General Servicing</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Full 30-point vehicle checkup, engine oil renewal, brake inspection & foam wash.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/services')}
                className="w-full text-xs text-sky-300 border-gray-800 hover:bg-sky-500/10 rounded-xl"
              >
                Book General Service <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Service 2 */}
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Disc className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral" className="text-[10px]">Express</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">Oil & Filter Change</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Synthetic oil replacement, filter cleaning, fluid top-up & lubrications.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/services')}
                className="w-full text-xs text-blue-300 border-gray-800 hover:bg-blue-500/10 rounded-xl"
              >
                Book Oil Change <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Service 3 */}
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <Badge variant="success" className="text-[10px]">Recommended</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">Tyre & Wheel Care</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Wheel alignment, balancing, tyre rotation & tubeless puncture repair.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/services')}
                className="w-full text-xs text-emerald-300 border-gray-800 hover:bg-emerald-500/10 rounded-xl"
              >
                Book Tyre Service <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Service 4 */}
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Battery className="w-5 h-5" />
                  </div>
                  <Badge variant="warning" className="text-[10px]">Essential</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Battery & Electrical</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Full battery voltage test, charging inspection & replacement fitting.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/services')}
                className="w-full text-xs text-amber-300 border-gray-800 hover:bg-amber-500/10 rounded-xl"
              >
                Book Battery Check <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Service 5 */}
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral" className="text-[10px]">Expert Care</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors">Engine & Mechanical Repair</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Comprehensive engine diagnostics, transmission, clutch & suspension overhaul.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/services')}
                className="w-full text-xs text-rose-300 border-gray-800 hover:bg-rose-500/10 rounded-xl"
              >
                Book Major Repair <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {/* Service 6 */}
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800/90 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <Badge variant="info" className="text-[10px]">Premium</Badge>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">Detailing & Spa</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Foam wash, ceramic coating, paint polishing & interior deep cleaning.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/services')}
                className="w-full text-xs text-purple-300 border-gray-800 hover:bg-purple-500/10 rounded-xl"
              >
                Book Auto Spa <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 6. HOW MOTOHUB WORKS (4-STEP SECTION)             */}
        {/* ================================================== */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" /> Simple Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">How MotoHub Works</h2>
            <p className="text-xs sm:text-sm text-gray-400">Simple 4-step process to buy, service, and maintain your vehicle</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Step 01 */}
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800/90 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-blue-500/40 font-mono">01</span>
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Discover</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Find vehicles, parts, services and showrooms tailored to your location.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800/90 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-indigo-500/40 font-mono">02</span>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Filter className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Compare</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Compare specifications, prices, availability and verified customer reviews.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800/90 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-emerald-500/40 font-mono">03</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Store className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Connect</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Connect with the showroom admin or certified service technician directly.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-2xl bg-gray-900/80 border border-gray-800/90 relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-amber-500/40 font-mono">04</span>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Buy or Service</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Complete your purchase or service booking with real-time status tracking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 7. TRUST / SHOWROOM NETWORK SECTION                */}
        {/* ================================================== */}
        <div className="rounded-3xl bg-gray-900/80 border border-gray-800/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Nationwide Network
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Trusted Showroom Network</h2>
              <p className="text-xs sm:text-sm text-gray-400">Partnering with leading multi-brand dealerships and certified service centers across India</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" className="py-1 px-3 text-xs font-mono">
                100+ Authorized Showrooms
              </Badge>
            </div>
          </div>

          {/* City Coverage Badges */}
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Active City Hubs</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Chandigarh'].map((city) => (
                <div
                  key={city}
                  className="px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 flex items-center gap-2 hover:border-blue-500/40 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-xs">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 8. ROLE EXPERIENCE WORKFLOWS (PRESERVED & POLISHED) */}
        {/* ================================================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">Role-Based Product Workflows</h2>
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
                <Button variant="outline" size="sm" className="w-full text-xs text-purple-300 border-gray-800 hover:bg-purple-500/10 rounded-xl">
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
                <Button variant="outline" size="sm" className="w-full text-xs text-emerald-300 border-gray-800 hover:bg-emerald-500/10 rounded-xl">
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
                <Button variant="outline" size="sm" className="w-full text-xs text-amber-300 border-gray-800 hover:bg-amber-500/10 rounded-xl">
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
                <Button variant="outline" size="sm" className="w-full text-xs text-sky-300 border-gray-800 hover:bg-sky-500/10 rounded-xl">
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
                <Button variant="outline" size="sm" className="w-full text-xs text-pink-300 border-gray-800 hover:bg-pink-500/10 rounded-xl">
                  View Workflow <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* 9. CUSTOMER TESTIMONIALS & FINAL CTA BANNER       */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Testimonials (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-gray-900/80 border border-gray-800/80 p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">What Our Customers Say</h2>
                <p className="text-xs text-gray-400">Verified feedback from vehicle owners across India</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Final Call to Action Banner (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
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
