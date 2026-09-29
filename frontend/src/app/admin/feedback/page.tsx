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
import { Star, MessageSquare, CheckCircle2, XCircle, Filter, Edit3, ShieldCheck } from 'lucide-react';

interface FeedbackItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  showroom_id: string;
  showroom_name?: string;
  vehicle_details?: string;
  service_description?: string;
  rating: number;
  comment?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  admin_response?: string | null;
  created_at: string;
}

interface FeedbacksResponse {
  success: boolean;
  data: { feedbacks: FeedbackItem[] };
}

export default function AdminFeedbackModerationPage() {
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackItem | null>(null);

  const [statusInput, setStatusInput] = useState<'APPROVED' | 'REJECTED' | 'PENDING'>('APPROVED');
  const [adminResponse, setAdminResponse] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const showroomId = user?.showroom_id;

  // Fetch Feedbacks
  const { data, isLoading } = useQuery<FeedbacksResponse>({
    queryKey: ['admin-feedbacks', showroomId, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      return apiClient<FeedbacksResponse>(`/admin/feedback?${params.toString()}`);
    },
  });

  const feedbacks = data?.data?.feedbacks || [];

  const totalReviews = feedbacks.length;
  const pendingCount = feedbacks.filter((f) => f.status === 'PENDING').length;
  const approvedCount = feedbacks.filter((f) => f.status === 'APPROVED').length;
  const avgRating = totalReviews > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1) : '5.0';

  // Moderate Feedback Mutation
  const updateFeedbackMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient(`/admin/feedback/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Feedback status & response updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
      setIsModalOpen(false);
      setActiveFeedback(null);
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update feedback'),
  });

  const handleOpenModerationModal = (fb: FeedbackItem) => {
    setActiveFeedback(fb);
    setStatusInput(fb.status === 'PENDING' ? 'APPROVED' : fb.status);
    setAdminResponse(fb.admin_response || '');
    setIsModalOpen(true);
  };

  const handleSaveModeration = () => {
    if (!activeFeedback) return;

    updateFeedbackMutation.mutate({
      id: activeFeedback.id,
      body: {
        status: statusInput,
        admin_response: adminResponse || undefined,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'APPROVED':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" /> Approved (Public)</Badge>;
      case 'REJECTED':
        return <Badge variant="error"><XCircle className="w-3 h-3 mr-1 inline" /> Hidden / Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Customer Reviews & Feedback Moderation"
      description="Review customer post-service star ratings, moderate public visibility, and submit official showroom responses."
    >
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Customer Reviews"
            value={isLoading ? 'Loading...' : `${totalReviews}`}
            change="Submitted feedback records"
            isPositive
            icon={MessageSquare}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Average Showroom Rating"
            value={isLoading ? 'Loading...' : `${avgRating} / 5.0 ⭐`}
            change="Customer Satisfaction Index"
            isPositive
            icon={Star}
            iconColor="text-amber-400"
          />
          <StatCard
            title="Pending Moderation"
            value={isLoading ? 'Loading...' : `${pendingCount}`}
            change={pendingCount > 0 ? 'Requires Action' : 'All Moderated'}
            isPositive={pendingCount === 0}
            icon={Edit3}
            iconColor={pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <StatCard
            title="Approved Public Reviews"
            value={isLoading ? 'Loading...' : `${approvedCount}`}
            change="Visible on public portal"
            isPositive
            icon={ShieldCheck}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider mr-2">Filter Status:</span>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedStatus === st
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Feedback Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Customer Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Showroom Response</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  Loading customer reviews...
                </TableCell>
              </TableRow>
            ) : feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No feedback records found matching the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((fb) => (
                <TableRow key={fb.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold text-gray-200 text-xs">{fb.customer_name}</p>
                      <p className="text-[11px] font-mono text-gray-400">{fb.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-amber-400 text-xs font-mono">{fb.rating}.0</span>
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {fb.comment ? (
                      <p className="text-xs text-gray-300 italic line-clamp-2">"{fb.comment}"</p>
                    ) : (
                      <span className="text-xs text-gray-500">No comment provided</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(fb.status)}</TableCell>
                  <TableCell className="max-w-xs">
                    {fb.admin_response ? (
                      <p className="text-xs text-blue-400 italic line-clamp-2">"{fb.admin_response}"</p>
                    ) : (
                      <span className="text-xs text-gray-500">No response</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      className="h-8 text-xs bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 border-blue-500/30"
                      onClick={() => handleOpenModerationModal(fb)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Moderate / Reply
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Moderation Modal */}
      {isModalOpen && activeFeedback && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Moderate Service Feedback & Respond"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1">
              <p className="text-gray-400">Customer: <span className="font-bold text-gray-200">{activeFeedback.customer_name} ({activeFeedback.customer_phone})</span></p>
              <div className="flex items-center gap-1 text-amber-400 font-bold pt-1">
                <span>Rating: {activeFeedback.rating}.0 / 5.0</span>
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              {activeFeedback.comment && (
                <p className="text-gray-300 italic pt-1">"{activeFeedback.comment}"</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Moderation Status
              </label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="APPROVED">APPROVED — Publish on Public Reviews Page</option>
                <option value="REJECTED">REJECTED — Hide from Public View</option>
                <option value="PENDING">PENDING — Keep Under Moderation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Official Showroom Response
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                rows={3}
                placeholder="e.g. Thank you for your review! We are glad you had a great servicing experience..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveModeration} isLoading={updateFeedbackMutation.isPending}>
                Save Moderation & Response
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}
