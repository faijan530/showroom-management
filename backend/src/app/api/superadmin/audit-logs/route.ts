import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    await authorizeRoles(req, ['SUPERADMIN']);

    // 1. Query existing AuditLog records
    const dbLogs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        showroom: {
          select: { name: true, code: true },
        },
        actor: {
          select: { fullName: true, role: true, phone: true },
        },
      },
    });

    // 2. Fetch recent platform activity records across showrooms
    const recentShowrooms = await prisma.showroom.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const recentJobs = await prisma.serviceJob.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        showroom: { select: { name: true } },
        assignedWorker: { select: { fullName: true } },
      },
    });

    // Synthesize platform audit events
    const synthesizedLogs = [
      ...dbLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        actor_name: log.actor?.fullName || 'System Admin',
        actor_role: log.actorRole || 'SUPERADMIN',
        showroom_name: log.showroom?.name || 'Platform-Wide',
        created_at: log.createdAt,
      })),
      ...recentShowrooms.map((s) => ({
        id: `sr-${s.id}`,
        action: 'SHOWROOM_REGISTERED',
        entity: 'Showroom',
        actor_name: 'SuperAdmin Governance',
        actor_role: 'SUPERADMIN',
        showroom_name: s.name,
        created_at: s.createdAt,
      })),
      ...recentJobs.map((j) => ({
        id: `sj-${j.id}`,
        action: `SERVICE_JOB_${j.status}`,
        entity: 'ServiceJob',
        actor_name: j.assignedWorker?.fullName || j.customerName,
        actor_role: j.assignedWorker ? 'WORKER' : 'CUSTOMER',
        showroom_name: j.showroom.name,
        created_at: j.updatedAt,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 30);

    return ApiResponse.success({ logs: synthesizedLogs });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
