import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createCustomerVehicleSchema = z.object({
  title: z.string().min(2, 'Vehicle title must be at least 2 characters'),
  vehicle_type: z.enum(['BIKE', 'CAR']).default('BIKE'),
  reg_number: z.string().min(3, 'Registration number is required (e.g. UP32 AB 1234)'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(2050),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN']);
    const body = await req.json();

    const validation = createCustomerVehicleSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const vehicle = await prisma.customerVehicle.create({
      data: {
        userId: user.id,
        title: data.title,
        vehicleType: data.vehicle_type,
        regNumber: data.reg_number,
        brand: data.brand,
        model: data.model,
        year: data.year,
      },
    });

    return ApiResponse.success(
      {
        vehicle: {
          id: vehicle.id,
          user_id: vehicle.userId,
          title: vehicle.title,
          vehicle_type: vehicle.vehicleType,
          reg_number: vehicle.regNumber,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
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
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN']);

    const vehicles = await prisma.customerVehicle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = vehicles.map((v) => ({
      id: v.id,
      user_id: v.userId,
      title: v.title,
      vehicle_type: v.vehicleType,
      reg_number: v.regNumber,
      brand: v.brand,
      model: v.model,
      year: v.year,
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
