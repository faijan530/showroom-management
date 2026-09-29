'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Wrench, Plus, Trash2, Edit3, Bike, Car, UserCheck, Clock, CheckCircle2, AlertCircle, Filter, User } from 'lucide-react';

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

interface ServiceJob {
  id: string;
  showroom_id: string;
  showroom_name?: string;
  customer_name: string;
  customer_phone: string;
  vehicle_type: 'BIKE' | 'CAR';
  vehicle_details: string;
  service_description: string;
  assigned_worker_id?: string | null;
  assigned_worker_name?: string | null;
  assigned_worker_phone?: string | null;
  worker_approval: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_notes?: string | null;
  created_at: string;
}

interface ServiceJobsResponse {
  success: boolean;
  data: { service_jobs: ServiceJob[] };
}

export default function AdminServicesPage() {
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<ServiceJob | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'BIKE' | 'CAR'>('BIKE');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');
  const [statusInput, setStatusInput] = useState<string>('REQUESTED');
  const [statusNotes, setStatusNotes] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const showroomId = user?.showroom_id;

  // Fetch Service Jobs
  const { data, isLoading } = useQuery<ServiceJobsResponse>({
    queryKey: ['showroom-service-jobs', showroomId, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
      return apiClient<ServiceJobsResponse>(`/services?${params.toString()}`);
    },
  });

  // Fetch Showroom Staff (Workers) for assignment dropdown
  const { data: staffData } = useQuery<StaffResponse>({
    queryKey: ['showroom-staff', showroomId],
    queryFn: () => apiClient<StaffResponse>('/admin/staff'),
  });

  const serviceJobs = data?.data?.service_jobs || [];
  const workers = (staffData?.data?.staff || []).filter((s) => s.role === 'WORKER');

  const totalJobs = serviceJobs.length;
  const unassignedJobs = serviceJobs.filter((j) => j.status === 'REQUESTED' || !j.assigned_worker_id).length;
  const inProgressJobs = serviceJobs.filter((j) => j.status === 'IN_PROGRESS').length;
  const completedJobs = serviceJobs.filter((j) => j.status === 'COMPLETED').length;

  // Create Service Job Mutation
  const createJobMutation = useMutation({
    mutationFn: (body: any) => apiClient('/services', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Service job created and queued!');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['showroom-service-jobs'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to create service job'),
  });

  // Update Service Job Mutation
  const updateJobMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiClient(`/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Service job assignment & status updated!');
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['showroom-service-jobs'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update service job'),
  });

  // Delete Service Job Mutation
  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast('success', 'Service job deleted!');
      queryClient.invalidateQueries({ queryKey: ['showroom-service-jobs'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to delete service job'),
  });

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setVehicleType('BIKE');
    setVehicleDetails('');
    setServiceDescription('');
    setAssignedWorkerId('');
    setStatusInput('REQUESTED');
    setStatusNotes('');
    setEditingJob(null);
  };

  const handleEditClick = (j: ServiceJob) => {
    setEditingJob(j);
    setCustomerName(j.customer_name);
    setCustomerPhone(j.customer_phone);
    setVehicleType(j.vehicle_type);
    setVehicleDetails(j.vehicle_details);
    setServiceDescription(j.service_description);
    setAssignedWorkerId(j.assigned_worker_id || '');
    setStatusInput(j.status);
    setStatusNotes(j.status_notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingJob) {
      updateJobMutation.mutate({
        id: editingJob.id,
        body: {
          assigned_worker_id: assignedWorkerId || null,
          status: statusInput,
          status_notes: statusNotes,
        },
      });
    } else {
      createJobMutation.mutate({
        customer_name: customerName,
        customer_phone: customerPhone,
        vehicle_type: vehicleType,
        vehicle_details: vehicleDetails,
        service_description: serviceDescription,
        assigned_worker_id: assignedWorkerId || undefined,
        target_showroom_id: showroomId,
      });
    }
  };

  return (
    <PageWrapper
      title="Service Jobs & Technician Allocation"
      description="Create, assign, and manage vehicle repair jobs and service tasks for showroom technicians."
      action={
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Book New Service Job
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Service Jobs"
            value={`${totalJobs} Jobs`}
            change="Active & Historical"
            isPositive
            icon={Wrench}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Unassigned Requests"
            value={`${unassignedJobs} Pending`}
            change={unassignedJobs > 0 ? 'Worker Assignment Needed' : 'All Assigned'}
            isPositive={unassignedJobs === 0}
            icon={AlertCircle}
            iconColor={unassignedJobs > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <StatCard
            title="In Progress"
            value={`${inProgressJobs} Servicing`}
            change="Technicians Active"
            isPositive
            icon={Clock}
            iconColor="text-indigo-400"
          />
          <StatCard
            title="Completed"
            value={`${completedJobs} Finished`}
            change="Ready for Delivery"
            isPositive
            icon={CheckCircle2}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-800/80 bg-gray-950/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-300">Filter Job Status:</span>
          </div>

          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-xs w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
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
              <TableHead>Customer & Vehicle</TableHead>
              <TableHead>Service Description</TableHead>
              <TableHead>Assigned Technician</TableHead>
              <TableHead>Worker Acceptance</TableHead>
              <TableHead>Job Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading service jobs queue...
                </TableCell>
              </TableRow>
            ) : serviceJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No service jobs found matching the selected status. Click &quot;Book New Service Job&quot; to queue a job.
                </TableCell>
              </TableRow>
            ) : (
              serviceJobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {j.vehicle_type === 'BIKE' ? <Bike className="w-4 h-4 text-blue-400" /> : <Car className="w-4 h-4 text-indigo-400" />}
                      <span>{j.customer_name}</span>
                    </div>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">{j.customer_phone}</p>
                    <p className="text-[11px] text-gray-400 font-semibold">{j.vehicle_details}</p>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-gray-200 line-clamp-2">{j.service_description}</p>
                    {j.status_notes && (
                      <p className="text-[11px] text-emerald-400 mt-1 line-clamp-1 italic">
                        Notes: &quot;{j.status_notes}&quot;
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {j.assigned_worker_name ? (
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-gray-200">{j.assigned_worker_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{j.assigned_worker_phone}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-400 font-semibold italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        j.worker_approval === 'APPROVED'
                          ? 'success'
                          : j.worker_approval === 'REJECTED'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {j.worker_approval}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        j.status === 'COMPLETED'
                          ? 'success'
                          : j.status === 'IN_PROGRESS'
                          ? 'info'
                          : j.status === 'ASSIGNED'
                          ? 'warning'
                          : j.status === 'CANCELLED'
                          ? 'error'
                          : 'neutral'
                      }
                    >
                      {j.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(j)}>
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteJobMutation.mutate(j.id)}>
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

      {/* Book / Assign Service Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? 'Manage Job Allocation & Status' : 'Book New Service Job'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingJob ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Customer Name"
                  placeholder="Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <Input
                  label="Customer Phone"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVehicleType('BIKE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      vehicleType === 'BIKE'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Bike / Scooter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType('CAR')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      vehicleType === 'CAR'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Car / Four-Wheeler</span>
                  </button>
                </div>
              </div>

              <Input
                label="Vehicle Details"
                placeholder="Hero Splendor BS6 (UP32 AB 1234)"
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Service Description
                </label>
                <textarea
                  className="w-full px-3.5 py-2 text-sm bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={3}
                  placeholder="Engine oil replacement, brake pad adjustment, general servicing..."
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>{editingJob.customer_name}</span>
                <span className="font-mono text-gray-400">({editingJob.customer_phone})</span>
              </p>
              <p className="text-gray-300 font-semibold">{editingJob.vehicle_details}</p>
              <p className="text-gray-400 text-[11px] italic">&quot;{editingJob.service_description}&quot;</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Assign Showroom Technician
            </label>
            <select
              value={assignedWorkerId}
              onChange={(e) => setAssignedWorkerId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">-- Select Available Technician --</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.full_name} ({w.phone})
                </option>
              ))}
            </select>
          </div>

          {editingJob && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Job Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusInput(st)}
                      className={`p-2 rounded-lg border text-[11px] font-bold transition-all ${
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
                  Status Remarks / Service Notes
                </label>
                <textarea
                  className="w-full px-3.5 py-2 text-sm bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={2}
                  placeholder="Technician completed oil change and brake tuning..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={createJobMutation.isPending || updateJobMutation.isPending}
            >
              {editingJob ? 'Save Job Allocation' : 'Book Service Job'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
