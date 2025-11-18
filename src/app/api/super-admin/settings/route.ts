import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog, getIpAddress, getUserAgent } from '@/lib/audit-logger'
import { log } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const settings = await prisma.platformConfig.findMany({
      orderBy: {
        key: 'asc'
      }
    })

    // Convertir en object key-value pour faciliter l'usage
    const settingsMap: { [key: string]: any } = {}
    settings.forEach(setting => {
      settingsMap[setting.key] = {
        value: setting.value,
        description: setting.description,
        updatedAt: setting.updatedAt
      }
    })

    return NextResponse.json({ settings: settingsMap, raw: settings })

  } catch (error) {
    log.error('Erreur settings:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const data = await request.json()
    const { key, value, description } = data

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Récupérer l'ancienne valeur pour l'audit
    const oldSetting = await prisma.platformConfig.findUnique({
      where: { key }
    })

    // Upsert le setting
    const setting = await prisma.platformConfig.upsert({
      where: { key },
      update: {
        value,
        description: description || oldSetting?.description,
        updatedBy: decoded.userId
      },
      create: {
        key,
        value,
        description: description || null,
        updatedBy: decoded.userId
      }
    })

    // Log l'action
    await createAuditLog({
      userId: decoded.userId,
      action: 'UPDATE_SETTINGS',
      targetType: 'SETTINGS',
      targetId: key,
      before: oldSetting ? { value: oldSetting.value } : null,
      after: { value },
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: { settingKey: key }
    })

    return NextResponse.json(setting)

  } catch (error) {
    log.error('Erreur mise à jour settings:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
