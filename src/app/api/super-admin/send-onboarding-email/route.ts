import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOnboardingInvitationEmail } from '@/lib/email-service'
import { log } from '@/lib/logger';

/**
 * POST /api/super-admin/send-onboarding-email
 * Envoyer l'email d'invitation à l'onboarding avec les credentials
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
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

    // Récupérer les paramètres de l'email
    const { email, institutName, loginEmail, temporaryPassword, loginUrl, leadId } = await request.json()

    if (!email || !institutName || !loginEmail || !temporaryPassword || !loginUrl) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Envoyer l'email d'onboarding
    try {
      await sendOnboardingInvitationEmail({
        email,
        institutName,
        loginEmail,
        temporaryPassword,
        loginUrl
      })

      // Enregistrer l'interaction dans le lead si leadId fourni
      if (leadId) {
        try {
          await prisma.leadInteraction.create({
            data: {
              leadId: leadId,
              userId: decoded.userId,
              type: 'EMAIL',
              subject: `📨 Email d'onboarding envoyé - ${institutName}`,
              content: `Email d'invitation à l'onboarding envoyé à ${email}.\n\n` +
                `**Identifiants de connexion :**\n` +
                `• Email : ${loginEmail}\n` +
                `• Mot de passe : ${temporaryPassword}\n` +
                `• URL de connexion : ${loginUrl}\n\n` +
                `⚠️ Ces identifiants permettent au client de se connecter à son espace admin.`
            }
          })
          log.info(`✅ Interaction EMAIL enregistrée pour le lead ${leadId}`)
        } catch (interactionError) {
          log.error('⚠️ Erreur enregistrement interaction (non bloquant):', interactionError)
          // Ne pas bloquer si l'enregistrement de l'interaction échoue
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Email d\'onboarding envoyé avec succès'
      })
    } catch (emailError: any) {
      log.error('Erreur envoi email onboarding:', emailError)
      return NextResponse.json(
        { error: emailError.message || 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    log.error('Erreur endpoint send-onboarding-email:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
