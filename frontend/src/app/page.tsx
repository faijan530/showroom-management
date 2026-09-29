'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { StatCard } from '@/components/data-display/stat-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/data-display/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { Store, Users, Cpu, ShieldCheck } from 'lucide-react';

const mockSystemRoles = [
  { role: 'SUPERADMIN', description: 'Global system administrator across all showrooms.', permissions: 'Full System Access' },
  { role: 'ADMIN', description: 'Showroom collection owner & operations manager.', permissions: 'Showroom Scoped CRUD' },
  { role: 'WORKER', description: 'Workshop technician viewing & fulfilling service jobs.', permissions: 'Task Updates & Timestamps' },
  { role: 'INVENTORY_MANAGER', description: 'Manages vehicle specs and spare parts catalog.', permissions: 'Catalog Management' },
  { role: 'USER', description: 'Customer browsing marketplace, booking services & parts.', permissions: 'Marketplace End-User' },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  return (
    <PageWrapper
      title="Platform Foundation (Module 001)"
      description="Base architecture initialized with Next.js App Router, Prisma ORM, Zod, and TanStack Query."
      action={
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          View Platform Metadata
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Platform Modules" value="19 Modules" change="Module 001 Live" isPositive icon={Cpu} />
          <StatCard title="Database Engine" value="PostgreSQL" change="Prisma Singleton" isPositive icon={ShieldCheck} iconColor="text-emerald-400" />
          <StatCard title="System Roles" value="5 Roles" change="Multi-Tenant Scoped" isPositive icon={Users} iconColor="text-indigo-400" />
          <StatCard title="Architecture" value="App Router" change="React 19 + TypeScript" isPositive icon={Store} iconColor="text-amber-400" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">System Roles & Access Control Baseline</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast('info', 'Platform Foundation architecture validated successfully.')}
            >
              Test System Notification
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>System Role</TableHead>
                <TableHead>Scope & Description</TableHead>
                <TableHead>Access Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSystemRoles.map((r) => (
                <TableRow key={r.role}>
                  <TableCell className="font-mono text-xs font-bold text-blue-400">{r.role}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell>
                    <Badge variant={r.role === 'SUPERADMIN' ? 'error' : r.role === 'ADMIN' ? 'warning' : 'info'}>
                      {r.permissions}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Platform Foundation Specifications">
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">Backend Layer:</strong> Next.js API Routes, Prisma ORM, Zod Runtime Validation, Health Check API (`/api/health`).
          </p>
          <p>
            <strong className="text-white">Frontend Layer:</strong> App Router, TanStack Query, Custom CSS Tokens, Health Monitor Badge.
          </p>
          <div className="pt-4 flex justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
