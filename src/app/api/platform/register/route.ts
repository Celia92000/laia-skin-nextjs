import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { log } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      organizationName,
      subdomain,
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
      plan
    } = data

    // Validation
    if (!organizationName || !subdomain || !ownerName || !ownerEmail || !ownerPassword || !ownerPhone || !plan) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si le subdomain est déjà pris
    const existingOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { subdomain },
          { slug: subdomain }
        ]
      }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Ce nom de domaine est déjà pris. Veuillez en choisir un autre.' },
        { status: 400 }
      )
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findFirst({
      where: { email: ownerEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cette adresse email est déjà utilisée.' },
        { status: 400 }
      )
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(ownerPassword, 10)

    // Définir les limites selon le plan
    const planLimits: { [key: string]: any } = {
      SOLO: { maxLocations: 1, maxUsers: 10, maxServices: 100, maxProducts: 50, maxStaff: 5 },
      DUO: { maxLocations: 2, maxUsers: 25, maxServices: 250, maxProducts: 150, maxStaff: 15 },
      TEAM: { maxLocations: 5, maxUsers: 100, maxServices: 500, maxProducts: 500, maxStaff: 50 },
      PREMIUM: { maxLocations: 999, maxUsers: 999, maxServices: 999, maxProducts: 999, maxStaff: 999 }
    }

    const limits = planLimits[plan] || planLimits.DUO

    // Calculer la date de fin d'essai (14 jours)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // Créer l'organisation
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: subdomain,
        subdomain: subdomain,
        status: 'TRIAL',
        plan: plan,
        trialEndsAt: trialEndsAt,
        ...limits,
        config: {
          create: {
            primaryColor: '#9333ea',
            secondaryColor: '#6366f1',
            fontFamily: 'Inter',
            logoUrl: null,
            faviconUrl: null
          }
        }
      }
    })

    // Créer le premier emplacement
    const location = await prisma.location.create({
      data: {
        name: `${organizationName} - Principal`,
        slug: 'principal',
        address: '',
        city: '',
        postalCode: '',
        phone: ownerPhone,
        email: ownerEmail,
        organizationId: organization.id,
        active: true
      }
    })

    // Créer l'utilisateur propriétaire
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        password: hashedPassword,
        phone: ownerPhone,
        role: 'ORG_ADMIN',
        organizationId: organization.id
      }
    })

    // Associer l'utilisateur à l'emplacement
    await prisma.userLocation.create({
      data: {
        userId: user.id,
        locationId: location.id
      }
    })

    // Créer une notification pour le super admin
    await prisma.superAdminNotification.create({
      data: {
        type: 'NEW_ORGANIZATION',
        title: 'Nouvelle inscription',
        message: `${organizationName} vient de s'inscrire au plan ${plan}`,
        organizationId: organization.id,
        read: false,
        actionUrl: `/super-admin/organizations/${organization.id}`
      }
    })

    // TODO: Envoyer email de bienvenue avec template WELCOME

    return NextResponse.json({
      success: true,
      slug: subdomain,
      organizationId: organization.id,
      message: 'Votre institut a été créé avec succès !'
    })

  } catch (error) {
    log.error('Erreur inscription:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de votre institut. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
