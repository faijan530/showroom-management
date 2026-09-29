import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const updateEnquirySchema = z.object({
  status: z.enum(['PENDING', 'RESPONDED', 'CLOSED']).optional(),
  response_notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN']);
    const { id } = await params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        targetShowroom: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!enquiry) {
      return ApiResponse.error('Enquiry not found', 404, 'NOT_FOUND');
    }

    if (
      user.role !== 'SUPERADMIN' &&
      user.showroomId &&
      enquiry.targetShowroomId &&
      enquiry.targetShowroomId !== user.showroomId &&
      !enquiry.broadcastToAll
    ) {
      return ApiResponse.error('Forbidden: Cannot access enquiry of another showroom', 403, 'FORBIDDEN');
    }

    return ApiResponse.success({
      enquiry: {
        id: enquiry.id,
        customer_name: enquiry.customerName,
        customer_phone: enquiry.customerPhone,
        customer_email: enquiry.customerEmail,
        enquiry_type: enquiry.enquiryType,
        message: enquiry.message,
        target_showroom_id: enquiry.targetShowroomId,
        target_showroom: enquiry.targetShowroom,
        broadcast_to_all: enquiry.broadcastToAll,
        status: enquiry.status,
        response_notes: enquiry.responseNotes,
        created_at: enquiry.createdAt,
        updated_at: enquiry.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN']);
    const { id } = await params;

    const existing = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Enquiry not found', 404, 'NOT_FOUND');
    }

    if (
      user.role !== 'SUPERADMIN' &&
      user.showroomId &&
      existing.targetShowroomId &&
      existing.targetShowroomId !== user.showroomId &&
      !existing.broadcastToAll
    ) {
      return ApiResponse.error('Forbidden: Cannot modify enquiry of another showroom', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const validation = updateEnquirySchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        status: data.status,
        responseNotes: data.response_notes !== undefined ? data.response_notes : existing.responseNotes,
      },
    });

    return ApiResponse.success({
      enquiry: {
        id: updated.id,
        status: updated.status,
        response_notes: updated.responseNotes,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN']);
    const { id } = await params;

    const existing = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Enquiry not found', 404, 'NOT_FOUND');
    }

    if (
      user.role !== 'SUPERADMIN' &&
      user.showroomId &&
      existing.targetShowroomId &&
      existing.targetShowroomId !== user.showroomId &&
      !existing.broadcastToAll
    ) {
      return ApiResponse.error('Forbidden: Cannot delete enquiry of another showroom', 403, 'FORBIDDEN');
    }

    await prisma.enquiry.delete({
      where: { id },
    });

    return ApiResponse.success({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
