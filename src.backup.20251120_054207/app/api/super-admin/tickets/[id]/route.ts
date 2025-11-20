import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'
import { sendEmail } from '@/lib/brevo'

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

    // Récupérer le ticket avec ses messages
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true
          }
        },
        messages: {
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
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    return NextResponse.json(ticket)

  } catch (error) {
    log.error('Erreur récupération ticket:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
      select: { role: true, name: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { status, priority, assignedToId } = body

    // Récupérer le ticket actuel pour vérifier les changements
    const currentTicket = await prisma.supportTicket.findUnique({
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

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    // Préparer les données de mise à jour
    const updateData: any = {}

    if (status) {
      updateData.status = status

      // Mettre à jour les timestamps selon le statut
      if (status === 'RESOLVED' && !currentTicket.resolvedAt) {
        updateData.resolvedAt = new Date()
      }
      if (status === 'CLOSED' && !currentTicket.closedAt) {
        updateData.closedAt = new Date()
      }
    }

    if (priority) {
      updateData.priority = priority
    }

    if (assignedToId !== undefined) {
      updateData.assignedToId = assignedToId
    }

    // Mettre à jour le ticket
    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            name: true
          }
        }
      }
    })

    // Envoyer un email de notification si le statut a changé
    if (status && status !== currentTicket.status) {
      try {
        const statusLabels: Record<string, string> = {
          OPEN: 'Ouvert',
          IN_PROGRESS: 'En cours de traitement',
          WAITING_CUSTOMER: 'En attente de votre réponse',
          RESOLVED: 'Résolu',
          CLOSED: 'Fermé'
        }

        await sendEmail({
          to: currentTicket.createdBy.email,
          subject: `Ticket ${updatedTicket.ticketNumber} - Mise à jour du statut`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Mise à jour de votre ticket de support</h2>

              <p>Bonjour ${currentTicket.createdBy.name},</p>

              <p>Le statut de votre ticket <strong>${updatedTicket.ticketNumber}</strong> a été mis à jour.</p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Sujet:</strong> ${updatedTicket.subject}</p>
                <p style="margin: 10px 0 0 0;"><strong>Nouveau statut:</strong> ${statusLabels[status] || status}</p>
              </div>

              ${status === 'WAITING_CUSTOMER' ? `
                <p style="color: #f59e0b; font-weight: bold;">⚠️ Votre réponse est attendue pour continuer le traitement de ce ticket.</p>
              ` : ''}

              ${status === 'RESOLVED' ? `
                <p style="color: #10b981; font-weight: bold;">✅ Votre ticket a été résolu ! Si le problème persiste, n'hésitez pas à répondre.</p>
              ` : ''}

              <p>Vous pouvez consulter votre ticket et y répondre depuis votre espace client.</p>

              <p>Cordialement,<br>L'équipe LAIA Connect</p>
            </div>
          `
        })

        log.info(`Email de notification envoyé pour le ticket ${updatedTicket.ticketNumber}`)
      } catch (emailError) {
        log.error('Erreur envoi email notification:', emailError)
        // Ne pas bloquer la mise à jour du ticket si l'email échoue
      }
    }

    return NextResponse.json(updatedTicket)

  } catch (error) {
    log.error('Erreur mise à jour ticket:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
