import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const params = await context.params;
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

    const template = await prisma.superAdminEmailTemplate.findUnique({
      where: { key: params.key as any }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    return NextResponse.json(template)

  } catch (error) {
    log.error('Erreur récupération template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ key: string }> }
) {
  try {
    const params = await context.params;
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
    const { name, subject, htmlBody, textBody, variables, active } = data

    const template = await prisma.superAdminEmailTemplate.update({
      where: { key: params.key as any },
      data: {
        name: name || undefined,
        subject: subject || undefined,
        htmlBody: htmlBody || undefined,
        textBody: textBody !== undefined ? textBody : undefined,
        variables: variables || undefined,
        active: active !== undefined ? active : undefined
      }
    })

    return NextResponse.json(template)

  } catch (error) {
    log.error('Erreur mise à jour template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
