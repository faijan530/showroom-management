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
import { MessageSquare, Clock, CheckCircle2, XCircle, Phone, Mail, User, Trash2, Edit3, Filter, Send } from 'lucide-react';

interface Enquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  enquiry_type: 'GENERAL' | 'VEHICLE_PURCHASE' | 'SPARE_PART_PURCHASE' | 'SERVICE_INQUIRY';
  message: string;
  target_showroom_id?: string | null;
  target_showroom_name?: string | null;
  broadcast_to_all: boolean;
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  response_notes?: string | null;
  created_at: string;
}

interface EnquiriesResponse {
  success: boolean;
  data: { enquiries: Enquiry[] };
}

export default function AdminEnquiriesPage() {
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING' | 'RESPONDED' | 'CLOSED'>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Response Form State
  const [statusInput, setStatusInput] = useState<'PENDING' | 'RESPONDED' | 'CLOSED'>('RESPONDED');
  const [responseNotes, setResponseNotes] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<EnquiriesResponse>({
    queryKey: ['showroom-enquiries', user?.showroom_id, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      return apiClient<EnquiriesResponse>(`/enquiries?${params.toString()}`);
    },
  });

  const enquiries = data?.data?.enquiries || [];

  const totalCount = enquiries.length;
  const pendingCount = enquiries.filter((e) => e.status === 'PENDING').length;
  const respondedCount = enquiries.filter((e) => e.status === 'RESPONDED').length;
  const closedCount = enquiries.filter((e) => e.status === 'CLOSED').length;

  // Update Enquiry Mutation
  const updateEnquiryMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient(`/enquiries/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Enquiry status updated successfully!');
      setIsModalOpen(false);
      setSelectedEnquiry(null);
      queryClient.invalidateQueries({ queryKey: ['showroom-enquiries'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update enquiry'),
  });

  // Delete Enquiry Mutation
  const deleteEnquiryMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/enquiries/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Enquiry deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['showroom-enquiries'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to delete enquiry'),
  });

  const handleOpenResponseModal = (e: Enquiry) => {
    setSelectedEnquiry(e);
    setStatusInput(e.status);
    setResponseNotes(e.response_notes || '');
    setIsModalOpen(true);
  };

  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    updateEnquiryMutation.mutate({
      id: selectedEnquiry.id,
      body: {
        status: statusInput,
        response_notes: responseNotes,
      },
    });
  };

  return (
    <PageWrapper
      title="Customer Enquiries Management"
      description="Track customer questions, vehicle sales inquiries, spare parts requests, and service bookings."
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Enquiries"
            value={`${totalCount} Requests`}
            change="All Time Submissions"
            isPositive
            icon={MessageSquare}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Pending Actions"
            value={`${pendingCount} Pending`}
            change={pendingCount > 0 ? 'Response Required' : 'All Addressed'}
            isPositive={pendingCount === 0}
            icon={Clock}
            iconColor={pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <StatCard
            title="Responded"
            value={`${respondedCount} Items`}
            change="In Progress Communication"
            isPositive
            icon={Send}
            iconColor="text-indigo-400"
          />
          <StatCard
            title="Closed / Resolved"
            value={`${closedCount} Closed`}
            change="Completed Enquiries"
            isPositive
            icon={CheckCircle2}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-800/80 bg-gray-950/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-300">Filter by Status:</span>
          </div>

          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-xs w-full sm:w-auto">
            {(['ALL', 'PENDING', 'RESPONDED', 'CLOSED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  selectedStatus === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Message & Inquiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading customer enquiries...
                </TableCell>
              </TableRow>
            ) : enquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No customer enquiries found matching the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              enquiries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-400" />
                      <span>{e.customer_name}</span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-0.5 mt-1">
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="font-mono text-gray-300">{e.customer_phone}</span>
                      </p>
                      {e.customer_email && (
                        <p className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span>{e.customer_email}</span>
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        e.enquiry_type === 'VEHICLE_PURCHASE'
                          ? 'info'
                          : e.enquiry_type === 'SPARE_PART_PURCHASE'
                          ? 'warning'
                          : e.enquiry_type === 'SERVICE_INQUIRY'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {e.enquiry_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-gray-200 line-clamp-2">{e.message}</p>
                    {e.response_notes && (
                      <p className="text-[11px] text-blue-400 mt-1 line-clamp-1 italic">
                        Response: &quot;{e.response_notes}&quot;
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        e.status === 'PENDING'
                          ? 'warning'
                          : e.status === 'RESPONDED'
                          ? 'info'
                          : 'success'
                      }
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400 font-mono">
                    {new Date(e.created_at).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenResponseModal(e)}>
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteEnquiryMutation.mutate(e.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Response Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Respond & Update Enquiry Status"
      >
        {selectedEnquiry && (
          <form onSubmit={handleSaveResponse} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                <span className="font-bold text-gray-200">{selectedEnquiry.customer_name}</span>
                <span className="font-mono text-gray-400">{selectedEnquiry.customer_phone}</span>
              </div>
              <p className="text-gray-300 font-medium text-xs leading-relaxed">
                &quot;{selectedEnquiry.message}&quot;
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Update Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PENDING', 'RESPONDED', 'CLOSED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusInput(st)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      statusInput === st
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Response Notes / Internal Remarks
              </label>
              <textarea
                className="w-full px-3.5 py-2 text-sm bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                rows={4}
                placeholder="Call made to customer. Quoted price for Splendor BS6 & offered free test drive..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={updateEnquiryMutation.isPending}>
                Save Response
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
