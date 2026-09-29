'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface HealthResponse {
  status: string;
  timestamp: string;
  services: { database: string };
}

export function HealthBadge() {
  const { data, isError } = useQuery<HealthResponse>({
    queryKey: ['system-health'],
    queryFn: () => apiClient<HealthResponse>('/health'),
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });

  const isHealthy = data?.status === 'ok' && !isError;
  const isDegraded = data?.status === 'degraded' || isError;

  return (
    <Badge
      variant={isHealthy ? 'success' : isDegraded ? 'error' : 'neutral'}
      className="flex items-center gap-1.5 py-1 px-3"
    >
      <Activity className="w-3.5 h-3.5" />
      <span>{isHealthy ? 'System Operational' : isDegraded ? 'System Degraded' : 'Checking Health...'}</span>
    </Badge>
  );
}
