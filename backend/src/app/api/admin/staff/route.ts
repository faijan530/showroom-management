import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { hashPassword } from '@/lib/hash';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const staffSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit phone number',
    }),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['WORKER', 'INVENTORY_MANAGER']),
});

export async function POST(req: NextRequest) {
  try {
    const adminUser = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN']);

    if (adminUser.role === 'ADMIN' && !adminUser.showroomId) {
      return ApiResponse.error('Admin is not assigned to any showroom', 400, 'NO_SHOWROOM_ASSIGNED');
    }

    const body = await req.json();
    const validation = staffSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { full_name, phone, email, password, role } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return ApiResponse.error('User with this phone number already exists', 409, 'USER_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    const staffUser = await prisma.user.create({
      data: {
        fullName: full_name,
        phone,
        email: email ? email.toLowerCase() : null,
        passwordHash,
        role,
        showroomId: adminUser.showroomId,
      },
    });

    return ApiResponse.success(
      {
        staff: {
          id: staffUser.id,
          full_name: staffUser.fullName,
          phone: staffUser.phone,
          email: staffUser.email,
          role: staffUser.role,
          showroom_id: staffUser.showroomId,
          created_at: staffUser.createdAt,
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
    const adminUser = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN']);

    if (adminUser.role === 'ADMIN' && !adminUser.showroomId) {
      return ApiResponse.error('Admin is not assigned to any showroom', 400, 'NO_SHOWROOM_ASSIGNED');
    }

    const staffMembers = await prisma.user.findMany({
      where: {
        showroomId: adminUser.showroomId || undefined,
        role: {
          in: ['WORKER', 'INVENTORY_MANAGER'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedStaff = staffMembers.map((user) => ({
      id: user.id,
      full_name: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      created_at: user.createdAt,
    }));

    return ApiResponse.success({ staff: formattedStaff });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
