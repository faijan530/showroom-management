import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN', 'WORKER', 'INVENTORY_MANAGER']);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const showroomId = user.role === 'SUPERADMIN' ? (searchParams.get('showroomId') || undefined) : (user.showroomId || undefined);
    const showroomFilter = showroomId ? { showroomId } : {};

    // Fetch latest activity & audit logs
    const [auditLogs, recentJobs, recentPartRequests] = await Promise.all([
      prisma.auditLog.findMany({
        where: showroomFilter,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { actor: { select: { fullName: true, role: true } } },
      }),
      prisma.serviceJob.findMany({
        where: showroomFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, customerName: true, serviceDescription: true, status: true, createdAt: true },
      }),
      prisma.sparePartRequest.findMany({
        where: showroomFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, partName: true, quantity: true, status: true, createdAt: true },
      }),
    ]);

    // Format feed items
    const feed: Array<{
      id: string;
      type: 'AUDIT' | 'SERVICE_JOB' | 'PART_REQUEST';
      title: string;
      description: string;
      actorName?: string;
      actorRole?: string;
      status?: string;
      createdAt: string;
    }> = [];

    auditLogs.forEach((log) => {
      feed.push({
        id: `audit-${log.id}`,
        type: 'AUDIT',
        title: log.action.replace(/_/g, ' '),
        description: `Target entity: ${log.entity} (${log.entityId || 'N/A'})`,
        actorName: log.actor?.fullName || 'System',
        actorRole: log.actorRole || 'SYSTEM',
        createdAt: log.createdAt.toISOString(),
      });
    });

    recentJobs.forEach((job) => {
      feed.push({
        id: `job-${job.id}`,
        type: 'SERVICE_JOB',
        title: `Service Request: ${job.customerName}`,
        description: job.serviceDescription,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
      });
    });

    recentPartRequests.forEach((part) => {
      feed.push({
        id: `part-${part.id}`,
        type: 'PART_REQUEST',
        title: `Part Request: ${part.partName} (x${part.quantity})`,
        description: `Order status: ${part.status}`,
        status: part.status,
        createdAt: part.createdAt.toISOString(),
      });
    });

    // Sort combined feed by createdAt DESC
    feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return ApiResponse.success({
      activities: feed.slice(0, limit),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    console.error('Error fetching recent activity:', error);
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
