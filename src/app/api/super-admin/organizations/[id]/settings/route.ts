import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Récupérer l'organisation et tous ses paramètres
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        plan: true
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer les paramètres de paiement
    let paymentSettings = await prisma.paymentSettings.findUnique({
      where: { organizationId: params.id }
    })

    // Si les paramètres de paiement n'existent pas, les créer avec des valeurs par défaut
    if (!paymentSettings) {
      paymentSettings = await prisma.paymentSettings.create({
        data: {
          organizationId: params.id,
          primaryProvider: 'STRIPE'
        }
      })
    }

    // Récupérer les paramètres de réservation
    let bookingSettings = await prisma.bookingSettings.findUnique({
      where: { organizationId: params.id }
    })

    if (!bookingSettings) {
      bookingSettings = await prisma.bookingSettings.create({
        data: {
          organizationId: params.id
        }
      })
    }

    // Récupérer les paramètres du programme de fidélité
    let loyaltySettings = await prisma.loyaltyProgramSettings.findUnique({
      where: { organizationId: params.id }
    })

    if (!loyaltySettings) {
      loyaltySettings = await prisma.loyaltyProgramSettings.create({
        data: {
          organizationId: params.id,
          isEnabled: false
        }
      })
    }

    // Récupérer la configuration de l'organisation
    let organizationConfig = await prisma.organizationConfig.findUnique({
      where: { organizationId: params.id }
    })

    if (!organizationConfig) {
      organizationConfig = await prisma.organizationConfig.create({
        data: {
          organizationId: params.id,
          siteName: organization.name,
          email: '',
          phone: '',
          address: '',
          city: '',
          postalCode: ''
        }
      })
    }

    return NextResponse.json({
      organization,
      paymentSettings: {
        primaryProvider: paymentSettings.primaryProvider,
        stripeConnectAccountId: paymentSettings.stripeConnectAccountId,
        stripeLiveMode: paymentSettings.stripeLiveMode,
        sumupEnabled: paymentSettings.sumupEnabled,
        sumupMerchantCode: paymentSettings.sumupMerchantCode
      },
      bookingSettings: {
        advanceBookingHours: bookingSettings.advanceBookingHours,
        cancellationHours: bookingSettings.cancellationHours,
        requireDeposit: bookingSettings.requireDeposit,
        depositPercentage: bookingSettings.depositPercentage,
        sendConfirmationEmail: bookingSettings.sendConfirmationEmail,
        sendReminderEmail: bookingSettings.sendReminderEmail,
        reminderHoursBefore: bookingSettings.reminderHoursBefore,
        sendWhatsAppReminder: bookingSettings.sendWhatsAppReminder
      },
      loyaltySettings: {
        isEnabled: loyaltySettings.isEnabled,
        name: loyaltySettings.name,
        currency: loyaltySettings.currency,
        pointsPerEuro: loyaltySettings.pointsPerEuro,
        minimumPointsToRedeem: loyaltySettings.minimumPointsToRedeem,
        pointsExpirationMonths: loyaltySettings.pointsExpirationMonths
      },
      organizationConfig: {
        siteName: organizationConfig.siteName,
        email: organizationConfig.email,
        phone: organizationConfig.phone,
        address: organizationConfig.address,
        city: organizationConfig.city,
        postalCode: organizationConfig.postalCode,
        instagramUrl: organizationConfig.instagramUrl,
        facebookUrl: organizationConfig.facebookUrl,
        tiktokUrl: organizationConfig.tiktokUrl,
        whatsappNumber: organizationConfig.whatsappNumber
      }
    })

  } catch (error) {
    console.error('Erreur récupération paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Mettre à jour les paramètres de paiement
    if (data.paymentSettings) {
      await prisma.paymentSettings.update({
        where: { organizationId: params.id },
        data: {
          primaryProvider: data.paymentSettings.primaryProvider,
          stripeConnectAccountId: data.paymentSettings.stripeConnectAccountId || null,
          stripeLiveMode: data.paymentSettings.stripeLiveMode,
          sumupEnabled: data.paymentSettings.sumupEnabled,
          sumupMerchantCode: data.paymentSettings.sumupMerchantCode || null
        }
      })
    }

    // Mettre à jour les paramètres de réservation
    if (data.bookingSettings) {
      await prisma.bookingSettings.update({
        where: { organizationId: params.id },
        data: {
          advanceBookingHours: data.bookingSettings.advanceBookingHours,
          cancellationHours: data.bookingSettings.cancellationHours,
          requireDeposit: data.bookingSettings.requireDeposit,
          depositPercentage: data.bookingSettings.depositPercentage,
          sendConfirmationEmail: data.bookingSettings.sendConfirmationEmail,
          sendReminderEmail: data.bookingSettings.sendReminderEmail,
          reminderHoursBefore: data.bookingSettings.reminderHoursBefore,
          sendWhatsAppReminder: data.bookingSettings.sendWhatsAppReminder
        }
      })
    }

    // Mettre à jour les paramètres du programme de fidélité
    if (data.loyaltySettings) {
      await prisma.loyaltyProgramSettings.update({
        where: { organizationId: params.id },
        data: {
          isEnabled: data.loyaltySettings.isEnabled,
          name: data.loyaltySettings.name,
          currency: data.loyaltySettings.currency,
          pointsPerEuro: data.loyaltySettings.pointsPerEuro,
          minimumPointsToRedeem: data.loyaltySettings.minimumPointsToRedeem,
          pointsExpirationMonths: data.loyaltySettings.pointsExpirationMonths || null
        }
      })
    }

    // Mettre à jour la configuration de l'organisation
    if (data.organizationConfig) {
      await prisma.organizationConfig.update({
        where: { organizationId: params.id },
        data: {
          siteName: data.organizationConfig.siteName,
          email: data.organizationConfig.email,
          phone: data.organizationConfig.phone,
          address: data.organizationConfig.address,
          city: data.organizationConfig.city,
          postalCode: data.organizationConfig.postalCode,
          instagramUrl: data.organizationConfig.instagramUrl || null,
          facebookUrl: data.organizationConfig.facebookUrl || null,
          tiktokUrl: data.organizationConfig.tiktokUrl || null,
          whatsappNumber: data.organizationConfig.whatsappNumber || null
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
