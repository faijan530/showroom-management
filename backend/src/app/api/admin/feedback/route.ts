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

    const feedbacks = await prisma.serviceFeedback.findMany({
      where: whereClause,
      include: {
        user: { select: { fullName: true, phone: true } },
        showroom: { select: { name: true, code: true } },
        serviceJob: { select: { vehicleDetails: true, serviceDescription: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = feedbacks.map((f) => ({
      id: f.id,
      customer_name: f.user?.fullName,
      customer_phone: f.user?.phone,
      showroom_id: f.showroomId,
      showroom_name: f.showroom?.name,
      vehicle_details: f.serviceJob?.vehicleDetails,
      service_description: f.serviceJob?.serviceDescription,
      rating: f.rating,
      comment: f.comment,
      status: f.status,
      admin_response: f.adminResponse,
      responded_at: f.respondedAt,
      created_at: f.createdAt,
    }));

    return ApiResponse.success({ feedbacks: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
