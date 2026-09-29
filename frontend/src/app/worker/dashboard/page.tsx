'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { Wrench, CheckCircle2, Clock, XCircle, Play, Phone, Bike, Car, AlertCircle, FileText, Check } from 'lucide-react';

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
  worker_approval: 'PENDING' | 'APPROVED' | 'REJECTED';
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  status_notes?: string | null;
  status_updated_at: string;
  created_at: string;
}

interface ServiceJobsResponse {
  success: boolean;
  data: { service_jobs: ServiceJob[] };
}

export default function WorkerDashboardPage() {
  const { user } = useAuthStore();
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [statusInput, setStatusInput] = useState<'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ServiceJobsResponse>({
    queryKey: ['worker-service-jobs', user?.id],
    queryFn: () => apiClient<ServiceJobsResponse>('/services'),
  });

  const jobs = data?.data?.service_jobs || [];

  const activeJobs = jobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED');
  const pendingAcceptance = jobs.filter((j) => j.worker_approval === 'PENDING');
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');

  // Accept / Decline Job Mutation
  const respondJobMutation = useMutation({
    mutationFn: ({ id, approval }: { id: string; approval: 'APPROVED' | 'REJECTED' }) =>
      apiClient(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ worker_approval: approval }),
      }),
    onSuccess: (_, variables) => {
      toast(
        variables.approval === 'APPROVED' ? 'success' : 'info',
        variables.approval === 'APPROVED' ? 'Service job accepted!' : 'Service job declined'
      );
      queryClient.invalidateQueries({ queryKey: ['worker-service-jobs'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update job acceptance'),
  });

  // Update Status & Notes Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes: string }) =>
      apiClient(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, status_notes: notes }),
      }),
    onSuccess: () => {
      toast('success', 'Service job progress updated successfully!');
      setIsUpdateModalOpen(false);
      setSelectedJob(null);
      queryClient.invalidateQueries({ queryKey: ['worker-service-jobs'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update job progress'),
  });

  const handleOpenUpdateModal = (j: ServiceJob, initialStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    setSelectedJob(j);
    setStatusInput(initialStatus);
    setStatusNotes(j.status_notes || '');
    setIsUpdateModalOpen(true);
  };

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    updateStatusMutation.mutate({
      id: selectedJob.id,
      status: statusInput,
      notes: statusNotes,
    });
  };

  return (
    <PageWrapper
      title="Technician Service Workspace"
      description="View assigned vehicle repair tasks, accept jobs, update servicing progress, and log completion notes."
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Active Service Jobs"
            value={`${activeJobs.length} Assigned`}
            change="Technician Queue"
            isPositive
            icon={Wrench}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Pending Acceptance"
            value={`${pendingAcceptance.length} Jobs`}
            change={pendingAcceptance.length > 0 ? 'Acceptance Required' : 'All Accepted'}
            isPositive={pendingAcceptance.length === 0}
            icon={Clock}
            iconColor={pendingAcceptance.length > 0 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <StatCard
            title="Jobs Completed"
            value={`${completedJobs.length} Repaired`}
            change="Service Finished"
            isPositive
            icon={CheckCircle2}
            iconColor="text-emerald-400"
          />
        </div>

        {/* Active Task Queue */}
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>Assigned Repair & Servicing Tasks</span>
            </CardTitle>
            <CardDescription>Real-time task queue for technician: {user?.full_name}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                <Wrench className="w-8 h-8 text-gray-600 mx-auto animate-pulse" />
                <p className="text-sm font-semibold text-gray-300">Loading assigned tasks...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-gray-300">No Pending Tasks Assigned</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Your repair task queue is empty. When showroom managers assign a servicing job, it will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-gray-800/90 bg-gray-900/60 space-y-4 hover:border-gray-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {job.vehicle_type === 'BIKE' ? (
                            <Bike className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Car className="w-4 h-4 text-indigo-400" />
                          )}
                          <span className="text-xs font-bold text-gray-200">{job.vehicle_details}</span>
                        </div>
                        <Badge
                          variant={
                            job.status === 'COMPLETED'
                              ? 'success'
                              : job.status === 'IN_PROGRESS'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>

                      {/* Customer Info & Service Description */}
                      <div className="p-3 rounded-lg bg-gray-950/80 border border-gray-850 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-gray-300 font-semibold">
                          <span>Customer: {job.customer_name}</span>
                          <span className="font-mono text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            {job.customer_phone}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                          <strong className="text-gray-300">Task:</strong> {job.service_description}
                        </p>
                      </div>

                      {/* Status Notes if any */}
                      {job.status_notes && (
                        <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-blue-300 flex items-start gap-2">
                          <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[11px] uppercase tracking-wider text-blue-400">
                              Technician Progress Notes:
                            </p>
                            <p className="text-gray-200 text-xs">{job.status_notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Task Actions */}
                    <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
                      {job.worker_approval === 'PENDING' ? (
                        <div className="flex items-center gap-2 w-full">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            onClick={() => respondJobMutation.mutate({ id: job.id, approval: 'APPROVED' })}
                            isLoading={respondJobMutation.isPending}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Accept Job
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-rose-400 hover:text-rose-300"
                            onClick={() => respondJobMutation.mutate({ id: job.id, approval: 'REJECTED' })}
                            isLoading={respondJobMutation.isPending}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      ) : job.status === 'ASSIGNED' || job.worker_approval === 'APPROVED' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => handleOpenUpdateModal(job, 'IN_PROGRESS')}
                        >
                          <Play className="w-3.5 h-3.5 mr-1" /> Start Servicing (IN_PROGRESS)
                        </Button>
                      ) : job.status === 'IN_PROGRESS' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                          onClick={() => handleOpenUpdateModal(job, 'COMPLETED')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete (COMPLETED)
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mx-auto py-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Servicing Finished
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress & Notes Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Servicing Progress & Remarks"
      >
        {selectedJob && (
          <form onSubmit={handleSaveStatusUpdate} className="space-y-4">
            <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-1">
              <p className="font-bold text-white">{selectedJob.vehicle_details}</p>
              <p className="text-gray-400">&quot;{selectedJob.service_description}&quot;</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Update Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatusInput('IN_PROGRESS')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    statusInput === 'IN_PROGRESS'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  In Progress (Servicing)
                </button>
                <button
                  type="button"
                  onClick={() => setStatusInput('COMPLETED')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    statusInput === 'COMPLETED'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Completed (Ready)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Service Completion Notes / Parts Used
              </label>
              <textarea
                className="w-full px-3.5 py-2 text-sm bg-gray-900/80 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                rows={4}
                placeholder="Engine oil replaced with Mobil1 10W-30. Front brake pad adjusted and chain lubricated..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={updateStatusMutation.isPending}>
                Save Progress
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
