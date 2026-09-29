'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Package, MessageSquare, Clock, CheckCircle2, AlertCircle, Filter, Send, Phone, Mail, User } from 'lucide-react';

interface Enquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  enquiry_type: 'GENERAL' | 'VEHICLE_PURCHASE' | 'SPARE_PART_PURCHASE' | 'SERVICE_INQUIRY';
  message: string;
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  response_notes?: string | null;
  target_showroom_id?: string | null;
  broadcast_to_all: boolean;
  created_at: string;
}

interface EnquiriesResponse {
  success: boolean;
  data: { enquiries: Enquiry[] };
}

export default function InventoryInquiriesPage() {
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEnquiry, setActiveEnquiry] = useState<Enquiry | null>(null);

  const [responseNotes, setResponseNotes] = useState('');
  const [statusInput, setStatusInput] = useState<'RESPONDED' | 'CLOSED'>('RESPONDED');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const showroomId = user?.showroom_id;

  // Fetch Enquiries
  const { data, isLoading } = useQuery<EnquiriesResponse>({
    queryKey: ['inventory-enquiries', showroomId, selectedStatus, selectedType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      if (selectedType !== 'ALL') params.set('type', selectedType);
      return apiClient<EnquiriesResponse>(`/enquiries?${params.toString()}`);
    },
  });

  const enquiries = data?.data?.enquiries || [];

  // Filter for inventory relevant enquiries (or show all with inventory focus)
  const filteredEnquiries = enquiries.filter((e) => {
    if (selectedType === 'PARTS') return e.enquiry_type === 'SPARE_PART_PURCHASE';
    if (selectedType === 'VEHICLE') return e.enquiry_type === 'VEHICLE_PURCHASE';
    return true;
  });

  const totalInquiries = enquiries.length;
  const pendingCount = enquiries.filter((e) => e.status === 'PENDING').length;
  const respondedCount = enquiries.filter((e) => e.status === 'RESPONDED').length;
  const closedCount = enquiries.filter((e) => e.status === 'CLOSED').length;

  // Update Enquiry Mutation
  const updateEnquiryMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient(`/enquiries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Availability response saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['inventory-enquiries'] });
      setIsModalOpen(false);
      setActiveEnquiry(null);
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update enquiry'),
  });

  const handleOpenRespondModal = (enquiry: Enquiry) => {
    setActiveEnquiry(enquiry);
    setResponseNotes(enquiry.response_notes || '');
    setStatusInput(enquiry.status === 'CLOSED' ? 'CLOSED' : 'RESPONDED');
    setIsModalOpen(true);
  };

  const handleSaveResponse = () => {
    if (!activeEnquiry) return;
    if (!responseNotes.trim()) {
      toast('error', 'Please enter availability notes or expected delivery date');
      return;
    }

    updateEnquiryMutation.mutate({
      id: activeEnquiry.id,
      body: {
        status: statusInput,
        response_notes: responseNotes,
      },
    });
  };

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
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">Spare Part Request</span>;
      case 'VEHICLE_PURCHASE':
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">Vehicle Interest</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-800 text-gray-300 rounded-md">{type}</span>;
    }
  };

  return (
    <PageWrapper
      title="Stock Availability & Purchase Inquiries"
      description="Respond to customer inquiries regarding spare part availability, vehicle stock, and estimated delivery dates."
    >
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Stock Inquiries"
            value={isLoading ? 'Loading...' : `${totalInquiries}`}
            change="Showroom customer queries"
            isPositive
            icon={MessageSquare}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Awaiting Response"
            value={isLoading ? 'Loading...' : `${pendingCount}`}
            change={pendingCount > 0 ? 'Action Required' : 'All clear'}
            isPositive={pendingCount === 0}
            icon={Clock}
            iconColor={pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <StatCard
            title="Responded Queries"
            value={isLoading ? 'Loading...' : `${respondedCount}`}
            change="Customers informed"
            isPositive
            icon={Send}
            iconColor="text-cyan-400"
          />
          <StatCard
            title="Closed Inquiries"
            value={isLoading ? 'Loading...' : `${closedCount}`}
            change="Completed requests"
            isPositive
            icon={CheckCircle2}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Status:</span>
            <div className="flex gap-1.5">
              {['ALL', 'PENDING', 'RESPONDED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedStatus === st
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Category:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'ALL', label: 'All Types' },
                { id: 'PARTS', label: 'Spare Parts' },
                { id: 'VEHICLE', label: 'Vehicles' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedType(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedType === cat.id
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                      : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Inquiry Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response / Delivery Note</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Loading stock inquiries...
                </TableCell>
              </TableRow>
            ) : filteredEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No stock inquiries found matching the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-bold text-gray-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{enquiry.customer_name}</span>
                      </p>
                      <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span>{enquiry.customer_phone}</span>
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(enquiry.enquiry_type)}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-gray-300 line-clamp-2">{enquiry.message}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                  <TableCell className="max-w-xs">
                    {enquiry.response_notes ? (
                      <p className="text-xs text-emerald-400/90 italic line-clamp-2">
                        "{enquiry.response_notes}"
                      </p>
                    ) : (
                      <span className="text-xs text-gray-500">No response logged</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(enquiry.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      className="h-8 text-xs bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border-blue-500/30"
                      onClick={() => handleOpenRespondModal(enquiry)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Respond
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Response Modal */}
      {isModalOpen && activeEnquiry && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Respond to Customer Stock Inquiry"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              Customer: <span className="font-bold text-gray-200">{activeEnquiry.customer_name}</span> ({activeEnquiry.customer_phone})
            </p>
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
              <p className="text-xs font-semibold text-gray-400">Customer Message:</p>
              <p className="text-xs text-gray-200">{activeEnquiry.message}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Update Status
              </label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="RESPONDED">RESPONDED — Inform Customer of Availability</option>
                <option value="CLOSED">CLOSED — Inquiry Resolved & Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Stock Availability / Expected Delivery Time Notes
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                rows={4}
                placeholder="e.g., In stock! Available for pickup immediately or delivery by tomorrow afternoon..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveResponse}
                isLoading={updateEnquiryMutation.isPending}
              >
                Save Availability Response
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}
