'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bike, Car, Eye, Store } from 'lucide-react';

export interface VehicleCardProps {
  id: string;
  title: string;
  type: 'BIKE' | 'CAR';
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  engine_cc: number;
  stock_quantity: number;
  showroom_name?: string;
  image_url?: string | null;
}

export function VehicleCard({
  id,
  title,
  type,
  brand,
  model,
  year,
  price,
  color,
  engine_cc,
  stock_quantity,
  showroom_name,
  image_url,
}: VehicleCardProps) {
  // Determine high quality image source or fallback image
  const imageSrc =
    image_url && image_url.trim().length > 0
      ? image_url
      : type === 'BIKE'
      ? '/category_bikes.jpg'
      : '/category_cars.jpg';

  return (
    <Card glass className="flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group overflow-hidden shadow-xl hover:shadow-blue-500/10">
      <div>
        {/* Card Image Header */}
        <div className="h-52 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0b101c] border-b border-gray-800/80 flex items-center justify-center p-3 relative overflow-hidden">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-3 left-3">
            <Badge variant={type === 'BIKE' ? 'info' : 'neutral'} className="shadow-lg backdrop-blur-md">
              {type}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              variant={stock_quantity > 0 ? 'success' : 'error'}
              className="shadow-lg backdrop-blur-md"
            >
              {stock_quantity > 0 ? `${stock_quantity} In Stock` : 'Sold Out'}
            </Badge>
          </div>
        </div>

        {/* Card Details */}
        <CardContent className="space-y-3 pt-4 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">
                {title}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                {brand} • {model} ({year})
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-md shrink-0">
              {engine_cc} CC
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-850 flex items-center justify-between text-xs">
            <span className="text-gray-400">Color Variant: <strong className="text-gray-200 capitalize">{color}</strong></span>
            {showroom_name && (
              <span className="text-gray-400 flex items-center gap-1 text-[11px] truncate max-w-[130px]">
                <Store className="w-3 h-3 text-blue-400 shrink-0" /> {showroom_name}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400 font-medium">Ex-Showroom Price</span>
            <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
              ₹{price.toLocaleString('en-IN')}
            </span>
          </div>
        </CardContent>
      </div>

      {/* Card Action */}
      <div className="p-5 pt-0">
        <Link href={`/vehicles/${id}`}>
          <Button variant="outline" className="w-full text-xs font-bold bg-gray-900/90 border-gray-800 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all">
            <Eye className="w-3.5 h-3.5 mr-1.5" /> View Product Specifications
          </Button>
        </Link>
      </div>
    </Card>
  );
}
