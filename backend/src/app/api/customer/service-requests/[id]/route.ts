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
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN']);
    const { id } = await params;

    const request = await prisma.serviceJob.findUnique({
      where: { id },
      include: {
        showroom: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            contactPhone: true,
          },
        },
        assignedWorker: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!request) {
      return ApiResponse.error('Service request not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'USER' && request.userId !== user.id && request.customerPhone !== user.phone) {
      return ApiResponse.error('Forbidden: Cannot view service requests of another customer', 403, 'FORBIDDEN');
    }

    return ApiResponse.success({
      service_request: {
        id: request.id,
        showroom_id: request.showroomId,
        showroom: request.showroom,
        customer_name: request.customerName,
        customer_phone: request.customerPhone,
        vehicle_type: request.vehicleType,
        vehicle_details: request.vehicleDetails,
        service_description: request.serviceDescription,
        preferred_date: request.preferredDate,
        time_slot: request.timeSlot,
        assigned_worker_name: request.assignedWorker?.fullName,
        worker_approval: request.workerApproval,
        status: request.status,
        status_notes: request.statusNotes,
        status_updated_at: request.statusUpdatedAt,
        created_at: request.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
