import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { comparePassword } from '@/lib/hash';
import { signToken } from '@/lib/jwt';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const loginSchema = z.object({
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit phone number',
    }),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { phone, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return ApiResponse.error('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      return ApiResponse.error('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
    }

    const tokenPayload = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      showroomId: user.showroomId,
      fullName: user.fullName,
    };

    const token = signToken(tokenPayload);

    const response = ApiResponse.success({
      token,
      user: {
        id: user.id,
        full_name: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        showroom_id: user.showroomId,
      },
    });

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
