import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const updateVehicleSchema = z.object({
  title: z.string().min(2).optional(),
  type: z.enum(['BIKE', 'CAR']).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2050).optional(),
  price: z.number().min(0).optional(),
  color: z.string().min(1).optional(),
  engine_cc: z.number().int().min(1).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        showroom: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
      },
    });

    if (!vehicle) {
      return ApiResponse.error('Vehicle not found', 404, 'NOT_FOUND');
    }

    return ApiResponse.success({
      vehicle: {
        id: vehicle.id,
        showroom_id: vehicle.showroomId,
        showroom: vehicle.showroom,
        title: vehicle.title,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        color: vehicle.color,
        engine_cc: vehicle.engineCc,
        stock_quantity: vehicle.stockQuantity,
        description: vehicle.description,
        image_url: vehicle.imageUrl,
        created_at: vehicle.createdAt,
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

    const existing = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Vehicle not found', 404, 'NOT_FOUND');
    }

    if (user.role !== 'SUPERADMIN' && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot modify vehicles of another showroom', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const validation = updateVehicleSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: data.year,
        price: data.price,
        color: data.color,
        engineCc: data.engine_cc,
        stockQuantity: data.stock_quantity,
        description: data.description,
        imageUrl: data.image_url || null,
      },
    });

    return ApiResponse.success({ vehicle: updated });
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
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN']);
    const { id } = await params;

    const existing = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Vehicle not found', 404, 'NOT_FOUND');
    }

    if (user.role !== 'SUPERADMIN' && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot delete vehicles of another showroom', 403, 'FORBIDDEN');
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return ApiResponse.success({ message: 'Vehicle listing deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
