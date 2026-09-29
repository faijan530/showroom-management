'use client';

import React from 'react';
import Link from 'next/link';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Store, Wrench, Package, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicPageContainer>
      {/* Header Banner */}
      <PublicPageHeader
        eyebrow="ABOUT THE PLATFORM"
        title="Automotive Marketplace & Multi-Showroom Network"
        description="Connecting vehicle buyers and owners with verified dealerships, genuine OEM spare parts, and certified service centers across India."
        stats={[
          { label: 'Platform Architecture', value: 'Multi-Tenant SaaS' },
          { label: 'Authorized Network', value: 'Verified Showrooms' },
          { label: 'Service Coverage', value: 'Bikes & Cars' },
        ]}
      />

      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Main Platform Mission Card */}
        <Card glass className="p-8 space-y-6 border-gray-800/80 bg-gray-900/60 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 text-white">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">MotoHub Automotive Ecosystem</h2>
              <p className="text-xs text-blue-400 font-mono mt-0.5">Unified Marketplace & Dealership Management Suite</p>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed relative z-10">
            MotoHub is designed to redefine how customers interact with multi-brand vehicle dealerships, purchase original spare parts, and schedule workshop maintenance. Our platform bridges the gap between digital discovery and real-world showroom service, bringing complete price transparency and status tracking to every transaction.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 relative z-10">
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transparent Ex-Showroom Pricing
              </div>
              <p className="text-xs text-gray-400">Clear breakdown of vehicle prices and genuine OEM spare part rates without hidden costs.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Wrench className="w-4 h-4 text-blue-400" /> Live Workshop Job Tracking
              </div>
              <p className="text-xs text-gray-400">Track service progress in real time from request booking to technician completion.</p>
            </div>
          </div>
        </Card>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glass className="p-6 space-y-3 border-gray-800/80 bg-gray-900/60 hover:border-blue-500/40 transition-all">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Verified Dealerships</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Multi-tenant architecture ensuring isolated showroom scoping, verified contact details, and ex-showroom price transparency.
            </p>
          </Card>

          <Card glass className="p-6 space-y-3 border-gray-800/80 bg-gray-900/60 hover:border-emerald-500/40 transition-all">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Service Tracking</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time service job status timeline stepper (<code className="text-emerald-400">REQUESTED</code> ➔ <code className="text-emerald-400">IN_PROGRESS</code> ➔ <code className="text-emerald-400">COMPLETED</code>) with technician remarks.
            </p>
          </Card>

          <Card glass className="p-6 space-y-3 border-gray-800/80 bg-gray-900/60 hover:border-amber-500/40 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Spare Parts Control</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Genuine OEM parts catalog with vehicle compatibility search (BIKE/CAR/BOTH) and real-time inventory stock management.
            </p>
          </Card>
        </div>

        {/* CTA Card */}
        <Card glass className="p-8 text-center space-y-4 border-blue-500/30 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0c1220] shadow-2xl">
          <h3 className="text-xl sm:text-2xl font-black text-white">Ready to Explore the Marketplace?</h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            Browse bikes, cars, OEM spare parts, and certified workshop packages across our verified dealership network.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
            <Link href="/vehicles" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                Explore Vehicles Marketplace <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-xs font-bold bg-gray-900 border-gray-800 text-gray-200">
                Create Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PublicPageContainer>
  );
}

