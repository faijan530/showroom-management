import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN']);

    const [
      serviceRequestsCount,
      partRequestsCount,
      vehiclesCount,
      enquiriesCount,
      recentServiceRequests,
      recentPartRequests
    ] = await Promise.all([
      prisma.serviceJob.count({ where: { userId: user.id } }),
      prisma.sparePartRequest.count({ where: { userId: user.id } }),
      prisma.customerVehicle.count({ where: { userId: user.id } }),
      prisma.enquiry.count({ where: { userId: user.id } }),
      prisma.serviceJob.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, serviceDescription: true, status: true, createdAt: true },
      }),
      prisma.sparePartRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, partName: true, status: true, createdAt: true },
      }),
    ]);

    return ApiResponse.success({
      serviceRequestsCount,
      partRequestsCount,
      vehiclesCount,
      enquiriesCount,
      recentServiceRequests: recentServiceRequests.map((s) => ({
        id: s.id,
        service_description: s.serviceDescription,
        status: s.status,
        created_at: s.createdAt,
      })),
      recentPartRequests: recentPartRequests.map((p) => ({
        id: p.id,
        part_name: p.partName,
        status: p.status,
        created_at: p.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    console.error('Error fetching customer dashboard summary:', error);
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
