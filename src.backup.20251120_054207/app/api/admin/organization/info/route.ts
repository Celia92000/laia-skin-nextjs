import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        legalName: true,
        ownerFirstName: true,
        ownerLastName: true,
        ownerEmail: true,
        ownerPhone: true,
        siret: true,
        tvaNumber: true,
        billingEmail: true,
        billingAddress: true,
        billingPostalCode: true,
        billingCity: true,
        billingCountry: true,
        plan: true,
        status: true,
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Erreur récupération infos organisation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    if (!session.isValid || !session.user?.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur a les droits de modification (ORG_OWNER, SUPER_ADMIN uniquement)
    const allowedRoles = ['ORG_ADMIN', 'SUPER_ADMIN']
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({
        error: 'Vous n\'avez pas les droits pour modifier ces informations. Seuls les propriétaires et administrateurs peuvent effectuer cette action.'
      }, { status: 403 })
    }

    const body = await request.json()

    // Mettre à jour l'organisation
    const organization = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        legalName: body.legalName,
        ownerFirstName: body.ownerFirstName,
        ownerLastName: body.ownerLastName,
        ownerEmail: body.ownerEmail,
        ownerPhone: body.ownerPhone,
        siret: body.siret,
        tvaNumber: body.tvaNumber,
        billingEmail: body.billingEmail,
        billingAddress: body.billingAddress,
        billingPostalCode: body.billingPostalCode,
        billingCity: body.billingCity,
        billingCountry: body.billingCountry,
      }
    })

    return NextResponse.json({ success: true, organization })
  } catch (error) {
    console.error('Erreur mise à jour organisation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
