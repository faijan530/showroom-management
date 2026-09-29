import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createPartRequestSchema = z.object({
  showroom_id: z.string().uuid('Please select a valid showroom'),
  spare_part_id: z.string().uuid().optional().nullable(),
  part_name: z.string().min(2, 'Part name is required'),
  quantity: z.number().int().min(1).default(1),
  vehicle_details: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN', 'INVENTORY_MANAGER']);
    const body = await req.json();

    const validation = createPartRequestSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const partRequest = await prisma.sparePartRequest.create({
      data: {
        userId: user.id,
        showroomId: data.showroom_id,
        sparePartId: data.spare_part_id || null,
        partName: data.part_name,
        quantity: data.quantity,
        vehicleDetails: data.vehicle_details || null,
        notes: data.notes || null,
        status: 'REQUESTED',
      },
      include: {
        showroom: {
          select: { name: true, code: true },
        },
      },
    });

    return ApiResponse.success(
      {
        part_request: {
          id: partRequest.id,
          showroom_id: partRequest.showroomId,
          showroom_name: partRequest.showroom.name,
          part_name: partRequest.partName,
          quantity: partRequest.quantity,
          vehicle_details: partRequest.vehicleDetails,
          notes: partRequest.notes,
          status: partRequest.status,
          created_at: partRequest.createdAt,
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
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN', 'INVENTORY_MANAGER']);

    const requests = await prisma.sparePartRequest.findMany({
      where: { userId: user.id },
      include: {
        showroom: {
          select: { name: true, code: true },
        },
        sparePart: {
          select: { price: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = requests.map((r) => ({
      id: r.id,
      showroom_id: r.showroomId,
      showroom_name: r.showroom?.name,
      part_name: r.partName,
      quantity: r.quantity,
      vehicle_details: r.vehicleDetails,
      notes: r.notes,
      status: r.status,
      estimated_delivery: r.estimatedDelivery,
      response_notes: r.responseNotes,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    }));

    return ApiResponse.success({ part_requests: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
