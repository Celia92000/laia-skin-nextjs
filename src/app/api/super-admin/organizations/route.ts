import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Récupérer les données du formulaire
    const data = await request.json()

    // Vérifier que le slug et subdomain sont uniques
    const existingOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: data.slug },
          { subdomain: data.subdomain }
        ]
      }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Le slug ou subdomain existe déjà' },
        { status: 400 }
      )
    }

    // Créer l'organisation
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        legalName: data.legalName || data.name,
        type: data.type,
        subdomain: data.subdomain,
        domain: data.domain || null,
        plan: data.plan,
        status: 'TRIAL', // Démarrer en période d'essai
        ownerEmail: data.ownerEmail,
        ownerPhone: data.ownerPhone,
        maxLocations: data.plan === 'SOLO' ? 1 : data.plan === 'DUO' ? 1 : data.plan === 'TEAM' ? 3 : 999,
        maxUsers: data.plan === 'SOLO' ? 1 : data.plan === 'DUO' ? 3 : data.plan === 'TEAM' ? 10 : 999,
        maxStorage: data.plan === 'SOLO' ? 5 : data.plan === 'DUO' ? 10 : data.plan === 'TEAM' ? 50 : 999,
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours d'essai
      }
    })

    // Créer la configuration de l'organisation
    await prisma.organizationConfig.create({
      data: {
        organizationId: organization.id,
        siteName: data.siteName || data.name,
        email: data.email || data.ownerEmail,
        phone: data.phone || data.ownerPhone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
      }
    })

    // Créer l'emplacement principal
    await prisma.location.create({
      data: {
        organizationId: organization.id,
        name: data.locationName || `${data.name} - Principal`,
        slug: 'principal',
        address: data.locationAddress || data.address || 'À définir',
        city: data.locationCity || data.city || 'À définir',
        postalCode: data.locationPostalCode || data.postalCode || '00000',
        isMainLocation: true,
        active: true
      }
    })

    // Créer les paramètres de paiement
    await prisma.paymentSettings.create({
      data: {
        organizationId: organization.id,
        primaryProvider: 'STRIPE'
      }
    })

    // Créer les paramètres de réservation
    await prisma.bookingSettings.create({
      data: {
        organizationId: organization.id
      }
    })

    // Créer le programme de fidélité (désactivé par défaut)
    await prisma.loyaltyProgramSettings.create({
      data: {
        organizationId: organization.id,
        isEnabled: false
      }
    })

    return NextResponse.json({
      id: organization.id,
      message: 'Organisation créée avec succès'
    })

  } catch (error) {
    console.error('Erreur création organisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
