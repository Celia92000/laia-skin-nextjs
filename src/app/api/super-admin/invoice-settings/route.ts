import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { log } from '@/lib/logger';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient()

/**
 * GET /api/super-admin/invoice-settings
 * Récupère les paramètres de facturation
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 Vérification SUPER_ADMIN obligatoire
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé - Rôle SUPER_ADMIN requis' }, { status: 403 });
    }

    const settings = await prisma.invoiceSettings.findFirst()

    if (!settings) {
      return NextResponse.json(
        { error: 'Paramètres de facturation non trouvés' },
        { status: 404 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    log.error('Erreur lors de la récupération des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/super-admin/invoice-settings
 * Met à jour les paramètres de facturation
 */
export async function PUT(req: NextRequest) {
  try {
    // 🔒 Vérification SUPER_ADMIN obligatoire
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé - Rôle SUPER_ADMIN requis' }, { status: 403 });
    }

    const data = await req.json()

    // Vérifier que l'ID est fourni
    if (!data.id) {
      return NextResponse.json(
        { error: 'ID requis pour la mise à jour' },
        { status: 400 }
      )
    }

    // Validation des champs requis
    const requiredFields = ['companyName', 'address', 'postalCode', 'city', 'country', 'siret', 'email']
    const missingFields = requiredFields.filter(field => !data[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Champs requis manquants: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validation du SIRET (14 chiffres)
    if (data.siret && !/^\d{14}$/.test(data.siret)) {
      return NextResponse.json(
        { error: 'Le SIRET doit contenir exactement 14 chiffres' },
        { status: 400 }
      )
    }

    // Validation du taux de TVA (entre 0 et 100)
    if (data.tvaRate !== undefined && (data.tvaRate < 0 || data.tvaRate > 100)) {
      return NextResponse.json(
        { error: 'Le taux de TVA doit être entre 0 et 100' },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (data.email && !emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // Mise à jour des paramètres
    const updatedSettings = await prisma.invoiceSettings.update({
      where: { id: data.id },
      data: {
        isCompany: data.isCompany ?? false,
        legalStatus: data.legalStatus,
        companyName: data.companyName,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        siret: data.siret,
        tvaNumber: data.tvaNumber || '',
        capitalSocial: data.capitalSocial || '',
        rcs: data.rcs || '',
        apeCode: data.apeCode,
        email: data.email,
        phone: data.phone || '',
        website: data.website || '',
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        invoicePrefix: data.invoicePrefix,
        tvaRate: data.tvaRate ?? 0,
        paymentTerms: data.paymentTerms,
        latePenalty: data.latePenalty,
        footerText: data.footerText || '',
        contractArticle1: data.contractArticle1,
        contractArticle3: data.contractArticle3,
        contractArticle4: data.contractArticle4,
        contractArticle6: data.contractArticle6,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      settings: updatedSettings
    })
  } catch (error) {
    log.error('Erreur lors de la mise à jour des paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}
