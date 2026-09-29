'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Wrench, CheckCircle2, Clock, UserCheck, Store, Bike, Car, ArrowLeft, FileText, Calendar } from 'lucide-react';

interface ServiceRequestDetail {
  id: string;
  showroom_id: string;
  showroom?: {
    id: string;
    name: string;
    code: string;
    address: string;
    contactPhone: string;
  };
  customer_name: string;
  customer_phone: string;
  vehicle_type: 'BIKE' | 'CAR';
  vehicle_details: string;
  service_description: string;
  preferred_date?: string | null;
  time_slot?: string | null;
  assigned_worker_name?: string | null;
  worker_approval: string;
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_notes?: string | null;
  status_updated_at: string;
  created_at: string;
}

interface RequestDetailResponse {
  success: boolean;
  data: { service_request: ServiceRequestDetail };
}

export default function CustomerServiceTrackerPage() {
  const params = useParams();
  const requestId = params?.id as string;

  const { data, isLoading } = useQuery<RequestDetailResponse>({
    queryKey: ['customer-service-request-detail', requestId],
    queryFn: () => apiClient<RequestDetailResponse>(`/customer/service-requests/${requestId}`),
    refetchInterval: 15000, // Live poll every 15s
  });

  const request = data?.data?.service_request;

  const getStepStatus = (stepName: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED') => {
    if (!request) return 'pending';
    const statusOrder = ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(request.status);
    const stepIndex = statusOrder.indexOf(stepName);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'pending';
  };

  return (
    <PageWrapper
      title="Live Vehicle Repair Status Tracker"
      description="Track real-time servicing progress, technician allocation, and inspection notes."
      action={
        <Link href="/customer/services/requests">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Bookings
          </Button>
        </Link>
      }
    >
      {isLoading || !request ? (
        <div className="p-12 text-center border border-dashed border-gray-800 rounded-2xl space-y-2">
          <Wrench className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
          <p className="text-sm font-semibold text-gray-300">Fetching live repair status...</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Status Timeline Card */}
          <Card glass>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant={request.status === 'COMPLETED' ? 'success' : 'info'}>
                  Current Status: {request.status}
                </Badge>
                <span className="text-xs text-gray-400 font-mono">
                  Ref ID: {request.id.slice(0, 8)}
                </span>
              </div>
              <CardTitle className="text-xl flex items-center gap-2 mt-2">
                {request.vehicle_type === 'BIKE' ? <Bike className="w-6 h-6 text-blue-400" /> : <Car className="w-6 h-6 text-indigo-400" />}
                <span>{request.vehicle_details}</span>
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Showroom: {request.showroom?.name} — {request.showroom?.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stepper Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative pt-2">
                {[
                  { id: 'REQUESTED', title: '1. Request Received', desc: 'Booking confirmed' },
                  { id: 'ASSIGNED', title: '2. Technician Allocated', desc: request.assigned_worker_name ? `Assigned to ${request.assigned_worker_name}` : 'Assigning technician...' },
                  { id: 'IN_PROGRESS', title: '3. Under Servicing', desc: 'Active repair on bay' },
                  { id: 'COMPLETED', title: '4. Ready for Delivery', desc: 'Inspection finished' },
                ].map((s) => {
                  const state = getStepStatus(s.id as any);
                  return (
                    <div
                      key={s.id}
                      className={`p-4 rounded-xl border transition-all space-y-2 ${
                        state === 'current'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md ring-2 ring-blue-500/30'
                          : state === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-gray-950/60 border-gray-850 text-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>{s.title}</span>
                        {state === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {state === 'current' && <Clock className="w-4 h-4 text-blue-400 animate-spin" />}
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Technician Notes Box */}
              {request.status_notes && (
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <FileText className="w-4 h-4" />
                    <span>Showroom Technician Remarks</span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed font-sans">
                    &quot;{request.status_notes}&quot;
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono pt-1">
                    Updated: {new Date(request.status_updated_at).toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              {/* Details Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-850 space-y-1">
                  <span className="text-gray-400 font-semibold block">Service Description</span>
                  <p className="text-gray-200">{request.service_description}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-850 space-y-1">
                  <span className="text-gray-400 font-semibold block">Showroom Contact</span>
                  <p className="text-gray-200 font-bold">{request.showroom?.name}</p>
                  <p className="text-gray-400 font-mono">{request.showroom?.contactPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
