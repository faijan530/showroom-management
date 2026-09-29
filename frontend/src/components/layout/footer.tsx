'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Store, Wrench, Package, Bike, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800/80 bg-gray-950/90 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">MotoHub SaaS</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Multi-Showroom Vehicle Marketplace & Operational SaaS Platform. Buy, service, and maintain vehicles across verified showrooms.
            </p>
          </div>

          {/* Column 2: Product & Marketplace Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Product Catalog</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/vehicles" className="hover:text-white transition-colors">
                  Vehicles Catalog (Bikes & Cars)
                </Link>
              </li>
              <li>
                <Link href="/spare-parts" className="hover:text-white transition-colors">
                  Genuine Spare Parts
                </Link>
              </li>
              <li>
                <Link href="/customer/services" className="hover:text-white transition-colors">
                  Service Packages & Maintenance
                </Link>
              </li>
              <li>
                <Link href="/showrooms" className="hover:text-white transition-colors">
                  Showroom Network Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Company & Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About MotoHub Platform
                </Link>
              </li>
              <li>
                <Link href="/customer/feedback" className="hover:text-white transition-colors">
                  Verified Customer Reviews
                </Link>
              </li>
              <li>
                <Link href="/platform/showrooms" className="hover:text-white transition-colors">
                  Partner Dealership Onboarding
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Account & Portals */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Portals & Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Customer & Staff Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Register New Customer Account
                </Link>
              </li>
              <li>
                <Link href="/platform/login" className="hover:text-white transition-colors">
                  SuperAdmin Control Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© 2026 MotoHub Multi-Showroom SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Showroom Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
