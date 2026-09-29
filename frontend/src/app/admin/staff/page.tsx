'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Users, UserPlus, Phone, Mail, Wrench, Package } from 'lucide-react';

interface StaffMember {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  role: 'WORKER' | 'INVENTORY_MANAGER';
  created_at: string;
}

interface StaffResponse {
  success: boolean;
  data: { staff: StaffMember[] };
}

export default function AdminStaffPage() {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Staff Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'WORKER' | 'INVENTORY_MANAGER'>('WORKER');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<StaffResponse>({
    queryKey: ['admin-staff-list'],
    queryFn: () => apiClient<StaffResponse>('/admin/staff'),
  });

  const staffList = data?.data?.staff || [];

  // Create Staff Mutation
  const createStaffMutation = useMutation({
    mutationFn: (body: any) => apiClient('/admin/staff', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', `Staff member provisioned successfully as ${role === 'WORKER' ? 'Worker/Technician' : 'Inventory Manager'}!`);
      setIsStaffModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-staff-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-summary'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to provision staff member'),
  });

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setRole('WORKER');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    createStaffMutation.mutate({
      full_name: fullName,
      phone: phone.replace(/\D/g, ''),
      email: email || undefined,
      password,
      role,
    });
  };

  return (
    <PageWrapper
      title="Showroom Staff Directory"
      description="Provision credentials for technicians (workers) and inventory managers bound to your showroom."
      action={
        <Button variant="primary" onClick={() => setIsStaffModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1.5" /> Provision Staff Member
        </Button>
      }
    >
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact Details</TableHead>
              <TableHead>Provisioned On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Loading showroom staff members...
                </TableCell>
              </TableRow>
            ) : staffList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No staff members provisioned yet. Click &quot;Provision Staff Member&quot; to add your team.
                </TableCell>
              </TableRow>
            ) : (
              staffList.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>{s.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.role === 'WORKER' ? 'info' : 'warning'} className="flex items-center gap-1 w-fit">
                      {s.role === 'WORKER' ? (
                        <>
                          <Wrench className="w-3 h-3" /> Worker / Technician
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3" /> Inventory Manager
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-300 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-500" /> {s.phone}
                      </p>
                      {s.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-500" /> {s.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Provision Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Provision Showroom Staff Member"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('WORKER')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'WORKER'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Wrench className="w-5 h-5" />
                <span>Worker (Technician)</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('INVENTORY_MANAGER')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  role === 'INVENTORY_MANAGER'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Inventory Manager</span>
              </button>
            </div>
          </div>

          <Input
            label="Full Name"
            placeholder="Ramesh Patel"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Mobile Phone Number (Login Username)"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            helperText="10-digit mobile number"
            required
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="ramesh@showroom.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createStaffMutation.isPending}>
              Provision Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
