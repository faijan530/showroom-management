import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN']);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (user.role !== 'SUPERADMIN' && user.showroomId) {
      whereClause.showroomId = user.showroomId;
    }
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const requests = await prisma.sparePartRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: { fullName: true, phone: true },
        },
        showroom: {
          select: { name: true, code: true },
        },
        assignedWorker: {
          select: { fullName: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = requests.map((r) => ({
      id: r.id,
      customer_name: r.user?.fullName,
      customer_phone: r.user?.phone,
      showroom_id: r.showroomId,
      showroom_name: r.showroom?.name,
      part_name: r.partName,
      quantity: r.quantity,
      vehicle_details: r.vehicleDetails,
      notes: r.notes,
      status: r.status,
      estimated_delivery: r.estimatedDelivery,
      response_notes: r.responseNotes,
      assigned_worker_id: r.assignedWorkerId,
      assigned_worker_name: r.assignedWorker?.fullName,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    }));

    return ApiResponse.success({ part_requests: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
