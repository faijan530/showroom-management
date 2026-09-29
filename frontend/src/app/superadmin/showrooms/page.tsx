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
import { Store, UserPlus, Power, Plus, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface Showroom {
  id: string;
  name: string;
  code: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  logo_url?: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  user_count: number;
  created_at: string;
}

interface ShowroomsResponse {
  success: boolean;
  data: { showrooms: Showroom[] };
}

export default function SuperadminShowroomsPage() {
  const [isShowroomModalOpen, setIsShowroomModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);

  // New Showroom Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Provision Admin Form state
  const [adminFullName, setAdminFullName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ShowroomsResponse>({
    queryKey: ['superadmin-showrooms'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  const showrooms = data?.data?.showrooms || [];

  // Create Showroom Mutation
  const createShowroomMutation = useMutation({
    mutationFn: (body: any) => apiClient('/superadmin/showrooms', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', 'Showroom created successfully!');
      setIsShowroomModalOpen(false);
      resetShowroomForm();
      queryClient.invalidateQueries({ queryKey: ['superadmin-showrooms'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to create showroom'),
  });

  // Provision Admin Mutation
  const createAdminMutation = useMutation({
    mutationFn: (body: any) => apiClient('/superadmin/admins', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast('success', `Admin created for showroom: ${selectedShowroom?.name}`);
      setIsAdminModalOpen(false);
      resetAdminForm();
      queryClient.invalidateQueries({ queryKey: ['superadmin-showrooms'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to provision admin'),
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient(`/superadmin/showrooms/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast('success', 'Showroom status updated!');
      queryClient.invalidateQueries({ queryKey: ['superadmin-showrooms'] });
    },
    onError: (err: any) => toast('error', err.message || 'Failed to update status'),
  });

  const resetShowroomForm = () => {
    setName('');
    setCode('');
    setAddress('');
    setContactPhone('');
    setContactEmail('');
  };

  const resetAdminForm = () => {
    setAdminFullName('');
    setAdminPhone('');
    setAdminEmail('');
    setAdminPassword('');
    setSelectedShowroom(null);
  };

  const handleCreateShowroom = (e: React.FormEvent) => {
    e.preventDefault();
    createShowroomMutation.mutate({
      name,
      code: code.toUpperCase(),
      address,
      contact_phone: contactPhone.replace(/\D/g, ''),
      contact_email: contactEmail,
    });
  };

  const handleProvisionAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShowroom) return;
    createAdminMutation.mutate({
      showroom_id: selectedShowroom.id,
      full_name: adminFullName,
      phone: adminPhone.replace(/\D/g, ''),
      email: adminEmail || undefined,
      password: adminPassword,
    });
  };

  return (
    <PageWrapper
      title="Showroom Management"
      description="Onboard showrooms, toggle status, and provision dedicated Showroom Admin credentials."
      action={
        <Button variant="primary" onClick={() => setIsShowroomModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Onboard New Showroom
        </Button>
      }
    >
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Showroom</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Contact Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Staff & Users</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading showrooms...
                </TableCell>
              </TableRow>
            ) : showrooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No showrooms registered yet. Click &quot;Onboard New Showroom&quot; to get started.
                </TableCell>
              </TableRow>
            ) : (
              showrooms.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-bold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-400" />
                      <span>{s.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {s.address}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-indigo-400">{s.code}</TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-300 space-y-0.5">
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-500" /> {s.contact_phone}
                      </p>
                      <p className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-500" /> {s.contact_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : 'error'}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-300">{s.user_count} Users</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedShowroom(s);
                          setIsAdminModalOpen(true);
                        }}
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Provision Admin
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: s.id,
                            status: s.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                          })
                        }
                      >
                        <Power
                          className={`w-3.5 h-3.5 ${s.status === 'ACTIVE' ? 'text-amber-400' : 'text-emerald-400'}`}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Onboard Showroom Modal */}
      <Modal
        isOpen={isShowroomModalOpen}
        onClose={() => setIsShowroomModalOpen(false)}
        title="Onboard New Showroom"
      >
        <form onSubmit={handleCreateShowroom} className="space-y-4">
          <Input
            label="Showroom Name"
            placeholder="Apex Motors Bangalore"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Showroom Code (Unique)"
            placeholder="APEX-BLR-01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            helperText="Uppercase unique identifier"
            required
          />
          <Input
            label="Address"
            placeholder="100 Feet Road, Indiranagar, Bangalore"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <Input
            label="Contact Phone"
            placeholder="9876543210"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            placeholder="contact@apexmotors.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsShowroomModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createShowroomMutation.isPending}>
              Create Showroom
            </Button>
          </div>
        </form>
      </Modal>

      {/* Provision Showroom Admin Credentials Modal */}
      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title={`Provision Admin — ${selectedShowroom?.name}`}
      >
        <form onSubmit={handleProvisionAdmin} className="space-y-4">
          <Input
            label="Admin Full Name"
            placeholder="Rajesh Kumar"
            value={adminFullName}
            onChange={(e) => setAdminFullName(e.target.value)}
            required
          />
          <Input
            label="Admin Phone Number (Used for Login)"
            placeholder="9876543210"
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            helperText="10-digit mobile number"
            required
          />
          <Input
            label="Admin Email (Optional)"
            type="email"
            placeholder="rajesh@apexmotors.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Admin will be strictly bound to {selectedShowroom?.name} (`showroom_id`).</span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsAdminModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createAdminMutation.isPending}>
              Provision Admin
            </Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
