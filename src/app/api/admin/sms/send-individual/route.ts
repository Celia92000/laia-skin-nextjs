import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSMS, calculateSMSCount, replaceVariables } from '@/lib/sms-service'

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { clientId, message } = await request.json()

    if (!clientId || !message) {
      return NextResponse.json({ error: 'clientId et message requis' }, { status: 400 })
    }

    // Vérifier l'organisation et ses crédits
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: {
        id: true,
        name: true,
        smsCredits: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Calculer le nombre de SMS nécessaires
    const smsCount = calculateSMSCount(message)

    // Vérifier les crédits
    if (organization.smsCredits < smsCount) {
      return NextResponse.json({
        error: `Crédits insuffisants. Vous avez ${organization.smsCredits} crédits, mais ${smsCount} SMS requis.`
      }, { status: 400 })
    }

    // Récupérer le client
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        organizationId: decoded.organizationId,
        role: 'CLIENT'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    if (!client.phone) {
      return NextResponse.json({ error: 'Le client n\'a pas de numéro de téléphone' }, { status: 400 })
    }

    // Remplacer les variables dans le message
    const personalizedMessage = replaceVariables(message, {
      prenom: client.name?.split(' ')[0] || '',
      nom: client.name?.split(' ').slice(1).join(' ') || '',
      institut: organization.name
    })

    // Envoyer le SMS
    const result = await sendSMS({
      phoneNumber: client.phone,
      message: personalizedMessage,
      organizationName: organization.name
    })

    if (!result.success) {
      return NextResponse.json({
        error: result.errorMessage || 'Erreur lors de l\'envoi du SMS'
      }, { status: 500 })
    }

    // Déduire les crédits
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        smsCredits: {
          decrement: smsCount
        }
      }
    })

    // Enregistrer le log SMS
    await prisma.sMSLog.create({
      data: {
        organizationId: organization.id,
        recipient: client.phone,
        message: personalizedMessage,
        status: result.status || 'sent',
        cost: result.cost || 0,
        messageId: result.messageId,
        sentAt: new Date()
      }
    })

    console.log(`✅ SMS envoyé à ${client.name} (${client.phone}) - ${smsCount} crédit(s) déduit(s)`)

    return NextResponse.json({
      success: true,
      smsCount,
      creditsRemaining: organization.smsCredits - smsCount
    })

  } catch (error: any) {
    console.error('Erreur envoi SMS individuel:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
