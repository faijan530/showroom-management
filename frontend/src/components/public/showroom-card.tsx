'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, MapPin, Phone, Mail, ArrowRight, ShieldCheck, Star } from 'lucide-react';

export interface ShowroomCardProps {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  rating?: number;
}

export function ShowroomCard({
  id,
  name,
  code,
  address,
  contactPhone,
  contactEmail,
  rating = 4.9,
}: ShowroomCardProps) {
  return (
    <Card glass className="flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group overflow-hidden shadow-xl hover:shadow-blue-500/10">
      <div>
        {/* Cover Header */}
        <div className="h-44 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0b101c] border-b border-gray-800/80 flex items-center justify-center p-3 relative overflow-hidden">
          <img
            src="/hero_showroom.jpg"
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-80" />

          {/* Badges & Rating */}
          <div className="absolute top-3 left-3">
            <Badge variant="success" className="shadow-lg backdrop-blur-md text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 mr-1" /> VERIFIED DEALER
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-gray-950/80 border border-amber-500/30 px-2 py-0.5 rounded-full text-amber-400 font-bold text-xs shadow-lg backdrop-blur-md">
            <Star className="w-3 h-3 fill-amber-400" /> {rating}
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/90 border border-blue-400/50 text-white shadow-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight group-hover:text-blue-300 transition-colors line-clamp-1">
                {name}
              </h3>
              <p className="text-[11px] font-mono text-gray-300 mt-0.5">Code: {code}</p>
            </div>
          </div>
        </div>

        {/* Showroom Details */}
        <CardContent className="space-y-3 pt-4 p-5 text-xs">
          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-850 space-y-2">
            <p className="text-gray-300 flex items-start gap-2 text-xs leading-snug">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>
            <div className="flex items-center justify-between text-gray-400 font-mono pt-2 border-t border-gray-800/60 text-[11px]">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> {contactPhone}
              </span>
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <Mail className="w-3 h-3 text-blue-400 shrink-0" /> {contactEmail}
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Showroom Action */}
      <div className="p-5 pt-0">
        <Link href={`/showrooms/${id}`}>
          <Button variant="outline" className="w-full text-xs font-bold bg-gray-900/90 border-gray-800 hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all">
            Explore Showroom Profile <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
