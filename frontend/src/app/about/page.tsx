'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Store, ShieldCheck, Users, Wrench, Package, ArrowRight, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <PageWrapper
      title="About MotoHub SaaS Platform"
      description="The Multi-Showroom Vehicle & Repair Servicing Marketplace Ecosystem."
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        <Card glass className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 text-white">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">MotoHub SaaS Ecosystem</h2>
              <p className="text-xs text-blue-400 font-mono">Enterprise Multi-Tenant Marketplace & Operational Suite</p>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            MotoHub is designed for vehicle dealerships (bikes & cars), genuine spare parts catalog distribution, and service workshop operations across India. It connects customers with authorized showrooms while giving dealership staff a multi-tenant operational management workspace.
          </p>
        </Card>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card glass className="p-4 space-y-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Verified Dealerships</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Multi-tenant architecture ensuring isolated showroom scoping, verified contact details, and ex-showroom price transparency.
            </p>
          </Card>

          <Card glass className="p-4 space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Service Tracking</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time service job status timeline stepper (`REQUESTED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `COMPLETED`) with technician remarks.
            </p>
          </Card>

          <Card glass className="p-4 space-y-2">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Spare Parts Control</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Genuine OEM parts catalog with vehicle compatibility search (BIKE/CAR/BOTH) and real-time inventory stock management.
            </p>
          </Card>
        </div>

        {/* CTA Card */}
        <Card glass className="p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Ready to Experience MotoHub?</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Join thousands of satisfied vehicle owners or onboard your dealership to streamline vehicle sales and workshop servicing.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/auth/register">
              <Button variant="primary" size="lg">
                Create Customer Account <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
}
