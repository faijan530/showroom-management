import { NextRequest } from 'next/server';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const showrooms = await prisma.showroom.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        contactPhone: true,
        contactEmail: true,
        logoUrl: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedShowrooms = showrooms.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      address: s.address,
      contactPhone: s.contactPhone,
      contactEmail: s.contactEmail,
      logo_url: s.logoUrl,
      status: s.status,
      created_at: s.createdAt,
    }));

    return ApiResponse.success({ showrooms: formattedShowrooms });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
