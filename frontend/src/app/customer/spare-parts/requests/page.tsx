'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Package, Plus, Clock, CheckCircle2, Truck, ArrowRight, Store, AlertCircle } from 'lucide-react';

interface SparePartRequest {
  id: string;
  showroom_name?: string;
  part_name: string;
  quantity: number;
  vehicle_details?: string | null;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'ORDERED' | 'IN_TRANSIT' | 'RECEIVED' | 'READY' | 'COMPLETED' | 'CANCELLED';
  estimated_delivery?: string | null;
  response_notes?: string | null;
  created_at: string;
}

interface PartRequestsResponse {
  success: boolean;
  data: { part_requests: SparePartRequest[] };
}

export default function CustomerSparePartRequestsListPage() {
  const { data, isLoading } = useQuery<PartRequestsResponse>({
    queryKey: ['my-customer-part-requests'],
    queryFn: () => apiClient<PartRequestsResponse>('/customer/spare-part-requests'),
  });

  const partRequests = data?.data?.part_requests || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1 inline" /> Requested</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="info"><Store className="w-3 h-3 mr-1 inline" /> Under Review</Badge>;
      case 'ORDERED':
        return <Badge variant="info"><Package className="w-3 h-3 mr-1 inline" /> Ordered</Badge>;
      case 'IN_TRANSIT':
        return <Badge variant="warning"><Truck className="w-3 h-3 mr-1 inline" /> In Transit</Badge>;
      case 'RECEIVED':
        return <Badge variant="info"><Store className="w-3 h-3 mr-1 inline" /> Received at Showroom</Badge>;
      case 'READY':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" /> Ready for Pickup</Badge>;
      case 'COMPLETED':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" /> Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="error"><AlertCircle className="w-3 h-3 mr-1 inline" /> Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <PageWrapper
      title="My Spare Part Requests & Order Timeline Tracker"
      description="Track the real-time fulfillment timeline of your requested spare parts from showroom inventory managers."
      action={
        <Link href="/customer/spare-parts/request">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" /> Request New Spare Part
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Showroom</TableHead>
              <TableHead>Requested Spare Part</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status Timeline</TableHead>
              <TableHead>Est. Delivery / ETA</TableHead>
              <TableHead>Showroom Notes</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Loading spare part requests...
                </TableCell>
              </TableRow>
            ) : partRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="space-y-3 max-w-sm mx-auto">
                    <Package className="w-8 h-8 text-amber-500/80 mx-auto" />
                    <p className="text-sm font-semibold text-gray-300">No Spare Part Requests Submitted</p>
                    <p className="text-xs text-gray-500">
                      Submit a request for any bike or car spare part to track fulfillment timeline from showrooms.
                    </p>
                    <Link href="/customer/spare-parts/request" className="inline-block pt-1">
                      <Button variant="secondary" className="text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Request Spare Part
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              partRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <span className="font-semibold text-gray-200 text-xs">
                      {req.showroom_name || 'Showroom'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-100 text-xs">{req.part_name}</p>
                      {req.vehicle_details && (
                        <p className="text-[11px] text-gray-400 truncate max-w-xs">{req.vehicle_details}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-300">{req.quantity}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell>
                    {req.estimated_delivery ? (
                      <span className="text-xs font-mono text-amber-400 font-semibold">
                        {new Date(req.estimated_delivery).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">TBD</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {req.response_notes ? (
                      <p className="text-xs text-emerald-400/90 italic line-clamp-2">
                        "{req.response_notes}"
                      </p>
                    ) : (
                      <span className="text-xs text-gray-500">No notes logged</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/customer/spare-parts/requests/${req.id}`}>
                      <Button variant="secondary" className="h-8 text-xs">
                        Track <ArrowRight className="w-3 h-3 ml-1" />
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
