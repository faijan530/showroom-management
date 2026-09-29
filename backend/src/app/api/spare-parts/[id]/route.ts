import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const updateSparePartSchema = z.object({
  part_name: z.string().min(2).optional(),
  part_code: z.string().min(2).optional(),
  category: z.string().optional(),
  vehicle_type: z.enum(['BIKE', 'CAR', 'BOTH']).optional(),
  price: z.number().min(0).optional(),
  stock_quantity: z.number().int().min(0).optional(),
  min_stock_alert: z.number().int().min(0).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const part = await prisma.sparePart.findUnique({
      where: { id },
      include: {
        showroom: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!part) {
      return ApiResponse.error('Spare part not found', 404, 'NOT_FOUND');
    }

    return ApiResponse.success({
      spare_part: {
        id: part.id,
        showroom_id: part.showroomId,
        showroom: part.showroom,
        part_name: part.partName,
        part_code: part.partCode,
        category: part.category,
        vehicle_type: part.vehicleType,
        price: part.price,
        stock_quantity: part.stockQuantity,
        min_stock_alert: part.minStockAlert,
        is_low_stock: part.stockQuantity <= part.minStockAlert,
        description: part.description,
        image_url: part.imageUrl,
        created_at: part.createdAt,
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

    const existing = await prisma.sparePart.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Spare part not found', 404, 'NOT_FOUND');
    }

    if (user.role !== 'SUPERADMIN' && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot modify spare parts of another showroom', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const validation = updateSparePartSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const updated = await prisma.sparePart.update({
      where: { id },
      data: {
        partName: data.part_name,
        partCode: data.part_code,
        category: data.category,
        vehicleType: data.vehicle_type,
        price: data.price,
        stockQuantity: data.stock_quantity,
        minStockAlert: data.min_stock_alert,
        description: data.description,
        imageUrl: data.image_url || null,
      },
    });

    return ApiResponse.success({ spare_part: updated });
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

    const existing = await prisma.sparePart.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Spare part not found', 404, 'NOT_FOUND');
    }

    if (user.role !== 'SUPERADMIN' && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot delete spare parts of another showroom', 403, 'FORBIDDEN');
    }

    await prisma.sparePart.delete({
      where: { id },
    });

    return ApiResponse.success({ message: 'Spare part listing deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
