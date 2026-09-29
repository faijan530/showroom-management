import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, isPositive = true, icon: Icon, iconColor = 'text-blue-400' }: StatCardProps) {
  return (
    <Card glass className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
          <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
          {change && (
            <p className={cn('text-xs font-medium mt-1', isPositive ? 'text-emerald-400' : 'text-rose-400')}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-gray-900 border border-gray-800', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
