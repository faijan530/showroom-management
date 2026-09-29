'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PublicPageContainer } from '@/components/public/public-page-container';
import { PublicPageHeader } from '@/components/public/public-page-header';
import { ShowroomCard } from '@/components/public/showroom-card';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Building2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const { data, isLoading, isError, refetch } = useQuery<ShowroomsResponse>({
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
    <PublicPageContainer>
      {/* Header Banner */}
      <PublicPageHeader
        eyebrow="AUTHORIZED DEALERSHIP NETWORK"
        title="Find Authorized Showrooms"
        description="Discover certified sales & service centers, check dealership inventory, and connect directly with showroom managers."
        stats={[
          { label: 'Authorized Dealerships', value: `${showrooms.length}+` },
          { label: 'Network Coverage', value: 'PAN India' },
          { label: 'Service Quality', value: '4.9/5 Rated' },
        ]}
      />

      {/* Search Bar Panel */}
      <Card glass className="border-gray-800/80 bg-gray-900/60 backdrop-blur-xl">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
            <Input
              placeholder="Search by showroom name, code, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-950/80 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Showing <span className="font-bold text-white">{filtered.length}</span> verified dealerships
          </p>
        </CardContent>
      </Card>

      {/* Grid / Skeletons / Error / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="h-80 rounded-2xl bg-gray-900/50 border border-gray-800/60 animate-pulse p-4 space-y-4">
              <div className="h-40 bg-gray-800/60 rounded-xl" />
              <div className="h-4 bg-gray-800/80 rounded w-3/4" />
              <div className="h-4 bg-gray-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card glass className="p-12 text-center space-y-4 border-rose-500/20 bg-rose-950/10">
          <Building2 className="w-12 h-12 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Unable to Load Showrooms</h3>
            <p className="text-xs text-gray-400">There was an issue fetching the showroom network directory.</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-rose-500/30 text-rose-300 hover:bg-rose-950">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Connection
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card glass className="p-12 text-center space-y-4 border-gray-800 bg-gray-900/40">
          <Building2 className="w-12 h-12 text-gray-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Showrooms Found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search criteria or location keywords.</p>
          </div>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} variant="outline" className="text-xs border-gray-800">
              Clear Search Query
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((showroom) => (
            <ShowroomCard
              key={showroom.id}
              id={showroom.id}
              name={showroom.name}
              code={showroom.code}
              address={showroom.address}
              contactPhone={showroom.contactPhone}
              contactEmail={showroom.contactEmail}
            />
          ))}
        </div>
      )}
    </PublicPageContainer>
  );
}

