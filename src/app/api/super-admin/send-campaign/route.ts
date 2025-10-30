import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEmailTemplate } from '@/lib/email-templates'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
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

    // Récupérer les données de la requête
    const body = await request.json()
    const { organizationId, templateType, subject, data } = body

    if (!templateType || !subject) {
      return NextResponse.json(
        { error: 'Template et sujet requis' },
        { status: 400 }
      )
    }

    // Récupérer les clients
    const whereClause = organizationId
      ? { organizationId, role: 'CLIENT' as const }
      : { role: 'CLIENT' as const }

    const clients = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        organization: {
          select: {
            slug: true,
            config: {
              select: {
                siteName: true,
                founderName: true,
                legalRepName: true,
                contactEmail: true,
                phone: true,
                address: true,
                city: true,
                postalCode: true,
                primaryColor: true,
                secondaryColor: true,
                instagram: true,
                baseUrl: true
              }
            }
          }
        }
      }
    })

    if (clients.length === 0) {
      return NextResponse.json(
        { error: 'Aucun client trouvé' },
        { status: 404 }
      )
    }

    // Envoyer les emails
    let sentCount = 0
    const errors: string[] = []

    for (const client of clients) {
      try {
        // Préparer les données du template
        const templateData = {
          name: client.name || 'Client',
          email: client.email,
          ...data
        }

        // Générer le contenu de l'email avec la config de l'organisation du client
        const { html, text } = await getEmailTemplate(templateType, templateData)

        // Récupérer l'email d'envoi de l'organisation
        const fromEmail = client.organization?.config?.contactEmail || process.env.EMAIL_FROM || 'noreply@laiaskin.com'
        const fromName = client.organization?.config?.siteName || 'LAIA SKIN Institut'

        // Envoyer l'email
        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: client.email,
          subject: subject.replace(/{{name}}/g, client.name || 'Client'),
          html,
          text
        })

        sentCount++
      } catch (error) {
        console.error(`Erreur envoi email à ${client.email}:`, error)
        errors.push(`${client.email}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
      }
    }

    // TODO: Enregistrer l'activité dans un log dédié aux campagnes email
    // Le modèle AuditLog actuel ne couvre pas les campagnes email
    console.log(`📊 Campagne email ${templateType} envoyée à ${sentCount}/${clients.length} clients`)

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: clients.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Erreur envoi campagne:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
