import { NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/prisma/prisma.client';

export async function GET() {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'error';
  }

  return NextResponse.json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: { database: dbStatus },
  });
}
