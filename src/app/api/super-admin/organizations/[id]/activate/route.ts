import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAccountActivationEmail } from '@/lib/onboarding-emails'
import { verifyAuth } from '@/lib/auth'
import { log } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Vérifier que l'utilisateur est super admin
    const auth = await verifyAuth(req)
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const organizationId = id

    // Récupérer l'organisation
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        users: {
          where: { role: 'ORG_ADMIN' },
          take: 1
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organisation non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier que le compte est bien en PENDING
    if (organization.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Le compte est déjà au statut: ${organization.status}` },
        { status: 400 }
      )
    }

    // Activer le compte (passer en TRIAL pour démarrer l'essai gratuit)
    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        status: 'TRIAL',
        activatedAt: new Date()
      }
    })

    // Récupérer le propriétaire pour envoyer l'email
    const owner = organization.users[0]
    if (!owner) {
      return NextResponse.json(
        { error: 'Aucun propriétaire trouvé pour cette organisation' },
        { status: 404 }
      )
    }

    // Récupérer le mot de passe temporaire (il faut le récupérer depuis le champ notes ou créer un nouveau)
    // Pour l'instant, générons un nouveau mot de passe temporaire
    const bcrypt = require('bcryptjs')
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: owner.id },
      data: { password: hashedPassword }
    })

    // Préparer les données pour l'email
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179
    }

    const adminUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/admin`
      : `https://${organization.subdomain}.laia-connect.fr/admin`

    // Envoyer l'email d'activation avec les identifiants
    try {
      await sendAccountActivationEmail({
        organizationName: organization.name,
        ownerFirstName: organization.ownerFirstName || '',
        ownerLastName: organization.ownerLastName || '',
        ownerEmail: owner.email,
        tempPassword,
        plan: organization.plan,
        subdomain: organization.subdomain,
        customDomain: organization.domain || undefined,
        adminUrl,
        monthlyAmount: planPrices[organization.plan] || 49,
        trialEndsAt: organization.trialEndsAt!,
        sepaMandateRef: organization.sepaMandateRef || ''
      })

      log.info(`✅ Email d'activation envoyé à ${owner.email}`)
    } catch (emailError) {
      log.error('⚠️ Erreur envoi email activation:', emailError)
      // On continue même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Compte activé avec succès',
      organization: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        status: updatedOrg.status,
        activatedAt: updatedOrg.activatedAt
      }
    })

  } catch (error: any) {
    log.error('Erreur activation compte:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
