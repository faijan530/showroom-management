import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const stockAdjustmentSchema = z.object({
  item_type: z.enum(['VEHICLE', 'SPARE_PART']),
  item_id: z.string().uuid('Invalid item ID'),
  adjustment_type: z.enum(['SET', 'INCREMENT', 'DECREMENT']),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['INVENTORY_MANAGER', 'ADMIN', 'SUPERADMIN']);
    const body = await req.json();

    const validation = stockAdjustmentSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { item_type, item_id, adjustment_type, quantity, reason } = validation.data;

    if (item_type === 'VEHICLE') {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: item_id },
      });

      if (!vehicle) {
        return ApiResponse.error('Vehicle not found', 404, 'NOT_FOUND');
      }

      if (user.role !== 'SUPERADMIN' && user.showroomId && vehicle.showroomId !== user.showroomId) {
        return ApiResponse.error('Forbidden: Cannot modify inventory of another showroom', 403, 'FORBIDDEN');
      }

      let newStock = vehicle.stockQuantity;
      if (adjustment_type === 'SET') {
        newStock = quantity;
      } else if (adjustment_type === 'INCREMENT') {
        newStock += quantity;
      } else if (adjustment_type === 'DECREMENT') {
        newStock = Math.max(0, newStock - quantity);
      }

      const updatedVehicle = await prisma.vehicle.update({
        where: { id: item_id },
        data: {
          stockQuantity: newStock,
          updatedAt: new Date(),
        },
      });

      return ApiResponse.success({
        item_type: 'VEHICLE',
        item_id: updatedVehicle.id,
        title: updatedVehicle.title,
        previous_stock: vehicle.stockQuantity,
        new_stock: updatedVehicle.stockQuantity,
        reason: reason || 'Stock level adjusted by inventory manager',
        updated_at: updatedVehicle.updatedAt,
      });
    } else {
      const sparePart = await prisma.sparePart.findUnique({
        where: { id: item_id },
      });

      if (!sparePart) {
        return ApiResponse.error('Spare part not found', 404, 'NOT_FOUND');
      }

      if (user.role !== 'SUPERADMIN' && user.showroomId && sparePart.showroomId !== user.showroomId) {
        return ApiResponse.error('Forbidden: Cannot modify inventory of another showroom', 403, 'FORBIDDEN');
      }

      let newStock = sparePart.stockQuantity;
      if (adjustment_type === 'SET') {
        newStock = quantity;
      } else if (adjustment_type === 'INCREMENT') {
        newStock += quantity;
      } else if (adjustment_type === 'DECREMENT') {
        newStock = Math.max(0, newStock - quantity);
      }

      const updatedSparePart = await prisma.sparePart.update({
        where: { id: item_id },
        data: {
          stockQuantity: newStock,
          updatedAt: new Date(),
        },
      });

      return ApiResponse.success({
        item_type: 'SPARE_PART',
        item_id: updatedSparePart.id,
        part_name: updatedSparePart.partName,
        part_code: updatedSparePart.partCode,
        previous_stock: sparePart.stockQuantity,
        new_stock: updatedSparePart.stockQuantity,
        is_low_stock: updatedSparePart.stockQuantity <= updatedSparePart.minStockAlert,
        reason: reason || 'Stock level adjusted by inventory manager',
        updated_at: updatedSparePart.updatedAt,
      });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
