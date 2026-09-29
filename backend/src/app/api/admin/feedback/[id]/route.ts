import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const updateFeedbackSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  admin_response: z.string().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN']);
    const { id } = await params;

    const existing = await prisma.serviceFeedback.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Feedback record not found', 404, 'NOT_FOUND');
    }

    if (user.role !== 'SUPERADMIN' && user.showroomId && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot moderate feedback of another showroom', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const validation = updateFeedbackSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const updated = await prisma.serviceFeedback.update({
      where: { id },
      data: {
        status: data.status || existing.status,
        adminResponse: data.admin_response !== undefined ? data.admin_response : existing.adminResponse,
        respondedAt: data.admin_response ? new Date() : existing.respondedAt,
        updatedAt: new Date(),
      },
    });

    return ApiResponse.success({
      feedback: {
        id: updated.id,
        status: updated.status,
        admin_response: updated.adminResponse,
        responded_at: updated.respondedAt,
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
