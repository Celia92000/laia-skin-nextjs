import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPackageById } from '@/lib/sms-packages'
import Stripe from 'stripe'
import { log } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

/**
 * Créer une session de paiement Stripe pour acheter des crédits SMS
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
    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { packageId } = await request.json()

    if (!packageId) {
      return NextResponse.json({ error: 'packageId requis' }, { status: 400 })
    }

    // Récupérer le forfait SMS
    const smsPackage = getPackageById(packageId)
    if (!smsPackage) {
      return NextResponse.json({ error: 'Forfait SMS non trouvé' }, { status: 404 })
    }

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: {
        id: true,
        name: true,
        stripeCustomerId: true,
        ownerEmail: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Créer ou récupérer le client Stripe
    let stripeCustomerId = organization.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: organization.ownerEmail,
        name: organization.name,
        metadata: {
          organizationId: organization.id
        }
      })

      stripeCustomerId = customer.id

      // Mettre à jour l'organisation avec le stripeCustomerId
      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId }
      })
    }

    // Créer la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card', 'sepa_debit'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: smsPackage.name,
              description: `${smsPackage.credits} crédits SMS - ${smsPackage.description}`,
              images: []
            },
            unit_amount: Math.round(smsPackage.price * 100) // Convertir en centimes
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/admin?tab=sms&purchase=success&credits=${smsPackage.credits}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/admin?tab=sms&purchase=cancelled`,
      metadata: {
        organizationId: organization.id,
        packageId: smsPackage.id,
        credits: smsPackage.credits.toString(),
        type: 'sms_credits'
      }
    })

    log.info(`✅ Session Stripe créée: ${session.id} pour ${smsPackage.name}`)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error: any) {
    log.error('Erreur création session Stripe SMS:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
