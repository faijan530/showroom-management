import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const customerServiceRequestSchema = z.object({
  target_showroom_id: z.string().uuid('Please select a valid showroom'),
  customer_vehicle_id: z.string().uuid().optional().or(z.literal('')),
  vehicle_type: z.enum(['BIKE', 'CAR']).default('BIKE'),
  vehicle_details: z.string().min(2, 'Vehicle details are required'),
  service_description: z.string().min(5, 'Service description must be at least 5 characters'),
  preferred_date: z.string().optional().or(z.literal('')),
  time_slot: z.string().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN']);
    const body = await req.json();

    const validation = customerServiceRequestSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    const serviceJob = await prisma.serviceJob.create({
      data: {
        showroomId: data.target_showroom_id,
        userId: user.id,
        customerVehicleId: data.customer_vehicle_id || null,
        customerName: user.fullName,
        customerPhone: user.phone,
        vehicleType: data.vehicle_type,
        vehicleDetails: data.vehicle_details,
        serviceDescription: data.service_description,
        preferredDate: data.preferred_date ? new Date(data.preferred_date) : null,
        timeSlot: data.time_slot || null,
        status: 'REQUESTED',
        workerApproval: 'PENDING',
      },
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

    return ApiResponse.success(
      {
        service_request: {
          id: serviceJob.id,
          showroom_id: serviceJob.showroomId,
          showroom_name: serviceJob.showroom?.name,
          customer_name: serviceJob.customerName,
          customer_phone: serviceJob.customerPhone,
          vehicle_type: serviceJob.vehicleType,
          vehicle_details: serviceJob.vehicleDetails,
          service_description: serviceJob.serviceDescription,
          preferred_date: serviceJob.preferredDate,
          time_slot: serviceJob.timeSlot,
          status: serviceJob.status,
          created_at: serviceJob.createdAt,
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

    const requests = await prisma.serviceJob.findMany({
      where: {
        OR: [
          { userId: user.id },
          { customerPhone: user.phone },
        ],
      },
      include: {
        showroom: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        assignedWorker: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = requests.map((j) => ({
      id: j.id,
      showroom_id: j.showroomId,
      showroom_name: j.showroom?.name,
      customer_name: j.customerName,
      customer_phone: j.customerPhone,
      vehicle_type: j.vehicleType,
      vehicle_details: j.vehicleDetails,
      service_description: j.serviceDescription,
      preferred_date: j.preferredDate,
      time_slot: j.timeSlot,
      assigned_worker_name: j.assignedWorker?.fullName,
      status: j.status,
      status_notes: j.statusNotes,
      status_updated_at: j.statusUpdatedAt,
      created_at: j.createdAt,
    }));

    return ApiResponse.success({ service_requests: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
