'use client';

import React from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Users, Store, ShieldCheck, ShieldAlert } from 'lucide-react';

interface ShowroomsResponse {
  success: boolean;
  data: {
    showrooms: Array<{
      id: string;
      name: string;
      code: string;
      status: string;
      user_count: number;
    }>;
  };
}

export default function PlatformUsersPage() {
  const { data, isLoading } = useQuery<ShowroomsResponse>({
    queryKey: ['superadmin-showrooms-users'],
    queryFn: () => apiClient<ShowroomsResponse>('/superadmin/showrooms'),
  });

  const showrooms = data?.data?.showrooms || [];
  const totalUsers = showrooms.reduce((acc, curr) => acc + curr.user_count, 0);

  return (
    <PageWrapper
      title="Platform & Showroom Users"
      description="Global directory of platform administrators and showroom staff count across operational tenancies."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card glass className="border-rose-900/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Global Superadmins</p>
                <p className="text-xl font-extrabold text-white">1 Active</p>
              </div>
            </CardContent>
          </Card>

          <Card glass className="border-gray-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Total Registered Users</p>
                <p className="text-xl font-extrabold text-white">{isLoading ? '...' : totalUsers}</p>
              </div>
            </CardContent>
          </Card>

          <Card glass className="border-gray-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Showroom Tenancies</p>
                <p className="text-xl font-extrabold text-white">{isLoading ? '...' : showrooms.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card glass className="border-gray-800">
          <CardHeader>
            <CardTitle>Tenancy User Allocation</CardTitle>
            <CardDescription>User distribution across registered platform showrooms</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Showroom Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User Allocation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      Loading user allocations...
                    </TableCell>
                  </TableRow>
                ) : showrooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No showrooms registered yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  showrooms.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-semibold text-white">{s.name}</TableCell>
                      <TableCell className="font-mono text-xs text-rose-400 font-bold">{s.code}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'ACTIVE' ? 'success' : 'error'}>{s.status}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-gray-200">{s.user_count} Users</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
