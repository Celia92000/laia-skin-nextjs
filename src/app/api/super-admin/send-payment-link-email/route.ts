import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { sendPaymentLinkEmail } from '@/lib/email-service'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'

/**
 * API pour envoyer le lien de paiement par email
 * Utilise le système d'emailing existant (Resend)
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification super-admin
    const cookieStore = await cookies()
    const token = cookieStore.get('super_admin_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const data = await request.json()

    // Validation des données requises
    if (!data.email || !data.organizationName || !data.paymentLink) {
      return NextResponse.json(
        { error: 'Données manquantes: email, organizationName et paymentLink requis' },
        { status: 400 }
      )
    }

    // Envoyer l'email avec le système d'emailing existant
    const result = await sendPaymentLinkEmail({
      email: data.email,
      organizationName: data.organizationName,
      ownerFirstName: data.ownerFirstName || '',
      ownerLastName: data.ownerLastName || '',
      plan: data.plan || 'SOLO',
      monthlyAmount: data.monthlyAmount || 49,
      paymentLink: data.paymentLink,
      loginEmail: data.loginEmail || data.email,
      tempPassword: data.tempPassword || '(communiqué séparément)',
      trialDays: 30
    })

    if (!result.success) {
      log.error('Erreur envoi email lien paiement:', result.error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email', details: result.error },
        { status: 500 }
      )
    }

    // Logger l'envoi de l'email dans la communication de l'organisation (si on a l'ID)
    if (data.organizationId) {
      try {
        await prisma.communicationLog.create({
          data: {
            organizationId: data.organizationId,
            type: 'EMAIL',
            direction: 'OUTBOUND',
            recipient: data.email,
            subject: `Bienvenue ${data.organizationName} - Votre espace LAIA Connect est prêt !`,
            content: `Lien de paiement envoyé: ${data.paymentLink}`,
            status: 'SENT',
            sentAt: new Date(),
            metadata: JSON.stringify({
              type: 'payment_link',
              plan: data.plan,
              monthlyAmount: data.monthlyAmount
            })
          }
        })
        log.info(`📧 Email lien paiement loggé pour org ${data.organizationId}`)
      } catch (logError) {
        log.error('Erreur log communication:', logError)
        // On continue même si le log échoue
      }
    }

    log.info(`✅ Email lien de paiement envoyé à ${data.email} pour ${data.organizationName}`)

    return NextResponse.json({
      success: true,
      message: `Email envoyé avec succès à ${data.email}`,
      simulated: result.simulated || false
    })

  } catch (error: any) {
    log.error('Erreur API send-payment-link-email:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}
