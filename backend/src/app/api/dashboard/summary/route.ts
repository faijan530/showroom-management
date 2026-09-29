import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN', 'WORKER', 'INVENTORY_MANAGER']);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '7d';

    const showroomId = user.role === 'SUPERADMIN' ? (searchParams.get('showroomId') || undefined) : (user.showroomId || undefined);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Showroom context filter
    const showroomFilter = showroomId ? { showroomId } : {};

    // 1. Total & Pending Requests
    const [
      serviceJobsTotal,
      serviceJobsPending,
      partRequestsTotal,
      partRequestsPending,
      serviceCompletedToday,
      partCompletedToday,
      newCustomersCount,
      activeWorkersCount,
      lowStockPartsCount,
      feedbackAggregate,
      overdueServicesCount
    ] = await Promise.all([
      prisma.serviceJob.count({ where: showroomFilter }),
      prisma.serviceJob.count({ where: { ...showroomFilter, status: { in: ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.sparePartRequest.count({ where: showroomFilter }),
      prisma.sparePartRequest.count({ where: { ...showroomFilter, status: { in: ['REQUESTED', 'UNDER_REVIEW', 'ORDERED', 'IN_TRANSIT'] } } }),
      prisma.serviceJob.count({ where: { ...showroomFilter, status: 'COMPLETED', statusUpdatedAt: { gte: todayStart } } }),
      prisma.sparePartRequest.count({ where: { ...showroomFilter, status: 'COMPLETED', updatedAt: { gte: todayStart } } }),
      prisma.user.count({ where: { role: 'USER', ...(showroomId ? { showroomId } : {}) } }),
      prisma.user.count({ where: { role: 'WORKER', ...(showroomId ? { showroomId } : {}) } }),
      prisma.sparePart.count({ where: { ...showroomFilter, stockQuantity: { lte: 5 } } }),
      prisma.serviceFeedback.aggregate({
        where: showroomFilter,
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.serviceJob.count({
        where: {
          ...showroomFilter,
          status: { in: ['REQUESTED', 'ASSIGNED'] },
          preferredDate: { lt: now },
        },
      }),
    ]);

    // 2. Calculate Revenue (Completed Service Jobs base cost 500 + Spare Part Requests price)
    const completedServices = await prisma.serviceJob.findMany({
      where: { ...showroomFilter, status: 'COMPLETED' },
      select: { createdAt: true },
    });
    const completedParts = await prisma.sparePartRequest.findMany({
      where: { ...showroomFilter, status: 'COMPLETED' },
      include: { sparePart: true },
    });

    const totalServiceRevenue = completedServices.length * 750;
    const totalPartsRevenue = completedParts.reduce((acc, p) => acc + ((p.sparePart?.price || 500) * p.quantity), 0);
    const totalRevenue = totalServiceRevenue + totalPartsRevenue;

    // 3. Last 7 Days Request & Revenue Chart Data
    const days: string[] = [];
    const requestsByDayMap: Record<string, number> = {};
    const revenueByDayMap: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      days.push(dayStr);
      requestsByDayMap[dayStr] = 0;
      revenueByDayMap[dayStr] = 0;
    }

    // Populate charts
    const recentJobs = await prisma.serviceJob.findMany({
      where: { ...showroomFilter, createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true, status: true },
    });

    recentJobs.forEach((job) => {
      const dayStr = new Date(job.createdAt).toISOString().split('T')[0];
      if (requestsByDayMap[dayStr] !== undefined) {
        requestsByDayMap[dayStr] += 1;
        if (job.status === 'COMPLETED') {
          revenueByDayMap[dayStr] += 750;
        }
      }
    });

    const requestsByDay = days.map((date) => ({ date, count: requestsByDayMap[date] }));
    const revenueByDay = days.map((date) => ({ date, amount: revenueByDayMap[date] }));

    return ApiResponse.success({
      period,
      kpis: {
        totalRequests: serviceJobsTotal + partRequestsTotal,
        pendingRequests: serviceJobsPending + partRequestsPending,
        completedToday: serviceCompletedToday + partCompletedToday,
        revenue: totalRevenue,
        newCustomers: newCustomersCount,
        activeWorkers: activeWorkersCount,
        lowStockAlerts: lowStockPartsCount,
        averageRating: feedbackAggregate._avg.rating ? Number(feedbackAggregate._avg.rating.toFixed(1)) : 5.0,
        overdueServices: overdueServicesCount,
      },
      charts: {
        requestsByDay,
        revenueByDay,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    console.error('Error fetching dashboard summary:', error);
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
