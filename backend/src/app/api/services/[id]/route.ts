import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const updateServiceJobSchema = z.object({
  assigned_worker_id: z.string().uuid().optional().nullable(),
  worker_approval: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  status: z.enum(['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  status_notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'WORKER', 'SUPERADMIN']);
    const { id } = await params;

    const job = await prisma.serviceJob.findUnique({
      where: { id },
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
    });

    if (!job) {
      return ApiResponse.error('Service job not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'WORKER' && job.assignedWorkerId !== user.id) {
      return ApiResponse.error('Forbidden: Cannot access service jobs assigned to another technician', 403, 'FORBIDDEN');
    }

    if (user.role !== 'SUPERADMIN' && user.role !== 'WORKER' && user.showroomId && job.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot access service jobs of another showroom', 403, 'FORBIDDEN');
    }

    return ApiResponse.success({
      service_job: {
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
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'WORKER', 'SUPERADMIN']);
    const { id } = await params;

    const existing = await prisma.serviceJob.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Service job not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'WORKER' && existing.assignedWorkerId !== user.id) {
      return ApiResponse.error('Forbidden: Cannot modify service jobs assigned to another technician', 403, 'FORBIDDEN');
    }

    if (user.role !== 'SUPERADMIN' && user.role !== 'WORKER' && user.showroomId && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot modify service jobs of another showroom', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const validation = updateServiceJobSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;
    const updateData: any = {
      statusUpdatedAt: new Date(),
    };

    if (data.assigned_worker_id !== undefined) {
      updateData.assignedWorkerId = data.assigned_worker_id;
      if (data.assigned_worker_id && existing.status === 'REQUESTED') {
        updateData.status = 'ASSIGNED';
      }
    }

    if (data.worker_approval) {
      updateData.workerApproval = data.worker_approval;
      if (data.worker_approval === 'APPROVED' && existing.status === 'ASSIGNED') {
        updateData.status = 'IN_PROGRESS';
      }
    }

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.status_notes !== undefined) {
      updateData.statusNotes = data.status_notes;
    }

    const updated = await prisma.serviceJob.update({
      where: { id },
      data: updateData,
      include: {
        assignedWorker: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return ApiResponse.success({
      service_job: {
        id: updated.id,
        status: updated.status,
        worker_approval: updated.workerApproval,
        assigned_worker_id: updated.assignedWorkerId,
        assigned_worker_name: updated.assignedWorker?.fullName,
        status_notes: updated.statusNotes,
        status_updated_at: updated.statusUpdatedAt,
      },
    });
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
    const user = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN']);
    const { id } = await params;

    const existing = await prisma.serviceJob.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiResponse.error('Service job not found', 404, 'NOT_FOUND');
    }

    if (user.role !== 'SUPERADMIN' && user.showroomId && existing.showroomId !== user.showroomId) {
      return ApiResponse.error('Forbidden: Cannot delete service jobs of another showroom', 403, 'FORBIDDEN');
    }

    await prisma.serviceJob.delete({
      where: { id },
    });

    return ApiResponse.success({ message: 'Service job deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
