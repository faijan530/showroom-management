import { NextRequest } from 'next/server';
import { authorizeRoles } from '@/middleware/rbac.middleware';
import { prisma } from '@/infrastructure/prisma/prisma.client';
import { ApiResponse } from '@/shared/response/api-response';
import { AppError } from '@/shared/errors/app.error';

export async function GET(req: NextRequest) {
  try {
    const user = await authorizeRoles(req, ['ADMIN', 'SUPERADMIN', 'WORKER', 'INVENTORY_MANAGER']);

    const { searchParams } = new URL(req.url);
    const showroomId = user.role === 'SUPERADMIN' ? (searchParams.get('showroomId') || undefined) : (user.showroomId || undefined);
    const showroomFilter = showroomId ? { showroomId } : {};

    const [lowStockParts, overdueJobs, pendingEnquiries, pendingPartRequests] = await Promise.all([
      prisma.sparePart.findMany({
        where: { ...showroomFilter, stockQuantity: { lte: 5 } },
        select: { id: true, partName: true, partCode: true, stockQuantity: true, minStockAlert: true },
        take: 10,
      }),
      prisma.serviceJob.findMany({
        where: {
          ...showroomFilter,
          status: { in: ['REQUESTED', 'ASSIGNED'] },
        },
        select: { id: true, customerName: true, serviceDescription: true, status: true, preferredDate: true },
        take: 10,
      }),
      prisma.enquiry.findMany({
        where: { status: 'PENDING', ...(showroomId ? { targetShowroomId: showroomId } : {}) },
        select: { id: true, customerName: true, enquiryType: true, createdAt: true },
        take: 10,
      }),
      prisma.sparePartRequest.findMany({
        where: { ...showroomFilter, status: 'REQUESTED' },
        select: { id: true, partName: true, quantity: true, createdAt: true },
        take: 10,
      }),
    ]);

    const alerts: Array<{
      id: string;
      category: 'LOW_STOCK' | 'OVERDUE_SERVICE' | 'PENDING_ENQUIRY' | 'PENDING_PART_REQUEST';
      severity: 'HIGH' | 'MEDIUM' | 'INFO';
      title: string;
      message: string;
      href: string;
    }> = [];

    lowStockParts.forEach((part) => {
      alerts.push({
        id: `stock-${part.id}`,
        category: 'LOW_STOCK',
        severity: part.stockQuantity === 0 ? 'HIGH' : 'MEDIUM',
        title: `Low Stock: ${part.partName}`,
        message: `Current stock: ${part.stockQuantity} (Alert threshold: ${part.minStockAlert})`,
        href: '/inventory/dashboard',
      });
    });

    overdueJobs.forEach((job) => {
      const isOverdue = job.preferredDate && new Date(job.preferredDate) < new Date();
      alerts.push({
        id: `job-${job.id}`,
        category: 'OVERDUE_SERVICE',
        severity: isOverdue ? 'HIGH' : 'MEDIUM',
        title: isOverdue ? `Overdue Service: ${job.customerName}` : `Uncompleted Service: ${job.customerName}`,
        message: job.serviceDescription,
        href: '/admin/services',
      });
    });

    pendingEnquiries.forEach((enquiry) => {
      alerts.push({
        id: `enquiry-${enquiry.id}`,
        category: 'PENDING_ENQUIRY',
        severity: 'MEDIUM',
        title: `Pending Enquiry: ${enquiry.customerName}`,
        message: `Type: ${enquiry.enquiryType}`,
        href: '/admin/enquiries',
      });
    });

    pendingPartRequests.forEach((reqItem) => {
      alerts.push({
        id: `part-req-${reqItem.id}`,
        category: 'PENDING_PART_REQUEST',
        severity: 'MEDIUM',
        title: `Pending Part Request: ${reqItem.partName}`,
        message: `Quantity: ${reqItem.quantity}`,
        href: '/admin/spare-parts/requests',
      });
    });

    return ApiResponse.success({
      totalAlerts: alerts.length,
      alerts,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.code);
    }
    console.error('Error fetching alerts:', error);
    return ApiResponse.error('Internal server error', 500, 'INTERNAL_SERVER_ERROR');
  }
}
