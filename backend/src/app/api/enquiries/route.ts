import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createEnquirySchema = z.object({
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters'),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number'),
  customer_email: z.string().email().optional().or(z.literal('')),
  enquiry_type: z.enum(['GENERAL', 'VEHICLE_PURCHASE', 'SPARE_PART_PURCHASE', 'SERVICE_INQUIRY']).default('GENERAL'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  target_showroom_id: z.string().uuid().optional(),
  broadcast_to_all: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    let authUser: any = null;
    try {
      authUser = await authorizeRoles(req, ['USER', 'ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN', 'WORKER']);
    } catch {}

    const body = await req.json();
    const validation = createEnquirySchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const data = validation.data;

    // Create Enquiry record
    const enquiry = await prisma.enquiry.create({
      data: {
        userId: authUser?.id || null,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerEmail: data.customer_email || null,
        enquiryType: data.enquiry_type,
        message: data.message,
        targetShowroomId: data.target_showroom_id || null,
        broadcastToAll: data.broadcast_to_all || !data.target_showroom_id,
        status: 'PENDING',
      },
    });

    return ApiResponse.success(
      {
        enquiry: {
          id: enquiry.id,
          customer_name: enquiry.customerName,
          customer_phone: enquiry.customerPhone,
          customer_email: enquiry.customerEmail,
          enquiry_type: enquiry.enquiryType,
          message: enquiry.message,
          target_showroom_id: enquiry.targetShowroomId,
          broadcast_to_all: enquiry.broadcastToAll,
          status: enquiry.status,
          created_at: enquiry.createdAt,
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
    const user = await authorizeRoles(req, ['ADMIN', 'INVENTORY_MANAGER', 'SUPERADMIN', 'USER']);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as 'PENDING' | 'RESPONDED' | 'CLOSED' | null;
    const enquiryType = searchParams.get('enquiry_type') as 'GENERAL' | 'VEHICLE_PURCHASE' | 'SPARE_PART_PURCHASE' | 'SERVICE_INQUIRY' | null;

    const whereClause: any = {};

    if (user.role === 'USER') {
      whereClause.OR = [
        { userId: user.id },
        { customerPhone: user.phone },
      ];
    } else if (user.role !== 'SUPERADMIN' && user.showroomId) {
      whereClause.OR = [
        { targetShowroomId: user.showroomId },
        { broadcastToAll: true },
      ];
    }

    if (status) {
      whereClause.status = status;
    }
    if (enquiryType) {
      whereClause.enquiryType = enquiryType;
    }

    const enquiries = await prisma.enquiry.findMany({
      where: whereClause,
      include: {
        targetShowroom: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = enquiries.map((e) => ({
      id: e.id,
      customer_name: e.customerName,
      customer_phone: e.customerPhone,
      customer_email: e.customerEmail,
      enquiry_type: e.enquiryType,
      message: e.message,
      target_showroom_id: e.targetShowroomId,
      target_showroom_name: e.targetShowroom?.name,
      broadcast_to_all: e.broadcastToAll,
      status: e.status,
      response_notes: e.responseNotes,
      created_at: e.createdAt,
      updated_at: e.updatedAt,
    }));

    return ApiResponse.success({ enquiries: formatted });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
