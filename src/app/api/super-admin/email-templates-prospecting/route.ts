import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET(request: NextRequest) {
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

    const templates = await prisma.prospectingEmailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ templates })

  } catch (error) {
    log.error('Erreur récupération templates:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (!data.name || !data.subject || !data.body) {
      return NextResponse.json(
        { error: 'Nom, sujet et corps requis' },
        { status: 400 }
      )
    }

    const template = await prisma.prospectingEmailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        category: data.category || 'GENERAL',
        variables: data.variables || ['{{institutName}}', '{{contactName}}'],
        isActive: data.isActive !== false
      }
    })

    return NextResponse.json(template, { status: 201 })

  } catch (error) {
    log.error('Erreur création template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
