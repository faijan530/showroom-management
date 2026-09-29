'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search, Eye } from 'lucide-react';

interface SparePartsResponse {
  success: boolean;
  data: {
    spare_parts: Array<{
      id: string;
      showroom_id: string;
      part_name: string;
      part_code: string;
      category: string;
      vehicle_type: 'BIKE' | 'CAR' | 'BOTH';
      price: number;
      stock_quantity: number;
      min_stock_alert: number;
      description?: string;
      image_url?: string;
    }>;
  };
}

export default function SparePartsCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<SparePartsResponse>({
    queryKey: ['public-spare-parts-catalog'],
    queryFn: () => apiClient<SparePartsResponse>('/spare-parts'),
  });

  const parts = data?.data?.spare_parts || [];

  const filtered = parts.filter(
    (p) =>
      p.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.part_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper
      title="Genuine Spare Parts Marketplace"
      description="Search original manufacturer spare parts across authorized showroom inventories."
    >
      <div className="space-y-6">
        {/* Search */}
        <Card glass>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="w-full md:w-96 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
              <Input
                placeholder="Search part name, OEM code or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Parts Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading spare parts catalog...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-gray-900 rounded-2xl border border-gray-800 text-gray-400">
            No spare parts match your search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((part) => (
              <Card key={part.id} glass className="flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="info">{part.category}</Badge>
                    <Badge variant={part.stock_quantity > 0 ? 'success' : 'error'}>
                      {part.stock_quantity > 0 ? `${part.stock_quantity} Units` : 'Out of Stock'}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">{part.part_name}</h4>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">Code: {part.part_code}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                    <span className="text-gray-400">{part.vehicle_type} Compatible</span>
                    <span className="font-bold text-emerald-400 text-base">₹{part.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link href={`/spare-parts/${part.id}`}>
                    <Button variant="outline" className="w-full text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> View Part & Order
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
