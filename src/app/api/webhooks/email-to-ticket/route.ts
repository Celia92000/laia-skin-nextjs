import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'
import { sendEmail } from '@/lib/brevo'

/**
 * Webhook pour recevoir les emails entrants de Brevo (ex-Sendinblue)
 * et les convertir automatiquement en tickets de support
 *
 * Configuration Brevo:
 * 1. Aller dans Brevo Dashboard > Settings > Inbound parsing
 * 2. Ajouter une route pour contact@laiaconnect.fr
 * 3. Définir l'URL du webhook: https://www.laiaconnect.fr/api/webhooks/email-to-ticket
 * 4. Choisir le format: JSON
 *
 * Le webhook est compatible avec :
 * - Brevo (format principal)
 * - Resend (format de secours)
 */

// Fonction pour générer un numéro de ticket unique
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.supportTicket.count()
  const ticketNumber = `TICKET-${year}-${String(count + 1).padStart(3, '0')}`
  return ticketNumber
}

// Fonction pour extraire le texte d'un email
function extractEmailText(html: string, text?: string): string {
  if (text) {
    return text.trim()
  }

  // Nettoyer le HTML basique
  const cleanText = html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleanText.substring(0, 5000) // Limiter à 5000 caractères
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    log.info('Email entrant reçu (brut):', body)

    // Détecter le format (Brevo ou Resend)
    let from, subject, text, html, to

    // Format Brevo
    if (body.items && body.items.length > 0) {
      const item = body.items[0]
      from = item.From?.Address || item.Sender
      subject = item.Subject
      text = item.RawTextBody || item['body-plain']
      html = item.RawHtmlBody || item['body-html']
      to = item.To?.[0]?.Address || 'contact@laiaconnect.fr'

      // Extraire le nom de l'expéditeur
      const fromName = item.From?.Name || ''
      if (fromName) {
        from = `${fromName} <${from}>`
      }
    }
    // Format Resend ou format simplifié
    else {
      from = body.from || body.sender
      subject = body.subject
      text = body.text || body['body-plain'] || body.RawTextBody
      html = body.html || body['body-html'] || body.RawHtmlBody
      to = body.to
    }

    log.info('Email entrant parsé:', {
      from,
      subject,
      to
    })

    if (!from || !subject) {
      log.warn('Email invalide: manque from ou subject')
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Extraire l'adresse email (format: "Name <email@example.com>")
    const emailMatch = from.match(/<(.+)>/) || [null, from]
    const senderEmail = emailMatch[1] || from
    const senderName = from.replace(/<.+>/, '').trim() || senderEmail

    // Chercher l'utilisateur par email
    let user = await prisma.user.findUnique({
      where: { email: senderEmail }
    })

    // Si l'utilisateur n'existe pas, créer un lead
    if (!user) {
      log.info(`Utilisateur non trouvé pour ${senderEmail}, création d'un lead`)

      // Créer un compte utilisateur basique
      user = await prisma.user.create({
        data: {
          email: senderEmail,
          name: senderName,
          password: '', // Pas de mot de passe - l'utilisateur devra en créer un
          role: 'client'
        }
      })

      // Créer un lead
      await prisma.lead.create({
        data: {
          userId: user.id,
          firstName: senderName,
          email: senderEmail,
          source: 'email',
          status: 'new'
        }
      })
    }

    // Vérifier s'il y a déjà un ticket avec cet email (pour éviter les doublons)
    const recentTicket = await prisma.supportTicket.findFirst({
      where: {
        emailSource: senderEmail,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
        }
      }
    })

    if (recentTicket) {
      log.info(`Ticket récent trouvé pour ${senderEmail}, ajout d'un message`)

      // Ajouter le message au ticket existant
      await prisma.ticketMessage.create({
        data: {
          ticketId: recentTicket.id,
          authorId: user.id,
          message: extractEmailText(html || '', text),
          isInternal: false
        }
      })

      return NextResponse.json({
        message: 'Message ajouté au ticket existant',
        ticketNumber: recentTicket.ticketNumber
      })
    }

    // Générer le numéro de ticket
    const ticketNumber = await generateTicketNumber()

    // Déterminer la catégorie et la priorité basées sur le sujet
    let category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'QUESTION' | 'BUG' | 'OTHER' = 'QUESTION'
    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM'

    const subjectLower = subject.toLowerCase()
    if (subjectLower.includes('urgent') || subjectLower.includes('!')) {
      priority = 'URGENT'
    } else if (subjectLower.includes('problème') || subjectLower.includes('erreur')) {
      priority = 'HIGH'
    }

    if (subjectLower.includes('technique') || subjectLower.includes('bug')) {
      category = 'TECHNICAL'
    } else if (subjectLower.includes('facture') || subjectLower.includes('paiement')) {
      category = 'BILLING'
    } else if (subjectLower.includes('fonctionnalité') || subjectLower.includes('demande')) {
      category = 'FEATURE_REQUEST'
    }

    // Créer le ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject,
        description: extractEmailText(html || '', text),
        priority,
        category,
        status: 'OPEN',
        emailSource: senderEmail,
        createdById: user.id
      }
    })

    log.info(`Ticket ${ticketNumber} créé depuis email de ${senderEmail}`)

    // Envoyer un email de confirmation au client
    try {
      await sendEmail({
        to: senderEmail,
        subject: `Re: ${subject} [${ticketNumber}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Votre ticket de support a été créé</h2>

            <p>Bonjour ${senderName},</p>

            <p>Nous avons bien reçu votre message et créé un ticket de support. Notre équipe va l'examiner et vous répondra dans les plus brefs délais.</p>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Numéro de ticket:</strong> ${ticketNumber}</p>
              <p style="margin: 10px 0 0 0;"><strong>Sujet:</strong> ${subject}</p>
            </div>

            <p>Vous pouvez répondre directement à cet email pour ajouter des informations complémentaires. Veuillez conserver le numéro de ticket <strong>${ticketNumber}</strong> dans l'objet de votre email.</p>

            <p>Cordialement,<br>L'équipe LAIA Connect</p>
          </div>
        `
      })
    } catch (emailError) {
      log.error('Erreur envoi email confirmation:', emailError)
    }

    // Notifier le super admin
    try {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'contact@laiaconnect.fr'

      await sendEmail({
        to: superAdminEmail,
        subject: `[Nouveau ticket email] ${ticketNumber} - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Nouveau ticket créé depuis un email</h2>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Numéro:</strong> ${ticketNumber}</p>
              <p style="margin: 10px 0 0 0;"><strong>De:</strong> ${senderName} (${senderEmail})</p>
              <p style="margin: 10px 0 0 0;"><strong>Sujet:</strong> ${subject}</p>
              <p style="margin: 10px 0 0 0;"><strong>Catégorie:</strong> ${category}</p>
              <p style="margin: 10px 0 0 0;"><strong>Priorité:</strong> ${priority}</p>
              <p style="margin: 10px 0 0 0;"><strong>Message:</strong></p>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${extractEmailText(html || '', text).substring(0, 500)}...</p>
            </div>

            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/super-admin/tickets" style="color: #7c3aed;">Voir le ticket dans le super-admin</a></p>
          </div>
        `
      })
    } catch (emailError) {
      log.error('Erreur notification super admin:', emailError)
    }

    return NextResponse.json({
      message: 'Ticket créé avec succès',
      ticketNumber,
      ticketId: ticket.id
    })

  } catch (error) {
    log.error('Erreur webhook email-to-ticket:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
