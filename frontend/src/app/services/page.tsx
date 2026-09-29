'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { ServiceCard } from '@/components/public/service-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ArrowRight, Sparkles, MessageSquare, RefreshCw, PackageX, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';

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

export default function ServicesPublicMarketplacePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery<ServicesResponse>({
    queryKey: ['public-service-catalog'],
    queryFn: () => apiClient<ServicesResponse>('/customer/services'),
  });

  const services = data?.data?.services || [];

  const handleBookClick = (serviceTitle: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/customer/services/request?service_title=${encodeURIComponent(serviceTitle)}`)}`);
    } else {
      router.push(`/customer/services/request?service_title=${encodeURIComponent(serviceTitle)}`);
    }
  };

  const handleEnquiryClick = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/customer/enquiries/new')}`);
    } else {
      router.push('/customer/enquiries/new');
    }
  };

  return (
    <PublicPageContainer>
      {/* Header Banner */}
      <PublicPageHeader
        eyebrow="AUTHORIZED WORKSHOP NETWORK"
        title="Vehicle Servicing & Maintenance"
        description="Compare certified showroom servicing packages, 50-point inspection guarantees, and transparent upfront pricing."
        stats={[
          { label: 'Inspection Protocol', value: '50-Point Digital Check' },
          { label: 'OEM Parts Guarantee', value: '100% Original' },
          { label: 'Showroom Network', value: 'Verified Dealers' },
        ]}
      />

      {/* Hero Workshop Banner with Image Showcase */}
      <Card glass className="p-8 sm:p-10 border-blue-500/30 bg-gradient-to-br from-gray-900/90 via-gray-950 to-[#0b101c] shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AUTHORIZED WORKSHOP GUARANTEE</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Certified Technicians & <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Original OEM Parts</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Every maintenance package includes digital health reporting, authentic manufacturer spare parts, and transparent labor pricing across all authorized showroom workshop bays.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleBookClick('General Servicing')}
                className="w-full sm:w-auto text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
              >
                Book Service Appointment <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleEnquiryClick}
                className="w-full sm:w-auto bg-gray-900 border-gray-800 text-gray-200 hover:text-white text-xs font-bold"
              >
                <MessageSquare className="w-4 h-4 mr-1.5 text-amber-400" /> Availability Inquiry
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-gray-800/80 shadow-2xl h-64 sm:h-80 group">
            <img
              src="/category_brakes.jpg"
              alt="Certified Workshop Care"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-gray-950/80 border border-gray-800 backdrop-blur-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">50-Point Digital Inspection</span>
              </div>
              <span className="text-emerald-400 font-bold font-mono">100% Verified</span>
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              title={service.title}
              vehicle_type={service.vehicle_type}
              price={service.price}
              duration={service.duration}
              features={service.features}
              description={service.description}
              onBookClick={handleBookClick}
            />
          ))}
        </div>
      )}
    </PublicPageContainer>
  );
}


