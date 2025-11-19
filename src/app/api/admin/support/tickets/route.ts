import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'
import { sendEmail } from '@/lib/brevo'

// Fonction pour générer un numéro de ticket unique
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.supportTicket.count()
  const ticketNumber = `TICKET-${year}-${String(count + 1).padStart(3, '0')}`
  return ticketNumber
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { subject, description, priority, category } = body

    if (!subject || !description) {
      return NextResponse.json({ error: 'Sujet et description requis' }, { status: 400 })
    }

    // Générer le numéro de ticket
    const ticketNumber = await generateTicketNumber()

    // Créer le ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject,
        description,
        priority: priority || 'MEDIUM',
        category: category || 'QUESTION',
        status: 'OPEN',
        createdById: user.id
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Envoyer un email de confirmation au client
    try {
      await sendEmail({
        to: user.email,
        subject: `Ticket ${ticketNumber} créé - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Votre ticket de support a été créé</h2>

            <p>Bonjour ${user.name},</p>

            <p>Nous avons bien reçu votre demande de support. Notre équipe va l'examiner et vous répondra dans les plus brefs délais.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Numéro de ticket:</strong> ${ticketNumber}</p>
              <p style="margin: 10px 0 0 0;"><strong>Sujet:</strong> ${subject}</p>
              <p style="margin: 10px 0 0 0;"><strong>Description:</strong></p>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${description}</p>
            </div>

            <p>Vous pouvez consulter et suivre votre ticket depuis votre espace admin.</p>

            <p>Cordialement,<br>L'équipe LAIA Connect</p>
          </div>
        `
      })
    } catch (emailError) {
      log.error('Erreur envoi email confirmation ticket:', emailError)
    }

    // Envoyer un email de notification au super admin
    try {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'contact@laiaconnect.fr'

      await sendEmail({
        to: superAdminEmail,
        subject: `[Nouveau ticket] ${ticketNumber} - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Nouveau ticket de support</h2>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Numéro:</strong> ${ticketNumber}</p>
              <p style="margin: 10px 0 0 0;"><strong>De:</strong> ${user.name} (${user.email})</p>
              <p style="margin: 10px 0 0 0;"><strong>Sujet:</strong> ${subject}</p>
              <p style="margin: 10px 0 0 0;"><strong>Catégorie:</strong> ${category}</p>
              <p style="margin: 10px 0 0 0;"><strong>Priorité:</strong> ${priority}</p>
              <p style="margin: 10px 0 0 0;"><strong>Description:</strong></p>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${description}</p>
            </div>

            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/super-admin/tickets" style="color: #7c3aed;">Voir le ticket dans le super-admin</a></p>
          </div>
        `
      })
    } catch (emailError) {
      log.error('Erreur envoi email notification super admin:', emailError)
    }

    log.info(`Ticket ${ticketNumber} créé par ${user.email}`)

    return NextResponse.json(ticket)

  } catch (error) {
    log.error('Erreur création ticket:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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

    // Récupérer uniquement les tickets créés par cet utilisateur
    const tickets = await prisma.supportTicket.findMany({
      where: {
        createdById: decoded.userId
      },
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
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(tickets)

  } catch (error) {
    log.error('Erreur récupération tickets:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
