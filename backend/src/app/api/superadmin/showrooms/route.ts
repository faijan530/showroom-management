import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createShowroomSchema = z.object({
  name: z.string().min(2, 'Showroom name must be at least 2 characters'),
  code: z.string().min(3, 'Showroom code must be at least 3 characters').toUpperCase(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contact_phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit contact phone number',
    }),
  contact_email: z.string().email('Invalid contact email address'),
  logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    await authorizeRoles(req, ['SUPERADMIN']);

    const body = await req.json();
    const validation = createShowroomSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { name, code, address, contact_phone, contact_email, logo_url } = validation.data;

    const existingCode = await prisma.showroom.findUnique({
      where: { code },
    });

    if (existingCode) {
      return ApiResponse.error('Showroom with this code already exists', 409, 'CODE_EXISTS');
    }

    const showroom = await prisma.showroom.create({
      data: {
        name,
        code,
        address,
        contactPhone: contact_phone,
        contactEmail: contact_email,
        logoUrl: logo_url || null,
        status: 'ACTIVE',
      },
    });

    return ApiResponse.success(
      {
        showroom: {
          id: showroom.id,
          name: showroom.name,
          code: showroom.code,
          address: showroom.address,
          contact_phone: showroom.contactPhone,
          contact_email: showroom.contactEmail,
          logo_url: showroom.logoUrl,
          status: showroom.status,
          created_at: showroom.createdAt,
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
    await authorizeRoles(req, ['SUPERADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'WORKER', 'USER']);

    const showrooms = await prisma.showroom.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedShowrooms = showrooms.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      address: s.address,
      contact_phone: s.contactPhone,
      contact_email: s.contactEmail,
      logo_url: s.logoUrl,
      status: s.status,
      user_count: s._count.users,
      created_at: s.createdAt,
    }));

    return ApiResponse.success({ showrooms: formattedShowrooms });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
