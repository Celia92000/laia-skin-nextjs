import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Récupérer les paramètres CGV actuels
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les paramètres CGV depuis les settings de facturation
    const settings = await prisma.invoiceSettings.findFirst()

    if (!settings) {
      // Retourner les valeurs par défaut
      return NextResponse.json({
        id: '',
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        companyName: 'LAIA Connect',
        companyAddress: '65 rue de la Croix',
        companyPostalCode: '92000',
        companyCity: 'Nanterre',
        companySiret: '988 691 937 00001',
        companyEmail: 'contact@laiaconnect.fr',
        companyPhone: '',
        companyWebsite: 'https://www.laiaconnect.fr',
        priceSolo: 49,
        priceDuo: 69,
        priceTeam: 119,
        pricePremium: 179,
        tvaRate: 20,
        trialDays: 30,
        supportResponseTime: '48h ouvrées',
        dataRetentionDays: 30,
        liabilityCapMonths: 3,
        modificationNoticeDays: 30,
        priceChangeNoticeDays: 60,
      })
    }

    // Construire la réponse à partir des settings existants
    const cgvData = {
      id: settings.id,
      version: (settings as any).cgvVersion || '1.0',
      lastUpdated: (settings as any).cgvLastUpdated || settings.updatedAt?.toISOString() || new Date().toISOString(),
      companyName: settings.companyName,
      companyAddress: settings.address,
      companyPostalCode: settings.postalCode,
      companyCity: settings.city,
      companySiret: settings.siret,
      companyEmail: settings.email,
      companyPhone: settings.phone || '',
      companyWebsite: settings.website || '',
      priceSolo: (settings as any).priceSolo || 49,
      priceDuo: (settings as any).priceDuo || 69,
      priceTeam: (settings as any).priceTeam || 119,
      pricePremium: (settings as any).pricePremium || 179,
      tvaRate: settings.tvaRate || 20,
      trialDays: (settings as any).trialDays || 30,
      supportResponseTime: (settings as any).supportResponseTime || '48h ouvrées',
      dataRetentionDays: (settings as any).dataRetentionDays || 30,
      liabilityCapMonths: (settings as any).liabilityCapMonths || 3,
      modificationNoticeDays: (settings as any).modificationNoticeDays || 30,
      priceChangeNoticeDays: (settings as any).priceChangeNoticeDays || 60,
    }

    return NextResponse.json(cgvData)
  } catch (error) {
    console.error('Erreur GET CGV:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Mettre à jour les paramètres CGV
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data = await request.json()

    // Récupérer les settings existants ou créer de nouveaux
    let settings = await prisma.invoiceSettings.findFirst()

    const cgvFields = {
      cgvVersion: data.version,
      cgvLastUpdated: new Date(),
      priceSolo: data.priceSolo,
      priceDuo: data.priceDuo,
      priceTeam: data.priceTeam,
      pricePremium: data.pricePremium,
      trialDays: data.trialDays,
      supportResponseTime: data.supportResponseTime,
      dataRetentionDays: data.dataRetentionDays,
      liabilityCapMonths: data.liabilityCapMonths,
      modificationNoticeDays: data.modificationNoticeDays,
      priceChangeNoticeDays: data.priceChangeNoticeDays,
    }

    if (settings) {
      // Mettre à jour les settings existants
      settings = await prisma.invoiceSettings.update({
        where: { id: settings.id },
        data: {
          companyName: data.companyName,
          address: data.companyAddress,
          postalCode: data.companyPostalCode,
          city: data.companyCity,
          siret: data.companySiret,
          email: data.companyEmail,
          phone: data.companyPhone,
          website: data.companyWebsite,
          tvaRate: data.tvaRate,
          // Les champs CGV sont stockés dans metadata ou ajoutés au modèle
          ...cgvFields as any,
        },
      })
    } else {
      // Créer de nouveaux settings
      settings = await prisma.invoiceSettings.create({
        data: {
          companyName: data.companyName,
          address: data.companyAddress,
          postalCode: data.companyPostalCode,
          city: data.companyCity,
          country: 'France',
          siret: data.companySiret,
          email: data.companyEmail,
          phone: data.companyPhone || '',
          website: data.companyWebsite || '',
          tvaRate: data.tvaRate,
          invoicePrefix: 'LAIA',
          primaryColor: '#7c3aed',
          secondaryColor: '#c9a88e',
          ...cgvFields as any,
        },
      })
    }

    // Logger l'activité
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CGV_UPDATED',
        entityType: 'CGV',
        entityId: settings.id,
        description: `CGV mises à jour - Version ${data.version}`,
        metadata: {
          version: data.version,
          changes: data,
        },
      },
    })

    return NextResponse.json({
      ...data,
      id: settings.id,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erreur PUT CGV:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
