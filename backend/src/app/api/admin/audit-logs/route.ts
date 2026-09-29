import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN']);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 15));
    const skip = (page - 1) * limit;

    const action = searchParams.get('action') || undefined;
    const entity = searchParams.get('entity') || undefined;
    const actorRole = searchParams.get('actorRole') || undefined;

    const showroomId = adminUser.role === 'SUPERADMIN' ? (searchParams.get('showroomId') || undefined) : (adminUser.showroomId || undefined);

    const where: any = {
      ...(showroomId ? { showroomId } : {}),
      ...(action ? { action: { contains: action, mode: 'insensitive' } } : {}),
      ...(entity ? { entity: { equals: entity, mode: 'insensitive' } } : {}),
      ...(actorRole ? { actorRole: { equals: actorRole } } : {}),
    };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          actor: {
            select: { id: true, fullName: true, phone: true, role: true },
          },
          showroom: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
    ]);

    return ApiResponse.success({
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      auditLogs: logs.map((log) => ({
        id: log.id,
        showroomId: log.showroomId,
        showroomName: log.showroom?.name || 'N/A',
        actorId: log.actorId,
        actorName: log.actor?.fullName || 'System',
        actorPhone: log.actor?.phone || 'N/A',
        actorRole: log.actorRole || log.actor?.role || 'SYSTEM',
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    console.error('Error fetching audit logs:', error);
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
