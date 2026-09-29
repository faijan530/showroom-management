import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createSparePartSchema = z.object({
  part_name: z.string().min(2, 'Part name must be at least 2 characters'),
  part_code: z.string().min(2, 'Part code must be at least 2 characters'),
  category: z.string().default('General'),
  vehicle_type: z.enum(['BIKE', 'CAR', 'BOTH']).default('BOTH'),
  price: z.number().min(0, 'Price must be non-negative'),
  stock_quantity: z.number().int().min(0).default(0),
  min_stock_alert: z.number().int().min(0).default(5),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN']);

    if ((user.role === 'ADMIN' || user.role === 'INVENTORY_MANAGER') && !user.showroomId) {
      return ApiResponse.error('User is not assigned to any showroom', 400, 'NO_SHOWROOM_ASSIGNED');
    }

    const body = await req.json();
    const validation = createSparePartSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;
    const targetShowroomId = user.showroomId || body.showroom_id;

    if (!targetShowroomId) {
      return ApiResponse.error('Target showroom ID is required', 400, 'MISSING_SHOWROOM_ID');
    }

    const sparePart = await prisma.sparePart.create({
      data: {
        showroomId: targetShowroomId,
        partName: data.part_name,
        partCode: data.part_code,
        category: data.category,
        vehicleType: data.vehicle_type,
        price: data.price,
        stockQuantity: data.stock_quantity,
        minStockAlert: data.min_stock_alert,
        description: data.description || null,
        imageUrl: data.image_url || null,
      },
    });

    return ApiResponse.success(
      {
        spare_part: {
          id: sparePart.id,
          showroom_id: sparePart.showroomId,
          part_name: sparePart.partName,
          part_code: sparePart.partCode,
          category: sparePart.category,
          vehicle_type: sparePart.vehicleType,
          price: sparePart.price,
          stock_quantity: sparePart.stockQuantity,
          min_stock_alert: sparePart.minStockAlert,
          description: sparePart.description,
          image_url: sparePart.imageUrl,
          created_at: sparePart.createdAt,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showroomId = searchParams.get('showroom_id');
    const category = searchParams.get('category');
    const vehicleType = searchParams.get('vehicle_type') as 'BIKE' | 'CAR' | 'BOTH' | null;
    const lowStock = searchParams.get('low_stock') === 'true';
    const search = searchParams.get('search');

    const whereClause: any = {};

    if (showroomId) {
      whereClause.showroomId = showroomId;
    }
    if (category) {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }
    if (vehicleType) {
      whereClause.vehicleType = vehicleType;
    }
    if (search) {
      whereClause.OR = [
        { partName: { contains: search, mode: 'insensitive' } },
        { partCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const spareParts = await prisma.sparePart.findMany({
      where: whereClause,
      include: {
        showroom: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let filtered = spareParts;
    if (lowStock) {
      filtered = spareParts.filter((p) => p.stockQuantity <= p.minStockAlert);
    }

    const formatted = filtered.map((p) => ({
      id: p.id,
      showroom_id: p.showroomId,
      showroom_name: p.showroom?.name,
      showroom_code: p.showroom?.code,
      part_name: p.partName,
      part_code: p.partCode,
      category: p.category,
      vehicle_type: p.vehicleType,
      price: p.price,
      stock_quantity: p.stockQuantity,
      min_stock_alert: p.minStockAlert,
      is_low_stock: p.stockQuantity <= p.minStockAlert,
      description: p.description,
      image_url: p.imageUrl,
      created_at: p.createdAt,
    }));

    return ApiResponse.success({ spare_parts: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
