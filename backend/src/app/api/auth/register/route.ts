import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { hashPassword } from '@/lib/hash';
import { signToken } from '@/lib/jwt';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit phone number starting with 6-9',
    }),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { full_name, phone, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return ApiResponse.error('User with this phone number already exists', 409, 'USER_EXISTS');
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        fullName: full_name,
        phone,
        email: email ? email.toLowerCase() : null,
        passwordHash,
        role: 'USER',
      },
    });

    const tokenPayload = {
      id: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      showroomId: newUser.showroomId,
      fullName: newUser.fullName,
    };

    const token = signToken(tokenPayload);

    const response = ApiResponse.success(
      {
        token,
        user: {
          id: newUser.id,
          full_name: newUser.fullName,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
          showroom_id: newUser.showroomId,
        },
      },
      201
    );

    response.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
