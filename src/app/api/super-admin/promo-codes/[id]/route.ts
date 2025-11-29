import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { verifyToken } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

// GET - Récupérer un code promo spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const promoCode = await prisma.promoCode.findUnique({
      where: { id }
    })

    if (!promoCode) {
      return NextResponse.json({ error: 'Code promo non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      ...promoCode,
      targetPlans: promoCode.targetPlans ? JSON.parse(promoCode.targetPlans) : []
    })
  } catch (error: any) {
    console.error('Erreur GET promo-code:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Modifier un code promo (status, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params
    const data = await req.json()
    const { status, description, maxUses, validUntil } = data

    // Récupérer le code actuel
    const existing = await prisma.promoCode.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Code promo non trouvé' }, { status: 404 })
    }

    // Synchroniser avec Stripe si on change le status
    if (status && existing.stripePromoId) {
      try {
        const isActive = status === 'ACTIVE'
        await stripe.promotionCodes.update(existing.stripePromoId, {
          active: isActive
        })
        console.log(`✅ Stripe promo code ${existing.stripePromoId} mis à jour: active=${isActive}`)
      } catch (stripeError: any) {
        console.error('❌ Erreur sync Stripe:', stripeError.message)
        // On continue quand même
      }
    }

    // Mettre à jour en base
    const updateData: any = {}
    if (status) updateData.status = status
    if (description !== undefined) updateData.description = description
    if (maxUses !== undefined) updateData.maxUses = maxUses
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null

    const updated = await prisma.promoCode.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      promoCode: {
        ...updated,
        targetPlans: updated.targetPlans ? JSON.parse(updated.targetPlans) : []
      }
    })

  } catch (error: any) {
    console.error('Erreur PATCH promo-code:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Supprimer un code promo
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { id } = await params

    // Récupérer le code
    const existing = await prisma.promoCode.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Code promo non trouvé' }, { status: 404 })
    }

    // Désactiver sur Stripe (on ne supprime pas pour garder l'historique)
    if (existing.stripePromoId) {
      try {
        await stripe.promotionCodes.update(existing.stripePromoId, {
          active: false
        })
        console.log(`✅ Stripe promo code ${existing.stripePromoId} désactivé`)
      } catch (stripeError: any) {
        console.error('❌ Erreur désactivation Stripe:', stripeError.message)
      }
    }

    // Supprimer le coupon Stripe (optionnel, car ça invalide tous les codes liés)
    // On préfère juste désactiver le promo code

    // Supprimer en base
    await prisma.promoCode.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Erreur DELETE promo-code:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
