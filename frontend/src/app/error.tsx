'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertOctagon className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-black text-white">System Error Occurred</h1>
      <p className="text-sm text-gray-400 max-w-md">
        {error.message || 'An unhandled application error occurred.'}
      </p>
      <Button variant="danger" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
