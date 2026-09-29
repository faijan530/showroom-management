'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { FileText, Search, RefreshCw, ChevronLeft, ChevronRight, ShieldAlert, Code } from 'lucide-react';

interface AuditLogItem {
  id: string;
  showroomId?: string;
  showroomName: string;
  actorId?: string;
  actorName: string;
  actorPhone: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  data: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    auditLogs: AuditLogItem[];
  };
}

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const { data, isLoading, refetch } = useQuery<AuditLogsResponse>({
    queryKey: ['admin-audit-logs', page, actionFilter, entityFilter],
    queryFn: () =>
      apiClient<AuditLogsResponse>(
        `/admin/audit-logs?page=${page}&limit=12${
          actionFilter ? `&action=${encodeURIComponent(actionFilter)}` : ''
        }${entityFilter ? `&entity=${encodeURIComponent(entityFilter)}` : ''}`
      ),
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN'),
  });

  const logs = data?.data?.auditLogs || [];
  const pagination = data?.data?.pagination;

  return (
    <PageWrapper
      title="System Audit & Security Logs"
      description="Immutable operational audit trail, administrative actions, and entity modification logs."
      action={
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Logs
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card glass>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <Input
                placeholder="Filter by Action (e.g. FEEDBACK_MODERATED, SERVICE_JOB...)"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="w-full md:w-64">
              <Input
                placeholder="Filter by Entity (e.g. ServiceJob)"
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card glass>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Audit Trail Entries
              </span>
              <span className="text-xs text-gray-400 font-normal">
                Total Records: {pagination?.total ?? 0}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading audit logs...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No audit entries match the specified filters.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/60 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">Showroom</th>
                    <th className="p-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-900/40 transition-colors">
                      <td className="p-3.5 font-mono text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>
                      <td className="p-3.5 font-semibold text-gray-200">
                        {log.actorName}
                        {log.actorPhone !== 'N/A' && (
                          <span className="block text-[10px] text-gray-500 font-normal">
                            {log.actorPhone}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="neutral">{log.actorRole}</Badge>
                      </td>
                      <td className="p-3.5 font-mono text-blue-400 font-bold">
                        {log.action}
                      </td>
                      <td className="p-3.5 text-gray-300">
                        <span className="font-semibold">{log.entity}</span>
                        {log.entityId && (
                          <span className="block font-mono text-[10px] text-gray-500 truncate max-w-[120px]">
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-400">{log.showroomName}</td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Code className="w-3.5 h-3.5 mr-1" /> Metadata
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Metadata Inspector Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <Card glass className="w-full max-w-lg space-y-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-400" /> Audit Entry Detail
                </CardTitle>
                <CardDescription>Action: {selectedLog.action}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1 bg-gray-900 p-3 rounded-lg border border-gray-800 font-mono">
                  <p><span className="text-gray-500">ID:</span> {selectedLog.id}</p>
                  <p><span className="text-gray-500">Timestamp:</span> {selectedLog.createdAt}</p>
                  <p><span className="text-gray-500">Actor:</span> {selectedLog.actorName} ({selectedLog.actorRole})</p>
                  <p><span className="text-gray-500">Entity:</span> {selectedLog.entity} ({selectedLog.entityId || 'N/A'})</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-300 mb-1">Metadata Payload:</p>
                  <pre className="text-[11px] font-mono bg-black/80 text-emerald-400 p-3 rounded-lg overflow-x-auto border border-gray-800">
                    {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                  </pre>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="sm" onClick={() => setSelectedLog(null)}>
                    Close Inspector
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
