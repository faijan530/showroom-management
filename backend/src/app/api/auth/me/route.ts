import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/middleware/auth.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const authUser = await authenticateRequest(req);

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
        showroomId: true,
        createdAt: true,
        showroom: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      return ApiResponse.error('User not found', 404, 'NOT_FOUND');
    }

    return ApiResponse.success({
      user: {
        id: user.id,
        full_name: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        showroom_id: user.showroomId,
        showroom_name: user.showroom?.name || null,
        showroom_code: user.showroom?.code || null,
        showroom: user.showroom || null,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
