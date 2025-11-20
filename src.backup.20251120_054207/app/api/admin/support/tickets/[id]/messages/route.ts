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

    const { id } = params
    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Le message est requis' }, { status: 400 })
    }

    // Vérifier que le ticket existe et que l'utilisateur en est le créateur
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        createdById: user.id
      },
      include: {
        assignedTo: {
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
        isInternal: false
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

    // Envoyer un email de notification au super admin
    try {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'contact@laiaconnect.fr'

      await sendEmail({
        to: superAdminEmail,
        subject: `[Réponse client] ${ticket.ticketNumber} - ${ticket.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Nouvelle réponse du client</h2>

            <p>${user.name} a ajouté une réponse au ticket <strong>${ticket.ticketNumber}</strong>.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
              <p style="margin: 10px 0 0 0;"><strong>Sujet:</strong> ${ticket.subject}</p>
              <p style="margin: 10px 0 0 0;"><strong>Message:</strong></p>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${message.trim()}</p>
            </div>

            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/super-admin/tickets" style="color: #7c3aed;">Voir le ticket dans le super-admin</a></p>
          </div>
        `
      })

      log.info(`Email de notification envoyé au super admin pour ${ticket.ticketNumber}`)
    } catch (emailError) {
      log.error('Erreur envoi email notification:', emailError)
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
