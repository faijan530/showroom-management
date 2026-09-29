import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

const createFeedbackSchema = z.object({
  service_job_id: z.string().uuid('Please select a valid service job'),
  rating: z.number().int().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  comment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['USER', 'ADMIN', 'SUPERADMIN', 'WORKER']);
    const body = await req.json();

    const validation = createFeedbackSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((e) => e.message);
      return ApiResponse.error('Validation failed', 400, 'VALIDATION_ERROR', details);
    }

    const { service_job_id, rating, comment } = validation.data;

    // Check service job existence and ownership
    const serviceJob = await prisma.serviceJob.findUnique({
      where: { id: service_job_id },
    });

    if (!serviceJob) {
      return ApiResponse.error('Service job not found', 404, 'NOT_FOUND');
    }

    if (user.role === 'USER' && serviceJob.userId !== user.id) {
      return ApiResponse.error('Forbidden: Cannot submit feedback for another customer job', 403, 'FORBIDDEN');
    }

    if (serviceJob.status !== 'COMPLETED') {
      return ApiResponse.error('Feedback is only allowed for COMPLETED service jobs', 422, 'UNPROCESSABLE_ENTITY');
    }

    // Check unique feedback per service job
    const existing = await prisma.serviceFeedback.findUnique({
      where: { serviceJobId: service_job_id },
    });

    if (existing) {
      return ApiResponse.error('Feedback has already been submitted for this service job', 409, 'FEEDBACK_EXISTS');
    }

    const feedback = await prisma.serviceFeedback.create({
      data: {
        showroomId: serviceJob.showroomId,
        userId: user.id,
        serviceJobId: service_job_id,
        rating,
        comment: comment || null,
        status: 'PENDING',
      },
    });

    return ApiResponse.success(
      {
        feedback: {
          id: feedback.id,
          service_job_id: feedback.serviceJobId,
          rating: feedback.rating,
          comment: feedback.comment,
          status: feedback.status,
          created_at: feedback.createdAt,
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
    const { searchParams } = new URL(req.url);
    const showroomId = searchParams.get('showroom_id');

    const whereClause: any = { status: 'APPROVED' };
    if (showroomId) whereClause.showroomId = showroomId;

    const feedbacks = await prisma.serviceFeedback.findMany({
      where: whereClause,
      include: {
        user: { select: { fullName: true } },
        showroom: { select: { name: true, code: true } },
        serviceJob: { select: { vehicleDetails: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = feedbacks.length;
    const avgRating = totalReviews > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalReviews).toFixed(1) : '5.0';

    const formatted = feedbacks.map((f) => {
      const nameParts = (f.user?.fullName || 'Customer').split(' ');
      const anonymizedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];

      return {
        id: f.id,
        customer_display_name: anonymizedName,
        showroom_name: f.showroom?.name,
        vehicle_details: f.serviceJob?.vehicleDetails,
        rating: f.rating,
        comment: f.comment,
        admin_response: f.adminResponse,
        created_at: f.createdAt,
      };
    });

    return ApiResponse.success({
      average_rating: Number(avgRating),
      total_reviews: totalReviews,
      feedbacks: formatted,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
