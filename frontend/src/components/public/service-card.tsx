'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Clock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ServiceCardProps {
  id: string;
  title: string;
  vehicle_type: string;
  price: number;
  duration: string;
  features: string[];
  description: string;
  onBookClick: (title: string) => void;
}

export function ServiceCard({
  title,
  price,
  duration,
  features,
  description,
  onBookClick,
}: ServiceCardProps) {
  // Select high-quality service image depending on title keywords
  const lowerTitle = title.toLowerCase();
  const imageSrc = lowerTitle.includes('oil') || lowerTitle.includes('synthetic')
    ? '/category_engine.jpg'
    : lowerTitle.includes('brake')
    ? '/category_brakes.jpg'
    : '/hero_showroom.jpg';

  return (
    <Card glass className="flex flex-col justify-between hover:border-blue-500/50 transition-all duration-300 group overflow-hidden shadow-xl hover:shadow-blue-500/10">
      <div>
        {/* Card Image Banner */}
        <div className="h-48 bg-gradient-to-br from-gray-900 via-gray-950 to-[#0b101c] border-b border-gray-800/80 flex items-center justify-center p-3 relative overflow-hidden">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="info" className="shadow-lg backdrop-blur-md text-[10px]">
              Bikes & Cars
            </Badge>
          </div>

          <div className="absolute top-3 right-3">
            <Badge variant="success" className="shadow-lg backdrop-blur-md text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 mr-1" /> 50-Point Checked
            </Badge>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base group-hover:text-blue-300 transition-colors drop-shadow-md line-clamp-1">
              {title}
            </h3>
            <span className="text-xs font-mono font-semibold text-blue-300 bg-gray-950/80 border border-blue-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 backdrop-blur-md">
              <Clock className="w-3 h-3 text-blue-400" /> {duration}
            </span>
          </div>
        </div>

        {/* Content & Deliverables */}
        <CardContent className="space-y-4 pt-4 p-5">
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
            {description}
          </p>

          <div className="p-3.5 rounded-xl bg-gray-900/90 border border-gray-850 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Fixed Package Rate</span>
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              ₹{price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Included Deliverables:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="line-clamp-1">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </div>

      {/* Action CTA */}
      <div className="p-5 pt-0">
        <Button
          variant="primary"
          onClick={() => onBookClick(title)}
          className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 transition-all"
        >
          Book This Package <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>
    </Card>
  );
}
