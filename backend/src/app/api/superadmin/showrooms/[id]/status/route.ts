import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authorizeRoles(req, ['SUPERADMIN']);
    const { id } = await params;

    const body = await req.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { status } = validation.data;

    const showroom = await prisma.showroom.findUnique({
      where: { id },
    });

    if (!showroom) {
      return ApiResponse.error('Showroom not found', 404, 'NOT_FOUND');
    }

    const updatedShowroom = await prisma.showroom.update({
      where: { id },
      data: { status },
    });

    return ApiResponse.success({
      showroom: {
        id: updatedShowroom.id,
        name: updatedShowroom.name,
        code: updatedShowroom.code,
        status: updatedShowroom.status,
        updated_at: updatedShowroom.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
