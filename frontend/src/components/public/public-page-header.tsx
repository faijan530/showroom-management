import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

interface PublicPageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string }>;
  action?: React.ReactNode;
}

export function PublicPageHeader({
  eyebrow = 'AUTHORIZED MARKETPLACE',
  title,
  description,
  stats,
  action,
}: PublicPageHeaderProps) {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-gray-900/90 via-gray-950 to-[#0c1220] border border-gray-800/80 p-6 sm:p-8 overflow-hidden shadow-2xl space-y-4">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="pt-4 border-t border-gray-800/80 flex flex-wrap items-center gap-6 text-xs text-gray-400 font-medium relative z-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-extrabold text-white">{stat.value}</span>
              <span className="text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
