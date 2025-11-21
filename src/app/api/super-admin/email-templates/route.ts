import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] || cookieStore.get('auth-token')?.value || cookieStore.get('token')?.value

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

    const templates = await prisma.superAdminEmailTemplate.findMany({
      orderBy: {
        key: 'asc'
      }
    })

    return NextResponse.json(templates)

  } catch (error) {
    log.error('Erreur email templates:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.split(' ')[1] || cookieStore.get('auth-token')?.value || cookieStore.get('token')?.value

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
    const { key, name, subject, htmlBody, textBody, variables, active } = data

    const template = await prisma.superAdminEmailTemplate.create({
      data: {
        key,
        name,
        subject,
        htmlBody,
        textBody: textBody || null,
        variables: variables || {},
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(template)

  } catch (error) {
    log.error('Erreur création template:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
