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
import { Package, Store, Clock, CheckCircle2, Truck, ArrowLeft, Phone, MapPin, AlertCircle } from 'lucide-react';

interface PartRequestDetail {
  id: string;
  showroom_name: string;
  showroom_code: string;
  showroom_address: string;
  showroom_phone: string;
  part_name: string;
  quantity: number;
  vehicle_details?: string | null;
  notes?: string | null;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'ORDERED' | 'IN_TRANSIT' | 'RECEIVED' | 'READY' | 'COMPLETED' | 'CANCELLED';
  estimated_delivery?: string | null;
  response_notes?: string | null;
  assigned_worker_name?: string | null;
  created_at: string;
  updated_at: string;
}

interface DetailResponse {
  success: boolean;
  data: { part_request: PartRequestDetail };
}

const TIMELINE_STEPS = [
  { key: 'REQUESTED', label: '1. Order Requested', desc: 'Submitted by customer' },
  { key: 'UNDER_REVIEW', label: '2. Under Review', desc: 'Inventory manager reviewing stock' },
  { key: 'ORDERED', label: '3. Part Ordered', desc: 'Ordered from OEM manufacturer' },
  { key: 'IN_TRANSIT', label: '4. In Transit', desc: 'Shipment dispatched' },
  { key: 'RECEIVED', label: '5. Received at Showroom', desc: 'Arrived at showroom warehouse' },
  { key: 'READY', label: '6. Ready for Pickup', desc: 'Available at showroom desk' },
  { key: 'COMPLETED', label: '7. Completed', desc: 'Fulfilled & handed to customer' },
];

export default function CustomerSparePartRequestTrackerPage() {
  const params = useParams();
  const requestId = params.id as string;

  const { data, isLoading } = useQuery<DetailResponse>({
    queryKey: ['customer-part-request-detail', requestId],
    queryFn: () => apiClient<DetailResponse>(`/customer/spare-part-requests/${requestId}`),
    enabled: !!requestId,
  });

  const request = data?.data?.part_request;

  const getCurrentStepIndex = (status: string) => {
    const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentIdx = request ? getCurrentStepIndex(request.status) : 0;

  return (
    <PageWrapper
      title="Spare Part Order Status Tracker"
      description="Live status timeline tracking for your spare part fulfillment order."
      action={
        <Link href="/customer/spare-parts/requests">
          <Button variant="secondary" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Part Requests
          </Button>
        </Link>
      }
    >
      {isLoading ? (
        <div className="p-12 text-center border border-dashed border-gray-800 rounded-2xl space-y-2">
          <Package className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
          <p className="text-sm font-semibold text-gray-300">Loading order timeline...</p>
        </div>
      ) : !request ? (
        <div className="p-12 text-center border border-dashed border-gray-800 rounded-2xl space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold text-gray-300">Request Not Found</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Order Header Card */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <span>{request.part_name}</span>
                  <Badge variant="info" className="ml-2 font-mono">Qty: {request.quantity}</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 font-mono pt-1">
                  Order ID: {request.id} • Placed on {new Date(request.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Est. Delivery Date</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {request.estimated_delivery ? new Date(request.estimated_delivery).toLocaleDateString() : 'Awaiting Confirmation'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Showroom Info Bar */}
              <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-gray-400 font-semibold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-blue-400" />
                    <span>Fulfilling Showroom</span>
                  </p>
                  <p className="font-bold text-gray-200">{request.showroom_name} ({request.showroom_code})</p>
                  <p className="text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span>{request.showroom_address}</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Showroom Desk Phone</span>
                  </p>
                  <p className="font-mono text-gray-200">{request.showroom_phone}</p>
                  {request.assigned_worker_name && (
                    <p className="text-gray-400 text-[11px]">Assigned Specialist: <span className="text-blue-300 font-bold">{request.assigned_worker_name}</span></p>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Order Status Timeline Progress
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-xl border text-center text-xs transition-all ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                            : isPassed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-gray-900 border-gray-800 text-gray-500'
                        }`}
                      >
                        <div className="font-bold text-[11px] truncate">{step.label}</div>
                        <div className="text-[10px] text-gray-400 mt-1 line-clamp-2">{step.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Showroom Response Notes */}
              {request.response_notes && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs">
                  <p className="font-bold text-emerald-400">Showroom Inventory Manager Response Note:</p>
                  <p className="text-gray-200 italic">"{request.response_notes}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
