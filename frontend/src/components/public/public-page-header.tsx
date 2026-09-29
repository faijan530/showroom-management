import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="relative rounded-3xl bg-gradient-to-br from-gray-900/95 via-gray-950 to-[#0b101d] border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] space-y-5 animate-fade-up">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top subtle light ray */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400 shadow-sm shadow-blue-500/10 animate-float">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>{eyebrow}</span>
            <Sparkles className="w-3 h-3 text-cyan-400 ml-0.5" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-50 to-indigo-200 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
            {description}
          </p>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-400 font-medium relative z-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-sm backdrop-blur-md">
              <span className="font-extrabold text-white text-sm tracking-tight">{stat.value}</span>
              <span className="text-gray-400 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


