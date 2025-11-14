import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params
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

    if (!data.type || !data.content) {
      return NextResponse.json(
        { error: 'Type et contenu requis' },
        { status: 400 }
      )
    }

    const interaction = await prisma.leadInteraction.create({
      data: {
        leadId,
        userId: decoded.userId,
        type: data.type,
        subject: data.subject,
        content: data.content,
        nextAction: data.nextAction,
        nextActionDate: data.nextActionDate ? new Date(data.nextActionDate) : null,
        attachments: data.attachments || []
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Mettre à jour le lead
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        lastContactDate: new Date(),
        nextFollowUpDate: data.nextActionDate ? new Date(data.nextActionDate) : undefined
      }
    })

    return NextResponse.json(interaction, { status: 201 })

  } catch (error) {
    log.error('Erreur création interaction:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
