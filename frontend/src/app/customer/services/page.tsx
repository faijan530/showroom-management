'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Wrench, CheckCircle2, Clock, IndianRupee, ArrowRight, ShieldCheck, Sparkles, MessageSquare, Package } from 'lucide-react';

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
  const { data, isLoading } = useQuery<ServicesResponse>({
    queryKey: ['customer-service-catalog'],
    queryFn: () => apiClient<ServicesResponse>('/customer/services'),
  });

  const services = data?.data?.services || [];

  return (
    <PageWrapper
      title="Browse Vehicle Servicing Packages & Showroom Enquiries"
      description="Select from our certified showroom maintenance packages or ask showrooms about spare part availability."
    >
      <div className="space-y-6">
        {/* Banner Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Authorized Showroom Care
            </div>
            <h2 className="text-xl font-bold text-white">Certified Technicians & Genuine Parts Guaranteed</h2>
            <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
              Every service includes a 50-point digital inspection report, genuine OEM spare parts, and transparent pricing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/customer/enquiries/new">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-gray-900/80 border-gray-700 text-gray-200 hover:text-white">
                <MessageSquare className="w-4 h-4 mr-2 text-amber-400" /> Ask Question / Part Stock
              </Button>
            </Link>
            <Link href="/customer/services/request">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-600/30">
                Book Service <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Inquiry Banner */}
        <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200">Looking for specific Spare Parts or Vehicle Availability?</p>
              <p className="text-[11px] text-gray-400">Send an inquiry directly to showroom managers to confirm stock and delivery dates.</p>
            </div>
          </div>
          <Link href="/customer/enquiries/new">
            <Button variant="secondary" className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Submit Stock Inquiry
            </Button>
          </Link>
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
              <Card glass key={service.id} className="flex flex-col justify-between hover:border-gray-700 transition-all">
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
                  <CardDescription className="text-xs text-gray-400">{service.description}</CardDescription>
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
                    <Link href={`/customer/services/request?service_title=${encodeURIComponent(service.title)}`}>
                      <Button variant="primary" className="w-full">
                        Book This Package
                      </Button>
                    </Link>
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
