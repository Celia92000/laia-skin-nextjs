import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { verifyToken } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

// GET - Liste tous les codes promo
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification via cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const promoCodes = await prisma.promoCode.findMany({
      where: {
        organizationId: null // Codes globaux LAIA Connect uniquement
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transformer pour le frontend
    const transformed = promoCodes.map(p => ({
      id: p.id,
      code: p.code,
      description: p.description,
      type: p.type,
      value: p.value,
      targetPlans: p.targetPlans ? JSON.parse(p.targetPlans) : [],
      maxUses: p.maxUses,
      currentUses: p.currentUses,
      validFrom: p.validFrom,
      validUntil: p.validUntil,
      status: p.status,
      stripeCouponId: p.stripeCouponId,
      createdAt: p.createdAt
    }))

    return NextResponse.json(transformed)
  } catch (error: any) {
    console.error('Erreur GET promo-codes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Créer un nouveau code promo (avec sync Stripe)
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification via cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const data = await req.json()
    const { code, description, type, value, targetPlans, maxUses, validUntil } = data

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Code, type et valeur sont obligatoires' },
        { status: 400 }
      )
    }

    // Vérifier si le code existe déjà
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Ce code existe déjà' },
        { status: 400 }
      )
    }

    // 1. Créer le coupon Stripe
    let stripeCoupon: Stripe.Coupon | null = null
    let stripePromoCode: Stripe.PromotionCode | null = null

    try {
      // Créer le coupon selon le type
      const couponParams: Stripe.CouponCreateParams = {
        name: `${code} - ${description || 'Code promo LAIA'}`,
        metadata: {
          laia_code: code,
          type: type
        }
      }

      if (type === 'PERCENTAGE') {
        couponParams.percent_off = value
      } else if (type === 'FIXED') {
        couponParams.amount_off = Math.round(value * 100) // En centimes
        couponParams.currency = 'eur'
      } else if (type === 'FREE_TRIAL') {
        // Pour FREE_TRIAL, on utilise un coupon 100% pour le premier mois
        // et on gère les jours d'essai supplémentaires côté application
        couponParams.percent_off = 100
        couponParams.duration = 'once'
        couponParams.metadata!.trial_days = String(value)
      }

      // Durée du coupon
      if (type !== 'FREE_TRIAL') {
        couponParams.duration = 'once' // Une seule fois (premier paiement)
      }

      // Limite d'utilisation
      if (maxUses) {
        couponParams.max_redemptions = maxUses
      }

      // Date d'expiration
      if (validUntil) {
        couponParams.redeem_by = Math.floor(new Date(validUntil).getTime() / 1000)
      }

      stripeCoupon = await stripe.coupons.create(couponParams)

      // 2. Créer le code promo Stripe (le code visible par le client)
      const promoCodeParams: Stripe.PromotionCodeCreateParams = {
        coupon: stripeCoupon.id,
        code: code.toUpperCase(),
        active: true
      }

      if (maxUses) {
        promoCodeParams.max_redemptions = maxUses
      }

      // Restrictions par plan (via metadata, appliquées côté webhook)
      if (targetPlans && targetPlans.length > 0) {
        promoCodeParams.metadata = {
          target_plans: JSON.stringify(targetPlans)
        }
      }

      stripePromoCode = await stripe.promotionCodes.create(promoCodeParams)

      console.log(`✅ Stripe coupon créé: ${stripeCoupon.id}`)
      console.log(`✅ Stripe promo code créé: ${stripePromoCode.id}`)

    } catch (stripeError: any) {
      console.error('❌ Erreur Stripe:', stripeError.message)
      // On continue quand même pour créer en local
    }

    // 3. Créer le code promo en base de données
    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discount: value, // Champ legacy - copie de value
        type,
        value,
        targetPlans: targetPlans ? JSON.stringify(targetPlans) : null,
        maxUses: maxUses || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: 'ACTIVE',
        stripeCouponId: stripeCoupon?.id || null,
        stripePromoId: stripePromoCode?.id || null
      }
    })

    return NextResponse.json({
      success: true,
      promoCode: {
        ...promoCode,
        targetPlans: promoCode.targetPlans ? JSON.parse(promoCode.targetPlans) : []
      },
      stripe: {
        couponId: stripeCoupon?.id,
        promoCodeId: stripePromoCode?.id
      }
    })

  } catch (error: any) {
    console.error('Erreur POST promo-codes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
