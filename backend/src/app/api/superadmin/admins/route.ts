import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { hashPassword } from '@/lib/hash';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createAdminSchema = z.object({
  showroom_id: z.string().uuid('Invalid Showroom ID format'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit phone number',
    }),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    await authorizeRoles(req, ['SUPERADMIN']);

    const body = await req.json();
    const validation = createAdminSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { showroom_id, full_name, phone, email, password } = validation.data;

    const showroom = await prisma.showroom.findUnique({
      where: { id: showroom_id },
    });

    if (!showroom) {
      return ApiResponse.error('Showroom not found', 404, 'SHOWROOM_NOT_FOUND');
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return ApiResponse.error('User with this phone number already exists', 409, 'PHONE_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    const adminUser = await prisma.user.create({
      data: {
        fullName: full_name,
        phone,
        email: email ? email.toLowerCase() : null,
        passwordHash,
        role: 'ADMIN',
        showroomId: showroom_id,
      },
    });

    return ApiResponse.success(
      {
        admin: {
          id: adminUser.id,
          full_name: adminUser.fullName,
          phone: adminUser.phone,
          email: adminUser.email,
          role: adminUser.role,
          showroom_id: adminUser.showroomId,
          created_at: adminUser.createdAt,
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
