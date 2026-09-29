'use client';

import React from 'react';
import Link from 'next/link';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Wrench, CheckCircle2, Clock, ArrowRight, Sparkles, MessageSquare, Package, RefreshCw, PackageX } from 'lucide-react';

interface ServicePackage {
  id: string;
  title: string;
  vehicle_type: string;
  price: number;
  duration: string;
  features: string[];
  description: string;
}

interface ServicesResponse {
  success: boolean;
  data: { services: ServicePackage[] };
}

export default function CustomerServicesPage() {
  const { data, isLoading, isError, refetch } = useQuery<ServicesResponse>({
    queryKey: ['customer-service-catalog'],
    queryFn: () => apiClient<ServicesResponse>('/customer/services'),
  });

  const services = data?.data?.services || [];

  return (
    <PublicPageContainer>
      {/* Header Banner */}
      <PublicPageHeader
        eyebrow="VEHICLE SERVICING MARKETPLACE"
        title="Showroom Servicing & Maintenance Packages"
        description="Select certified showroom maintenance packages, book appointment slots, or submit direct spare part and vehicle inquiries."
        stats={[
          { label: 'Inspection Protocol', value: '50-Point Digital Check' },
          { label: 'OEM Parts Guarantee', value: '100% Genuine' },
          { label: 'Showroom Network', value: 'Verified Dealers' },
        ]}
      />

      {/* Hero Service Promo Banner */}
      <Card glass className="p-6 sm:p-8 border-blue-500/30 bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-gray-950/90 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Authorized Showroom Care
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Certified Technicians & Genuine Parts</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every service includes a 50-point digital inspection report, authentic OEM spare parts, and transparent labor pricing across all partner showrooms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Link href="/customer/enquiries/new" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-xs bg-gray-900 border-gray-800 text-gray-200 hover:text-white">
                <MessageSquare className="w-4 h-4 mr-1.5 text-amber-400" /> Submit Inquiry
              </Button>
            </Link>
            <Link href="/customer/services/request" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                Book Service Appointment <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick Inquiry Banner */}
      <Card glass className="p-4 border-amber-500/20 bg-amber-950/10 backdrop-blur-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Looking for specific Spare Parts or Vehicle Availability?</p>
              <p className="text-[11px] text-gray-400">Send an inquiry directly to showroom managers to confirm stock and delivery dates.</p>
            </div>
          </div>
          <Link href="/customer/enquiries/new" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Submit Stock Inquiry
            </Button>
          </Link>
        </div>
      </Card>

      {/* Services Grid / Skeletons / Error / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="h-80 rounded-2xl bg-gray-900/50 border border-gray-800/60 animate-pulse p-6 space-y-4">
              <div className="h-6 bg-gray-800/80 rounded w-1/2" />
              <div className="h-4 bg-gray-800/60 rounded w-3/4" />
              <div className="h-12 bg-gray-800/40 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card glass className="p-12 text-center space-y-4 border-rose-500/20 bg-rose-950/10">
          <PackageX className="w-12 h-12 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Unable to Load Service Catalog</h3>
            <p className="text-xs text-gray-400">There was an issue retrieving service packages from the server.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-rose-500/30 text-rose-300 hover:bg-rose-950">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Connection
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card glass key={service.id} className="flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group overflow-hidden shadow-xl">
              <CardHeader className="border-b border-gray-800/60 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="info">Bikes & Cars</Badge>
                  <span className="text-xs text-gray-400 font-mono flex items-center gap-1 bg-gray-900 px-2.5 py-1 rounded-md border border-gray-800">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> {service.duration}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  <span>{service.title}</span>
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 leading-relaxed mt-1">{service.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 p-6">
                {/* Price Tag */}
                <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Fixed Package Price</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    ₹{service.price.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Included Checklist */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Included Features:</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    {service.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Link href={`/customer/services/request?service_title=${encodeURIComponent(service.title)}`}>
                    <Button variant="primary" className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30">
                      Book This Service Package
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PublicPageContainer>
  );
}

