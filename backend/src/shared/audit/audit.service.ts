import { prisma } from '@/infrastructure/prisma/prisma.client';

export interface AuditEntryInput {
  showroomId?: string | null;
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}

export interface ActivityEntryInput {
  showroomId?: string | null;
  userId?: string | null;
  type: string;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
}

export async function logAuditEntry(entry: AuditEntryInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        showroomId: entry.showroomId || null,
        actorId: entry.actorId || null,
        actorRole: entry.actorRole || null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId || null,
        metadata: entry.metadata || {},
        ipAddress: entry.ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Failed to log audit entry:', err);
  }
}

export async function logActivityEntry(entry: ActivityEntryInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        showroomId: entry.showroomId || null,
        userId: entry.userId || null,
        type: entry.type,
        description: entry.description,
        referenceType: entry.referenceType || null,
        referenceId: entry.referenceId || null,
      },
    });
  } catch (err) {
    console.error('Failed to log activity entry:', err);
  }
}
