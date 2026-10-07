import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createServiceJobSchema = z.object({
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters'),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
  vehicle_type: z.enum(['BIKE', 'CAR']).default('BIKE'),
  vehicle_details: z.string().min(2, 'Vehicle details are required (e.g., Model & Reg Number)'),
  service_description: z.string().min(5, 'Service description must be at least 5 characters'),
  assigned_worker_id: z.string().uuid().optional().or(z.literal('')),
  target_showroom_id: z.string().uuid().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'WORKER', 'SUPERADMIN', 'USER']);
    const body = await req.json();

    const validation = createServiceJobSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;
    let targetShowroomId = user.showroomId || data.target_showroom_id;

    if (!targetShowroomId) {
      const defaultShowroom = await prisma.showroom.findFirst({
        where: { status: 'ACTIVE' },
      });
      targetShowroomId = defaultShowroom?.id;
    }

    if (!targetShowroomId) {
      return ApiResponse.error('Target showroom ID is required', 400, 'MISSING_SHOWROOM_ID');
    }

    const assignedWorkerId = data.assigned_worker_id ? data.assigned_worker_id : null;
    const initialStatus = assignedWorkerId ? 'ASSIGNED' : 'REQUESTED';

    const serviceJob = await prisma.serviceJob.create({
      data: {
        showroomId: targetShowroomId,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        vehicleType: data.vehicle_type,
        vehicleDetails: data.vehicle_details,
        serviceDescription: data.service_description,
        assignedWorkerId: assignedWorkerId,
        workerApproval: assignedWorkerId ? 'PENDING' : 'PENDING',
        status: initialStatus,
      },
      include: {
        assignedWorker: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    return ApiResponse.success(
      {
        service_job: {
          id: serviceJob.id,
          showroom_id: serviceJob.showroomId,
          customer_name: serviceJob.customerName,
          customer_phone: serviceJob.customerPhone,
          vehicle_type: serviceJob.vehicleType,
          vehicle_details: serviceJob.vehicleDetails,
          service_description: serviceJob.serviceDescription,
          assigned_worker_id: serviceJob.assignedWorkerId,
          assigned_worker_name: serviceJob.assignedWorker?.fullName,
          worker_approval: serviceJob.workerApproval,
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
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'WORKER', 'SUPERADMIN']);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;

    const whereClause: any = {};

    if (user.role === 'WORKER') {
      whereClause.assignedWorkerId = user.id;
    } else if (user.role !== 'SUPERADMIN' && user.showroomId) {
      whereClause.showroomId = user.showroomId;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const serviceJobs = await prisma.serviceJob.findMany({
      where: whereClause,
      include: {
        assignedWorker: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
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

    const formatted = serviceJobs.map((job) => ({
      id: job.id,
      showroom_id: job.showroomId,
      showroom_name: job.showroom?.name,
      customer_name: job.customerName,
      customer_phone: job.customerPhone,
      vehicle_type: job.vehicleType,
      vehicle_details: job.vehicleDetails,
      service_description: job.serviceDescription,
      assigned_worker_id: job.assignedWorkerId,
      assigned_worker_name: job.assignedWorker?.fullName,
      assigned_worker_phone: job.assignedWorker?.phone,
      worker_approval: job.workerApproval,
      status: job.status,
      status_notes: job.statusNotes,
      status_updated_at: job.statusUpdatedAt,
      created_at: job.createdAt,
    }));

    return ApiResponse.success({ service_jobs: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
