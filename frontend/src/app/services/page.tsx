'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Wrench, Clock, ArrowRight, Sparkles, MessageSquare, CheckCircle2, RefreshCw, PackageX } from 'lucide-react';

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
        eyebrow="AUTHORIZED SERVICE NETWORK"
        title="Vehicle Servicing & Maintenance"
        description="Compare certified showroom servicing packages, 50-point inspection guarantees, and transparent fixed pricing."
        stats={[
          { label: 'Inspection Protocol', value: '50-Point Digital' },
          { label: 'Parts Guarantee', value: '100% Genuine OEM' },
          { label: 'Pricing Model', value: 'Upfront & Fixed' },
        ]}
      />

      {/* Hero Service Promo Banner */}
      <Card glass className="p-6 sm:p-8 border-blue-500/30 bg-gradient-to-r from-blue-950/80 via-indigo-950/70 to-gray-950/90 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Authorized Showroom Workshop Guarantee
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Certified Technicians & OEM Parts</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every service package includes digital health reporting, authentic manufacturer parts, and transparent labor pricing across all authorized dealer workshops.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={handleEnquiryClick}
              className="w-full sm:w-auto bg-gray-900 border-gray-800 text-gray-200 hover:text-white text-xs"
            >
              <MessageSquare className="w-4 h-4 mr-1.5 text-amber-400" /> Availability Enquiry
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleBookClick('General Servicing')}
              className="w-full sm:w-auto text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
            >
              Book Service Appointment <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card glass key={service.id} className="flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group overflow-hidden shadow-xl">
              <CardHeader className="border-b border-gray-800/60 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="info">Bikes & Cars</Badge>
                  <span className="text-xs text-gray-400 font-mono flex items-center gap-1 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
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
                  <span className="text-xs font-semibold text-gray-400">Fixed Service Rate</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    ₹{service.price.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Included Checklist */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Package Deliverables:</p>
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
                  <Button
                    variant="primary"
                    onClick={() => handleBookClick(service.title)}
                    className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                  >
                    Book This Service Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PublicPageContainer>
  );
}

