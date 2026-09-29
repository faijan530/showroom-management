'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Store, MapPin, Phone, Mail, Search, Star, MessageSquare, Wrench } from 'lucide-react';

interface ShowroomsResponse {
  success: boolean;
  data: {
    showrooms: Array<{
      id: string;
      name: string;
      code: string;
      address: string;
      contactPhone: string;
      contactEmail: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export default function ShowroomsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<ShowroomsResponse>({
    queryKey: ['public-showrooms-directory'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  const showrooms = data?.data?.showrooms || [];

  const filtered = showrooms.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper
      title="Authorized Showroom Directory"
      description="Find certified dealerships, compare ratings, and connect with showroom managers across India."
    >
      <div className="space-y-6">
        {/* Search */}
        <Card glass>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <Input
                placeholder="Search showroom name, code or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Showrooms Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading authorized showroom directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-gray-900 rounded-2xl border border-gray-800 text-gray-400">
            No active showrooms match your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((showroom) => (
              <Card key={showroom.id} glass className="flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{showroom.name}</CardTitle>
                        <CardDescription className="font-mono text-[10px]">Code: {showroom.code}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="success">ACTIVE</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1.5">
                    <p className="text-gray-300 flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                      <span>{showroom.address}</span>
                    </p>
                    <div className="flex items-center gap-4 text-gray-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" /> {showroom.contactPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-blue-400" /> {showroom.contactEmail}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link href={`/customer/enquiries/new?targetShowroomId=${showroom.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Enquiry
                      </Button>
                    </Link>
                    <Link href={`/customer/services/request?targetShowroomId=${showroom.id}`}>
                      <Button variant="primary" size="sm" className="w-full text-xs">
                        <Wrench className="w-3.5 h-3.5 mr-1" /> Service
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
