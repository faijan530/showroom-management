'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Phone, Mail, ArrowLeft, MessageSquare, Wrench, ShieldCheck, Star } from 'lucide-react';

interface ShowroomDetailResponse {
  success: boolean;
  data: {
    showroom: {
      id: string;
      name: string;
      code: string;
      address: string;
      contactPhone: string;
      contactEmail: string;
      status: string;
      createdAt: string;
    };
  };
}

export default function ShowroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const id = params?.id as string;

  const { data, isLoading, isError } = useQuery<ShowroomDetailResponse>({
    queryKey: ['public-showroom-detail', id],
    queryFn: () => apiClient<ShowroomDetailResponse>(`/superadmin/showrooms/${id}`),
    enabled: !!id,
  });

  const showroom = data?.data?.showroom;

  const handleProtectedAction = (targetPath: string) => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(targetPath)}`);
    } else {
      router.push(targetPath);
    }
  };

  if (isLoading) {
    return (
      <PublicPageContainer>
        <div className="h-96 rounded-3xl bg-gray-900/50 border border-gray-800 animate-pulse p-8 flex items-center justify-center text-gray-400">
          Loading showroom profile...
        </div>
      </PublicPageContainer>
    );
  }

  if (isError || !showroom) {
    return (
      <PublicPageContainer>
        <Card glass className="p-12 text-center border-gray-800 bg-gray-900/40 space-y-4">
          <p className="text-gray-400 text-sm">The requested showroom could not be found in our network.</p>
          <Button variant="outline" onClick={() => router.push('/showrooms')} className="border-gray-800 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Showroom Directory
          </Button>
        </Card>
      </PublicPageContainer>
    );
  }

  const enquiryPath = `/customer/enquiries/new?targetShowroomId=${showroom.id}`;
  const serviceBookingPath = `/customer/services/request?targetShowroomId=${showroom.id}`;

  return (
    <PublicPageContainer>
      {/* Back Button */}
      <div>
        <Button variant="outline" size="sm" onClick={() => router.back()} className="border-gray-800 text-xs bg-gray-900/80">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Showrooms
        </Button>
      </div>

      {/* Showroom Header Showcase */}
      <Card glass className="overflow-hidden border-gray-800/80 bg-gray-900/40 shadow-2xl relative">
        <div className="h-64 sm:h-80 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0b101c] relative overflow-hidden flex items-center justify-center">
          <img
            src="/hero_showroom.jpg"
            alt={showroom.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />

          <div className="absolute top-4 left-4">
            <Badge variant="success" className="shadow-lg backdrop-blur-md bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> VERIFIED AUTHORIZED SHOWROOM
            </Badge>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-black text-white">{showroom.name}</h1>
                <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full text-amber-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9
                </div>
              </div>
              <p className="text-xs text-gray-300 font-mono">Dealer Code: {showroom.code}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() => handleProtectedAction(enquiryPath)}
                className="font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" /> Direct Enquiry
              </Button>

              <Button
                variant="outline"
                onClick={() => handleProtectedAction(serviceBookingPath)}
                className="font-bold text-xs bg-gray-950 border-gray-800 hover:bg-gray-800 text-gray-200"
              >
                <Wrench className="w-4 h-4 mr-1.5" /> Book Service
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Showroom Details & Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card glass className="lg:col-span-2 border-gray-800/80 bg-gray-900/60">
          <CardHeader className="border-b border-gray-800/60 pb-4">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <Store className="w-4 h-4 text-blue-400" /> About Dealership & Facilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs text-gray-300">
            <p className="leading-relaxed">
              Welcome to <strong className="text-white">{showroom.name}</strong>. As an official authorized multi-brand dealership, we offer sales of original bikes & cars, authentic spare parts catalog, certified service bays, and instant customer enquiry handling.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-blue-400 font-bold block text-sm">Automotive Sales</span>
                <span className="text-gray-400 text-xs">New Vehicles, Bikes & Cars Catalog</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-emerald-400 font-bold block text-sm">Genuine Spare Parts</span>
                <span className="text-gray-400 text-xs">Original OEM Components & Accessories</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-indigo-400 font-bold block text-sm">Certified Service Center</span>
                <span className="text-gray-400 text-xs">Periodic Maintenance & Repair Jobs</span>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 space-y-1">
                <span className="text-amber-400 font-bold block text-sm">Verified Support</span>
                <span className="text-gray-400 text-xs">Fast Response & Customer Care</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Sidebar Card */}
        <Card glass className="border-gray-800/80 bg-gray-900/60">
          <CardHeader className="border-b border-gray-800/60 pb-4">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-emerald-400" /> Location & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-2">
              <p className="text-gray-300 leading-relaxed font-medium">{showroom.address}</p>
              <div className="pt-2 border-t border-gray-800 space-y-2 font-mono text-gray-300">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> {showroom.contactPhone}
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {showroom.contactEmail}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPageContainer>
  );
}
