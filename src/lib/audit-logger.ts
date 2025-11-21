import { prisma } from '@/lib/prisma'
import { AuditAction } from '@prisma/client'

interface AuditLogParams {
  userId: string
  action: AuditAction
  targetType: string
  targetId?: string
  organizationId?: string
  before?: any
  after?: any
  ipAddress?: string
  userAgent?: string
  metadata?: any
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId || undefined,
        organizationId: params.organizationId || undefined,
        before: params.before || undefined,
        after: params.after || undefined,
        ipAddress: params.ipAddress || undefined,
        userAgent: params.userAgent || undefined,
        metadata: params.metadata || undefined
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging shouldn't break the main action
  }
}

// Helper pour extraire l'IP de la requête
export function getIpAddress(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return undefined
}

// Helper pour extraire le user agent
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined
}
