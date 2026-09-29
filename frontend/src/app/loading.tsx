import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="py-20 flex items-center justify-center">
      <LoadingSpinner
        variant="inline"
        size="lg"
        title="Loading Application..."
        message="Synchronizing with MotoHub authorized dealership platform..."
      />
    </div>
  );
}

