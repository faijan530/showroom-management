import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN']);

    if (adminUser.role === 'ADMIN' && !adminUser.showroomId) {
      return ApiResponse.error('Admin is not assigned to any showroom', 400, 'NO_SHOWROOM_ASSIGNED');
    }

    const showroomId = adminUser.showroomId;

    // Fetch showroom details if assigned
    let showroomName = 'Global Overview';
    if (showroomId) {
      const showroom = await prisma.showroom.findUnique({
        where: { id: showroomId },
        select: { name: true },
      });
      if (showroom) {
        showroomName = showroom.name;
      }
    }

    // Count Workers & Inventory Managers in this showroom
    const workersCount = await prisma.user.count({
      where: {
        showroomId: showroomId || undefined,
        role: 'WORKER',
      },
    });

    const inventoryManagersCount = await prisma.user.count({
      where: {
        showroomId: showroomId || undefined,
        role: 'INVENTORY_MANAGER',
      },
    });

    return ApiResponse.success({
      summary: {
        showroom_id: showroomId,
        showroom_name: showroomName,
        total_staff: workersCount + inventoryManagersCount,
        workers_count: workersCount,
        inventory_managers_count: inventoryManagersCount,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
