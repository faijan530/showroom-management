'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export interface LoadingSpinnerProps {
  title?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'inline' | 'card' | 'fullscreen';
  className?: string;
}

export function LoadingSpinner({
  title = 'Loading Marketplace Data...',
  message = 'Connecting to authorized showroom network...',
  size = 'md',
  variant = 'card',
  className = '',
}: LoadingSpinnerProps) {
  const spinnerSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const innerDotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const spinnerGraphic = (
    <div className="relative flex items-center justify-center">
      {/* Outer Rotating Glowing Ring */}
      <div
        className={`${spinnerSizes[size]} rounded-full border-2 border-transparent border-t-blue-500 border-r-cyan-400 border-b-indigo-500 animate-spin shadow-lg shadow-blue-500/20`}
      />

      {/* Inner Counter-Rotating Pulse Ring */}
      <div
        className={`absolute ${spinnerSizes[size]} scale-75 rounded-full border-2 border-transparent border-t-cyan-400 border-l-blue-600 animate-[spin_1.5s_linear_infinite_reverse] opacity-70`}
      />

      {/* Center Glowing Dot */}
      <div
        className={`absolute ${innerDotSizes[size]} bg-cyan-400 rounded-full animate-ping opacity-75 shadow-lg shadow-cyan-400`}
      />
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center text-center space-y-3 p-6 animate-fade-up">
      {spinnerGraphic}

      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>{title}</span>
        </h4>
        {message && <p className="text-xs text-gray-400 font-medium max-w-xs">{message}</p>}
      </div>
    </div>
  );

  if (variant === 'fullscreen') {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-md ${className}`}>
        <Card glass className="p-8 border-gray-800 bg-gray-900/90 shadow-2xl max-w-sm w-full mx-4">
          {content}
        </Card>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card glass className={`p-12 border-gray-800 bg-gray-900/60 shadow-xl ${className}`}>
        {content}
      </Card>
    );
  }

  return <div className={`py-6 ${className}`}>{content}</div>;
}
