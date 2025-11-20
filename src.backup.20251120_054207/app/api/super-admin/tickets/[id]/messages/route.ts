import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'
import { sendEmail } from '@/lib/brevo'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { id: true, role: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { message, isInternal } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Le message est requis' }, { status: 400 })
    }

    // Vérifier que le ticket existe
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    // Créer le message
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        authorId: user.id,
        message: message.trim(),
        isInternal: isInternal || false
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Mettre à jour le timestamp de première réponse si c'est la première
    if (!ticket.firstResponseAt) {
      await prisma.supportTicket.update({
        where: { id },
        data: {
          firstResponseAt: new Date()
        }
      })
    }

    // Envoyer un email au client si ce n'est pas une note interne
    if (!isInternal) {
      try {
        await sendEmail({
          to: ticket.createdBy.email,
          replyTo: { email: 'contact@laiaconnect.fr' },
          subject: `Re: ${ticket.subject} [${ticket.ticketNumber}]`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Nouvelle réponse à votre ticket</h2>

              <p>Bonjour ${ticket.createdBy.name},</p>

              <p>Nous avons ajouté une réponse à votre ticket <strong>${ticket.ticketNumber}</strong>.</p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Sujet:</strong> ${ticket.subject}</p>
                <p style="margin: 10px 0 0 0;"><strong>Réponse:</strong></p>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message.trim()}</p>
              </div>

              <p>Vous pouvez consulter votre ticket et y répondre depuis votre espace client ou directement en répondant à cet email.</p>

              <p>Cordialement,<br>L'équipe LAIA Connect</p>
            </div>
          `
        })

        log.info(`Email de réponse envoyé pour le ticket ${ticket.ticketNumber}`)
      } catch (emailError) {
        log.error('Erreur envoi email réponse:', emailError)
        // Ne pas bloquer la création du message si l'email échoue
      }
    }

    return NextResponse.json(ticketMessage)

  } catch (error) {
    log.error('Erreur création message ticket:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = params

    // Récupérer tous les messages du ticket
    const messages = await prisma.ticketMessage.findMany({
      where: { ticketId: id },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)

  } catch (error) {
    log.error('Erreur récupération messages:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
