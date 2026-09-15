import prisma from '@/lib/prisma';

type AuditAction = 'create' | 'update' | 'delete' | 'role_change' | 'login' | 'status_change';

interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Create an audit log entry for tracking important admin actions
 */
export async function createAuditLog(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        details: (entry.details as any) || {},
        ipAddress: entry.ipAddress,
      },
    });
  } catch (error) {
    // Don't let audit logging failure break the main operation
    console.error('Failed to create audit log:', error);
  }
}
