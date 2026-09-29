'use client';

import React from 'react';
import Link from 'next/link';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Store,
  Wrench,
  Package,
  ArrowRight,
  ShieldCheck,
  Building2,
  Bike,
  Car,
  Sparkles,
  CheckCircle2,
  Zap,
  Award,
  Users,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicPageContainer>
      {/* Header Banner */}
      <PublicPageHeader
        eyebrow="ABOUT MOTOHUB AUTOMOTIVE"
        title="India's Multi-Showroom Marketplace Ecosystem"
        description="Connecting vehicle buyers, owners, and dealerships through price transparency, genuine OEM spare parts, and certified workshop care."
        stats={[
          { label: 'Platform Architecture', value: 'Multi-Tenant SaaS' },
          { label: 'Authorized Network', value: 'Verified Dealerships' },
          { label: 'Service Coverage', value: 'Bikes & Cars' },
        ]}
      />

      <div className="space-y-12">
        {/* Main Platform Hero Showcase Card */}
        <Card glass className="p-8 sm:p-10 border-blue-500/30 bg-gradient-to-br from-gray-900/90 via-gray-950 to-[#0b101c] shadow-2xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>ENTERPRISE AUTOMOTIVE SAAS</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Redefining the Dealership <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Marketplace Experience</span>
              </h2>

              <p className="text-sm text-gray-300 leading-relaxed">
                MotoHub bridges the digital-to-showroom gap by providing a unified platform where customers can browse bikes and cars, order original manufacturer spare parts, and schedule workshop servicing—all with complete pricing transparency and real-time status tracking.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transparent Rates
                  </div>
                  <p className="text-xs text-gray-400">Ex-showroom pricing with zero hidden dealer markups.</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Wrench className="w-4 h-4 text-blue-400" /> Live Job Stepper
                  </div>
                  <p className="text-xs text-gray-400">Real-time status updates from service request to completion.</p>
                </div>
              </div>
            </div>

            {/* Showcase Image Banner */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-800/80 shadow-2xl h-80 sm:h-96 group">
              <img
                src="/hero_showroom.jpg"
                alt="Authorized Showroom Network"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-gray-950/80 border border-gray-800 backdrop-blur-md flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">Verified Dealership Infrastructure</span>
                </div>
                <Badge variant="success" className="text-[10px]">Active Network</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Metrics Counter Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Authorized Listings', value: '120+', icon: Bike, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Verified Dealerships', value: '25+', icon: Store, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Genuine OEM Parts', value: '100%', icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Inspection Protocol', value: '50-Point', icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          ].map((metric, idx) => (
            <Card key={idx} glass className="p-5 border-gray-800/80 bg-gray-900/50 hover:border-gray-700 transition-all flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color} shrink-0`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white font-mono">{metric.value}</p>
                <p className="text-xs text-gray-400 font-medium">{metric.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Feature Visual Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Core Marketplace Capabilities</h3>
            <p className="text-xs text-gray-400">Integrated vehicle sales, OEM parts catalog, and workshop service automation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Vehicles */}
            <Card glass className="flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group overflow-hidden shadow-xl">
              <div>
                <div className="h-44 bg-gradient-to-br from-gray-900 to-gray-950 border-b border-gray-800 relative overflow-hidden">
                  <img
                    src="/category_bikes.jpg"
                    alt="Vehicles Catalog"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="info" className="text-[10px]">Vehicles Catalog</Badge>
                  </div>
                </div>
                <CardContent className="p-5 space-y-2">
                  <h4 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">Bikes & Cars Marketplace</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Explore new vehicle listings with complete engine specs, color options, and ex-showroom price transparency across verified showrooms.
                  </p>
                </CardContent>
              </div>
              <div className="p-5 pt-0">
                <Link href="/vehicles">
                  <Button variant="outline" className="w-full text-xs font-bold bg-gray-900 border-gray-800 hover:bg-blue-600 hover:text-white">
                    Browse Vehicles <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Card 2: Spare Parts */}
            <Card glass className="flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 group overflow-hidden shadow-xl">
              <div>
                <div className="h-44 bg-gradient-to-br from-gray-900 to-gray-950 border-b border-gray-800 relative overflow-hidden">
                  <img
                    src="/category_engine.jpg"
                    alt="Genuine OEM Spare Parts"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="warning" className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/30">OEM Spare Parts</Badge>
                  </div>
                </div>
                <CardContent className="p-5 space-y-2">
                  <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">Genuine Parts & Accessories</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Order original replacement components with OEM part codes, compatibility verification (BIKE/CAR/BOTH), and live stock status.
                  </p>
                </CardContent>
              </div>
              <div className="p-5 pt-0">
                <Link href="/spare-parts">
                  <Button variant="outline" className="w-full text-xs font-bold bg-gray-900 border-gray-800 hover:bg-amber-600 hover:text-white">
                    Browse Spare Parts <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Card 3: Servicing */}
            <Card glass className="flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 group overflow-hidden shadow-xl">
              <div>
                <div className="h-44 bg-gradient-to-br from-gray-900 to-gray-950 border-b border-gray-800 relative overflow-hidden">
                  <img
                    src="/category_brakes.jpg"
                    alt="Workshop Servicing"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="success" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Certified Workshop</Badge>
                  </div>
                </div>
                <CardContent className="p-5 space-y-2">
                  <h4 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">Vehicle Servicing & Repair</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Book fixed-rate maintenance packages featuring 50-point inspection checklists, certified technicians, and real-time status tracking.
                  </p>
                </CardContent>
              </div>
              <div className="p-5 pt-0">
                <Link href="/services">
                  <Button variant="outline" className="w-full text-xs font-bold bg-gray-900 border-gray-800 hover:bg-emerald-600 hover:text-white">
                    Book Service Job <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Dynamic CTA Banner */}
        <Card glass className="p-8 sm:p-10 text-center space-y-6 border-blue-500/30 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0c1220] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Ready to Experience MotoHub?</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Join thousands of vehicle owners and authorized showrooms using India's premier multi-tenant automotive marketplace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10 pt-2">
            <Link href="/vehicles" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                Explore Vehicle Marketplace <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/showrooms" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-xs font-bold bg-gray-900 border-gray-800 text-gray-200 hover:text-white">
                Find Showroom Near You
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PublicPageContainer>
  );
}


