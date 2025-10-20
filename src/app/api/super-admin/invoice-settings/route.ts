import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/super-admin/invoice-settings
 * Récupère les paramètres de facturation
 */
export async function GET(request: NextRequest) {
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

    // Récupérer les paramètres (il n'y en a qu'un seul)
    let settings = await prisma.invoiceSettings.findFirst()

    // Si aucun paramètre n'existe, créer les paramètres par défaut
    if (!settings) {
      settings = await prisma.invoiceSettings.create({
        data: {} // Les valeurs par défaut sont dans le schéma Prisma
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erreur récupération paramètres facture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/super-admin/invoice-settings
 * Sauvegarde les paramètres de facturation
 */
export async function POST(request: NextRequest) {
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

    const data = await request.json()

    // Vérifier si des paramètres existent déjà
    const existing = await prisma.invoiceSettings.findFirst()

    let settings
    if (existing) {
      // Mettre à jour
      settings = await prisma.invoiceSettings.update({
        where: { id: existing.id },
        data: {
          companyName: data.companyName,
          address: data.address,
          postalCode: data.postalCode,
          city: data.city,
          country: data.country,
          siret: data.siret,
          tvaNumber: data.tvaNumber,
          capitalSocial: data.capitalSocial,
          rcs: data.rcs,
          email: data.email,
          phone: data.phone,
          website: data.website,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          invoicePrefix: data.invoicePrefix,
          tvaRate: data.tvaRate,
          paymentTerms: data.paymentTerms,
          latePenalty: data.latePenalty,
          footerText: data.footerText,
        }
      })
    } else {
      // Créer
      settings = await prisma.invoiceSettings.create({
        data: {
          companyName: data.companyName,
          address: data.address,
          postalCode: data.postalCode,
          city: data.city,
          country: data.country,
          siret: data.siret,
          tvaNumber: data.tvaNumber,
          capitalSocial: data.capitalSocial,
          rcs: data.rcs,
          email: data.email,
          phone: data.phone,
          website: data.website,
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          invoicePrefix: data.invoicePrefix,
          tvaRate: data.tvaRate,
          paymentTerms: data.paymentTerms,
          latePenalty: data.latePenalty,
          footerText: data.footerText,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Erreur sauvegarde paramètres facture:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
