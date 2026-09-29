'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Store } from 'lucide-react';

export interface SparePartCardProps {
  id: string;
  part_name: string;
  part_code: string;
  category: string;
  vehicle_type: 'BIKE' | 'CAR' | 'BOTH';
  price: number;
  stock_quantity: number;
  showroom_name?: string;
  image_url?: string | null;
}

export function SparePartCard({
  id,
  part_name,
  part_code,
  category,
  vehicle_type,
  price,
  stock_quantity,
  showroom_name,
  image_url,
}: SparePartCardProps) {
  // Select high-quality fallback image according to category
  const lowerCat = category.toLowerCase();
  const imageSrc =
    image_url && image_url.trim().length > 0
      ? image_url
      : lowerCat.includes('brake')
      ? '/category_brakes.jpg'
      : '/category_engine.jpg';

  return (
    <Card glass className="flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group overflow-hidden shadow-xl hover:shadow-blue-500/10">
      <div>
        {/* Card Image Banner */}
        <div className="h-44 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0b101c] border-b border-gray-800/80 flex items-center justify-center p-3 relative overflow-hidden">
          <img
            src={imageSrc}
            alt={part_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-3 left-3">
            <Badge variant="info" className="shadow-lg backdrop-blur-md text-[10px]">
              {category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              variant={stock_quantity > 0 ? 'success' : 'error'}
              className="shadow-lg backdrop-blur-md text-[10px]"
            >
              {stock_quantity > 0 ? `${stock_quantity} In Stock` : 'Out of Stock'}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <CardContent className="space-y-3 pt-4 p-5">
          <div>
            <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">
              {part_name}
            </h3>
            <p className="text-xs font-mono text-gray-400 mt-1 flex items-center gap-1.5">
              <span>OEM Code:</span>
              <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                {part_code}
              </code>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-850 flex items-center justify-between text-xs">
            <span className="text-gray-400">Compatibility: <strong className="text-gray-200">{vehicle_type}</strong></span>
            {showroom_name && (
              <span className="text-gray-400 flex items-center gap-1 text-[11px] truncate max-w-[130px]">
                <Store className="w-3 h-3 text-emerald-400 shrink-0" /> {showroom_name}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400 font-medium">Unit Price</span>
            <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
              ₹{price.toLocaleString('en-IN')}
            </span>
          </div>
        </CardContent>
      </div>

      {/* Action CTA */}
      <div className="p-5 pt-0">
        <Link href={`/spare-parts/${id}`}>
          <Button variant="outline" className="w-full text-xs font-bold bg-gray-900/90 border-gray-800 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all">
            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Details & Availability
          </Button>
        </Link>
      </div>
    </Card>
  );
}
