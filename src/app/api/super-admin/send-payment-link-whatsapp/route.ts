import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { WhatsAppService } from '@/lib/whatsapp-service'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger'

/**
 * API pour envoyer le lien de paiement par WhatsApp
 * Utilise le système WhatsApp existant (Twilio ou Meta)
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
    if (!data.phone || !data.organizationName || !data.paymentLink) {
      return NextResponse.json(
        { error: 'Données manquantes: phone, organizationName et paymentLink requis' },
        { status: 400 }
      )
    }

    // Formater le numéro de téléphone (format international)
    let phoneNumber = data.phone.replace(/\s/g, '').replace(/-/g, '')
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '+33' + phoneNumber.slice(1) // France par défaut
    }
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber
    }

    // Construire le message WhatsApp
    const message = `🎉 *Bienvenue sur LAIA Connect !*

Bonjour ${data.ownerFirstName || ''} ${data.ownerLastName || ''},

Votre espace *${data.organizationName}* a été créé !

📋 *Votre forfait :* ${data.plan || 'SOLO'}
💰 *Montant :* ${data.monthlyAmount || 49}€/mois
🎁 *30 jours d'essai gratuit*

---

🔑 *Vos identifiants :*
📧 Email : ${data.loginEmail || data.email}
🔐 Mot de passe : ${data.tempPassword || '(communiqué séparément)'}

---

💳 *Activez votre abonnement ici :*
${data.paymentLink}

🚀 *Accédez à votre espace admin :*
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin

---

Une fois le paiement effectué, vous recevrez automatiquement votre contrat et facture par email.

À très vite !
L'équipe LAIA Connect 💜`

    // Envoyer le message WhatsApp
    try {
      const result = await WhatsAppService.sendMessage(phoneNumber, message)
      log.info(`✅ WhatsApp envoyé à ${phoneNumber} pour ${data.organizationName}`)

      // Logger dans la communication de l'organisation (si on a l'ID)
      if (data.organizationId) {
        try {
          await prisma.communicationLog.create({
            data: {
              organizationId: data.organizationId,
              type: 'WHATSAPP',
              direction: 'OUTBOUND',
              recipient: phoneNumber,
              subject: `Lien de paiement - ${data.organizationName}`,
              content: message,
              status: 'SENT',
              sentAt: new Date(),
              metadata: JSON.stringify({
                type: 'payment_link',
                plan: data.plan,
                monthlyAmount: data.monthlyAmount,
                whatsappId: result?.sid || result?.messages?.[0]?.id
              })
            }
          })
          log.info(`📱 WhatsApp loggé pour org ${data.organizationId}`)
        } catch (logError) {
          log.error('Erreur log communication:', logError)
        }
      }

      return NextResponse.json({
        success: true,
        message: `WhatsApp envoyé avec succès à ${phoneNumber}`,
        whatsappId: result?.sid || result?.messages?.[0]?.id
      })

    } catch (whatsappError: any) {
      log.error('Erreur envoi WhatsApp:', whatsappError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi WhatsApp', details: whatsappError.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    log.error('Erreur API send-payment-link-whatsapp:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}
