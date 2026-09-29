import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createVehicleSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  type: z.enum(['BIKE', 'CAR']).default('BIKE'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(2050),
  price: z.number().min(0, 'Price must be positive'),
  color: z.string().min(1, 'Color is required'),
  engine_cc: z.number().int().min(1, 'Engine CC must be at least 1'),
  stock_quantity: z.number().int().min(0).default(1),
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
    const validation = createVehicleSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;
    const targetShowroomId = user.showroomId || body.showroom_id;

    if (!targetShowroomId) {
      return ApiResponse.error('Target showroom ID is required', 400, 'MISSING_SHOWROOM_ID');
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        showroomId: targetShowroomId,
        title: data.title,
        type: data.type,
        brand: data.brand,
        model: data.model,
        year: data.year,
        price: data.price,
        color: data.color,
        engineCc: data.engine_cc,
        stockQuantity: data.stock_quantity,
        description: data.description || null,
        imageUrl: data.image_url || null,
      },
    });

    return ApiResponse.success(
      {
        vehicle: {
          id: vehicle.id,
          showroom_id: vehicle.showroomId,
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
    const type = searchParams.get('type') as 'BIKE' | 'CAR' | null;
    const brand = searchParams.get('brand');
    const showroomId = searchParams.get('showroom_id');

    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }
    if (brand) {
      whereClause.brand = { contains: brand, mode: 'insensitive' };
    }
    if (showroomId) {
      whereClause.showroomId = showroomId;
    }

    const vehicles = await prisma.vehicle.findMany({
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

    const formatted = vehicles.map((v) => ({
      id: v.id,
      showroom_id: v.showroomId,
      showroom_name: v.showroom?.name,
      showroom_code: v.showroom?.code,
      title: v.title,
      type: v.type,
      brand: v.brand,
      model: v.model,
      year: v.year,
      price: v.price,
      color: v.color,
      engine_cc: v.engineCc,
      stock_quantity: v.stockQuantity,
      description: v.description,
      image_url: v.imageUrl,
      created_at: v.createdAt,
    }));

    return ApiResponse.success({ vehicles: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
