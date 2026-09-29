import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN', 'INVENTORY_MANAGER']);
    const { id } = await params;

    const request = await prisma.sparePartRequest.findUnique({
      where: { id },
      include: {
        showroom: {
          select: { name: true, code: true, address: true, contactPhone: true },
        },
        assignedWorker: {
          select: { fullName: true, phone: true },
        },
      },
    });

    if (!request) {
      return ApiResponse.error('Spare part request not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'USER' && request.userId !== user.id) {
      return ApiResponse.error('Forbidden: Cannot access another user request', 403, 'FORBIDDEN');
    }

    return ApiResponse.success({
      part_request: {
        id: request.id,
        showroom_id: request.showroomId,
        showroom_name: request.showroom?.name,
        showroom_code: request.showroom?.code,
        showroom_address: request.showroom?.address,
        showroom_phone: request.showroom?.contactPhone,
        part_name: request.partName,
        quantity: request.quantity,
        vehicle_details: request.vehicleDetails,
        notes: request.notes,
        status: request.status,
        estimated_delivery: request.estimatedDelivery,
        response_notes: request.responseNotes,
        assigned_worker_name: request.assignedWorker?.fullName,
        created_at: request.createdAt,
        updated_at: request.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
