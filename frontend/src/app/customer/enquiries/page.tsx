'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { MessageSquare, Plus, Clock, CheckCircle2, Send, Package, Bike, Wrench } from 'lucide-react';

interface Enquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  enquiry_type: 'GENERAL' | 'VEHICLE_PURCHASE' | 'SPARE_PART_PURCHASE' | 'SERVICE_INQUIRY';
  message: string;
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  response_notes?: string | null;
  target_showroom?: { name: string; code: string } | null;
  broadcast_to_all: boolean;
  created_at: string;
}

interface EnquiriesResponse {
  success: boolean;
  data: { enquiries: Enquiry[] };
}

export default function CustomerEnquiriesListPage() {
  const { data, isLoading } = useQuery<EnquiriesResponse>({
    queryKey: ['my-customer-enquiries'],
    queryFn: () => apiClient<EnquiriesResponse>('/enquiries'),
  });

  const enquiries = data?.data?.enquiries || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1 inline" /> Pending</Badge>;
      case 'RESPONDED':
        return <Badge variant="info"><Send className="w-3 h-3 mr-1 inline" /> Responded</Badge>;
      case 'CLOSED':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" /> Closed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SPARE_PART_PURCHASE':
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">Spare Part Query</span>;
      case 'VEHICLE_PURCHASE':
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">Vehicle Interest</span>;
      case 'SERVICE_INQUIRY':
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">Service Inquiry</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-800 text-gray-300 rounded-md">General</span>;
    }
  };

  return (
    <PageWrapper
      title="My Showroom Enquiries & Availability Queries"
      description="Track availability responses and replies from showrooms for your submitted enquiries."
      action={
        <Link href="/customer/enquiries/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" /> Submit New Query
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target Showroom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>My Query Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Showroom Availability Response</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  Loading your enquiries...
                </TableCell>
              </TableRow>
            ) : enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="space-y-3 max-w-sm mx-auto">
                    <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
                    <p className="text-sm font-semibold text-gray-300">No Enquiries Submitted Yet</p>
                    <p className="text-xs text-gray-500">
                      Submit a query to check spare part availability or vehicle stock with registered showrooms.
                    </p>
                    <Link href="/customer/enquiries/new" className="inline-block pt-1">
                      <Button variant="secondary" className="text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Ask Part Availability
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    {enquiry.broadcast_to_all ? (
                      <span className="font-semibold text-indigo-400 text-xs">All Showrooms (Broadcast)</span>
                    ) : (
                      <span className="font-semibold text-gray-200 text-xs">
                        {enquiry.target_showroom?.name || 'Showroom'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getTypeBadge(enquiry.enquiry_type)}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-gray-300 line-clamp-2">{enquiry.message}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                  <TableCell className="max-w-xs">
                    {enquiry.response_notes ? (
                      <p className="text-xs text-emerald-400/90 font-medium italic line-clamp-2">
                        "{enquiry.response_notes}"
                      </p>
                    ) : (
                      <span className="text-xs text-gray-500">Awaiting response</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(enquiry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
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
