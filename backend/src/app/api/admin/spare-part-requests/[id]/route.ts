import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const updatePartRequestSchema = z.object({
  status: z.enum([
    'REQUESTED',
    'UNDER_REVIEW',
    'ORDERED',
    'IN_TRANSIT',
    'RECEIVED',
    'READY',
    'COMPLETED',
    'CANCELLED',
  ]).optional(),
  estimated_delivery: z.string().optional().nullable(),
  response_notes: z.string().optional().nullable(),
  assigned_worker_id: z.string().uuid().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN']);
    const { id } = await params;

    const existing = await prisma.sparePartRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Spare part request not found', 404, 'NOT_FOUND');
    }

    if (user.role !== 'SUPERADMIN' && user.showroomId && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot update request of another showroom', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const validation = updatePartRequestSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const updated = await prisma.sparePartRequest.update({
      where: { id },
      data: {
        status: data.status || existing.status,
        estimatedDelivery: data.estimated_delivery !== undefined ? (data.estimated_delivery ? new Date(data.estimated_delivery) : null) : existing.estimatedDelivery,
        responseNotes: data.response_notes !== undefined ? data.response_notes : existing.responseNotes,
        assignedWorkerId: data.assigned_worker_id !== undefined ? data.assigned_worker_id : existing.assignedWorkerId,
        updatedAt: new Date(),
      },
    });

    return ApiResponse.success({
      part_request: {
        id: updated.id,
        status: updated.status,
        estimated_delivery: updated.estimatedDelivery,
        response_notes: updated.responseNotes,
        assigned_worker_id: updated.assignedWorkerId,
        updated_at: updated.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
