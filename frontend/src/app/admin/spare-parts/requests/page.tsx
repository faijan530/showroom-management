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
import { Package, Clock, CheckCircle2, Truck, Store, Filter, Edit3, User, Calendar } from 'lucide-react';

interface StaffUser {
  id: string;
  full_name: string;
  phone: string;
  role: string;
}

interface StaffResponse {
  success: boolean;
  data: { staff: StaffUser[] };
}

interface SparePartRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  part_name: string;
  quantity: number;
  vehicle_details?: string | null;
  notes?: string | null;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'ORDERED' | 'IN_TRANSIT' | 'RECEIVED' | 'READY' | 'COMPLETED' | 'CANCELLED';
  estimated_delivery?: string | null;
  response_notes?: string | null;
  assigned_worker_id?: string | null;
  assigned_worker_name?: string | null;
  created_at: string;
}

interface PartRequestsResponse {
  success: boolean;
  data: { part_requests: SparePartRequest[] };
}

export default function AdminSparePartRequestsPage() {
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReq, setActiveReq] = useState<SparePartRequest | null>(null);

  const [statusInput, setStatusInput] = useState<string>('UNDER_REVIEW');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [responseNotes, setResponseNotes] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const showroomId = user?.showroom_id;

  // Fetch Part Requests
  const { data, isLoading } = useQuery<PartRequestsResponse>({
    queryKey: ['admin-part-requests', showroomId, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      return apiClient<PartRequestsResponse>(`/admin/spare-part-requests?${params.toString()}`);
    },
  });

  // Fetch Staff Workers
  const { data: staffData } = useQuery<StaffResponse>({
    queryKey: ['showroom-staff-workers', showroomId],
    queryFn: () => apiClient<StaffResponse>('/admin/staff'),
    enabled: !!showroomId || user?.role === 'SUPERADMIN',
  });

  const partRequests = data?.data?.part_requests || [];
  const staff = staffData?.data?.staff || [];
  const workers = staff.filter((s) => s.role === 'WORKER');

  const totalRequests = partRequests.length;
  const pendingCount = partRequests.filter((r) => r.status === 'REQUESTED' || r.status === 'UNDER_REVIEW').length;
  const inTransitCount = partRequests.filter((r) => r.status === 'ORDERED' || r.status === 'IN_TRANSIT').length;
  const readyCount = partRequests.filter((r) => r.status === 'READY' || r.status === 'RECEIVED').length;

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient(`/admin/spare-part-requests/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Spare part request status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-part-requests'] });
      setIsModalOpen(false);
      setActiveReq(null);
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update request'),
  });

  const handleOpenUpdateModal = (reqItem: SparePartRequest) => {
    setActiveReq(reqItem);
    setStatusInput(reqItem.status);
    setEstimatedDelivery(reqItem.estimated_delivery ? reqItem.estimated_delivery.split('T')[0] : '');
    setResponseNotes(reqItem.response_notes || '');
    setAssignedWorkerId(reqItem.assigned_worker_id || '');
    setIsModalOpen(true);
  };

  const handleSaveUpdate = () => {
    if (!activeReq) return;

    updateMutation.mutate({
      id: activeReq.id,
      body: {
        status: statusInput,
        estimated_delivery: estimatedDelivery || undefined,
        response_notes: responseNotes || undefined,
        assigned_worker_id: assignedWorkerId || undefined,
      },
    });
  };

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
        return <Badge variant="info"><Store className="w-3 h-3 mr-1 inline" /> Received</Badge>;
      case 'READY':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" /> Ready</Badge>;
      case 'COMPLETED':
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" /> Completed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <PageWrapper
      title="Spare Part Requests & Order Fulfillment Manager"
      description="Manage customer spare part orders, set estimated delivery dates (ETA), assign technicians, and track fulfillment status."
    >
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Part Orders"
            value={isLoading ? 'Loading...' : `${totalRequests}`}
            change="Customer requested parts"
            isPositive
            icon={Package}
            iconColor="text-amber-400"
          />
          <StatCard
            title="Pending Review"
            value={isLoading ? 'Loading...' : `${pendingCount}`}
            change={pendingCount > 0 ? 'Requires Action' : 'All Reviewed'}
            isPositive={pendingCount === 0}
            icon={Clock}
            iconColor={pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <StatCard
            title="In Transit / Ordered"
            value={isLoading ? 'Loading...' : `${inTransitCount}`}
            change="Manufacturer pipeline"
            isPositive
            icon={Truck}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Ready for Customer"
            value={isLoading ? 'Loading...' : `${readyCount}`}
            change="Showroom desk ready"
            isPositive
            icon={CheckCircle2}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Status Filters */}
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider mr-2">Filter Status:</span>
          {['ALL', 'REQUESTED', 'UNDER_REVIEW', 'ORDERED', 'IN_TRANSIT', 'RECEIVED', 'READY', 'COMPLETED'].map((st) => (
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

        {/* Requests Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Requested Part</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA / Est. Delivery</TableHead>
              <TableHead>Assigned Worker</TableHead>
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
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No spare part order requests found for selected filter.
                </TableCell>
              </TableRow>
            ) : (
              partRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold text-gray-200 text-xs">{req.customer_name}</p>
                      <p className="text-[11px] font-mono text-gray-400">{req.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-gray-100 text-xs">{req.part_name}</p>
                    {req.vehicle_details && (
                      <p className="text-[11px] text-gray-400 truncate max-w-xs">{req.vehicle_details}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-300">{req.quantity}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell>
                    {req.estimated_delivery ? (
                      <span className="text-xs font-mono text-amber-400 font-bold">
                        {new Date(req.estimated_delivery).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {req.assigned_worker_name ? (
                      <span className="text-xs font-semibold text-blue-300">{req.assigned_worker_name}</span>
                    ) : (
                      <span className="text-xs text-gray-500">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      className="h-8 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                      onClick={() => handleOpenUpdateModal(req)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Update / ETA
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Update Modal */}
      {isModalOpen && activeReq && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Fulfill Spare Part Order Request"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1">
              <p className="text-gray-400">Order: <span className="font-bold text-gray-200">{activeReq.part_name} (Qty: {activeReq.quantity})</span></p>
              <p className="text-gray-400">Customer: <span className="font-bold text-gray-200">{activeReq.customer_name} ({activeReq.customer_phone})</span></p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Update Status Timeline
              </label>
              <select
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="REQUESTED">REQUESTED — Order Received</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW — Checking Stock & Price</option>
                <option value="ORDERED">ORDERED — Placed Order with OEM Supplier</option>
                <option value="IN_TRANSIT">IN_TRANSIT — Shipment Shipped</option>
                <option value="RECEIVED">RECEIVED — Delivered to Showroom Warehouse</option>
                <option value="READY">READY — Ready for Customer Pickup</option>
                <option value="COMPLETED">COMPLETED — Delivered & Completed</option>
                <option value="CANCELLED">CANCELLED — Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Estimated Delivery Date (ETA)
              </label>
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {workers.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Assign Specialist / Technician
                </label>
                <select
                  value={assignedWorkerId}
                  onChange={(e) => setAssignedWorkerId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">-- Select Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} ({w.phone})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status Response Notes for Customer
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 text-sm bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                rows={3}
                placeholder="e.g. Part ordered from manufacturer, expected to arrive at showroom by Thursday..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUpdate} isLoading={updateMutation.isPending}>
                Save Order Fulfillment Update
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}
