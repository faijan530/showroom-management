'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Wrench, Eye, Bike, Car, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

interface CustomerServiceRequest {
  id: string;
  showroom_name?: string;
  vehicle_type: 'BIKE' | 'CAR';
  vehicle_details: string;
  service_description: string;
  preferred_date?: string | null;
  time_slot?: string | null;
  assigned_worker_name?: string | null;
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

interface CustomerRequestsResponse {
  success: boolean;
  data: { service_requests: CustomerServiceRequest[] };
}

export default function CustomerServiceRequestsHistoryPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery<CustomerRequestsResponse>({
    queryKey: ['customer-my-service-requests', user?.id],
    queryFn: () => apiClient<CustomerRequestsResponse>('/customer/service-requests'),
  });

  const requests = data?.data?.service_requests || [];

  return (
    <PageWrapper
      title="My Service Bookings & Maintenance History"
      description="Track real-time repair status, view technician assignments, and inspect past service records."
      action={
        <Link href="/customer/services/request">
          <Button variant="primary">
            <Wrench className="w-4 h-4 mr-1.5" /> Book New Service
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Showroom & Vehicle</TableHead>
              <TableHead>Service Need</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Booked</TableHead>
              <TableHead>Track Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading your service requests...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  You have not submitted any service bookings yet. Click &quot;Book New Service&quot; to schedule an appointment.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {r.vehicle_type === 'BIKE' ? <Bike className="w-4 h-4 text-blue-400" /> : <Car className="w-4 h-4 text-indigo-400" />}
                      <span>{r.vehicle_details}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{r.showroom_name || 'Authorized Showroom'}</p>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-gray-200 line-clamp-2">{r.service_description}</p>
                  </TableCell>
                  <TableCell>
                    {r.assigned_worker_name ? (
                      <span className="text-xs font-bold text-emerald-400">{r.assigned_worker_name}</span>
                    ) : (
                      <span className="text-xs text-amber-400 italic font-semibold">Assigning Soon</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        r.status === 'COMPLETED'
                          ? 'success'
                          : r.status === 'IN_PROGRESS'
                          ? 'info'
                          : r.status === 'ASSIGNED'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 font-mono">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Link href={`/customer/services/requests/${r.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4 mr-1" /> Track Live
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageWrapper>
  );
}
