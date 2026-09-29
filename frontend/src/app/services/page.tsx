'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Wrench, Clock, ArrowRight, Sparkles, MessageSquare, Package, CheckCircle2, ShieldCheck } from 'lucide-react';

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

  const { data, isLoading } = useQuery<ServicesResponse>({
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
    <PageWrapper
      title="Authorized Vehicle Servicing & Maintenance Marketplace"
      description="Compare certified showroom servicing packages, 50-point inspection guarantees, and fixed pricing."
    >
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-gray-900 border border-blue-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Authorized Showroom Workshop Network
            </div>
            <h2 className="text-2xl font-black text-white">Certified Technicians & Genuine Parts Guaranteed</h2>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              Every service package includes a 50-point digital inspection report, genuine OEM spare parts, and transparent fixed pricing across all partner showrooms.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleEnquiryClick}
              className="w-full sm:w-auto bg-gray-900 border-gray-700 text-gray-200 hover:text-white text-xs"
            >
              <MessageSquare className="w-4 h-4 mr-1.5 text-amber-400" /> Submit Availability Enquiry
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleBookClick('General Servicing')}
              className="w-full sm:w-auto text-xs font-bold"
            >
              Book Service Job <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 p-12 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
              <Wrench className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
              <p className="text-sm font-semibold text-gray-300">Loading service catalog...</p>
            </div>
          ) : (
            services.map((service) => (
              <Card glass key={service.id} className="flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="info">Bikes & Cars</Badge>
                    <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" /> {service.duration}
                    </span>
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-400" />
                    <span>{service.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400 leading-relaxed">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price */}
                  <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">Fixed Package Price</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">
                      ₹{service.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Included Features */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Included Features:</p>
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
                    <Button variant="primary" onClick={() => handleBookClick(service.title)} className="w-full text-xs font-bold">
                      Book This Service Package
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
