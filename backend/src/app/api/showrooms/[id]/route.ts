import { NextRequest } from 'next/server';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const showroom = await prisma.showroom.findUnique({
      where: { id },
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
    });

    if (!showroom) {
      return ApiResponse.error('Showroom not found', 404, 'SHOWROOM_NOT_FOUND');
    }

    return ApiResponse.success({
      showroom: {
        id: showroom.id,
        name: showroom.name,
        code: showroom.code,
        address: showroom.address,
        contactPhone: showroom.contactPhone,
        contactEmail: showroom.contactEmail,
        logo_url: showroom.logoUrl,
        status: showroom.status,
        created_at: showroom.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
