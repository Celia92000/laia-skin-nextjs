import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/organization/config
 * Récupère la configuration de facturation de l'organisation
 * Accessible par tous les membres de l'organisation
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Récupérer l'utilisateur et son organisation
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: {
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 })
    }

    // Récupérer la configuration de l'organisation
    let config = await prisma.organizationConfig.findUnique({
      where: { organizationId: user.organizationId },
      select: {
        siteName: true,
        address: true,
        postalCode: true,
        city: true,
        phone: true,
        email: true,
        siret: true,
        tvaNumber: true,
        invoicePrefix: true,
        invoiceLegalDiscount: true,
        invoiceLegalPenalty: true,
        invoiceLegalRecoveryFee: true,
        invoiceLegalPaymentTerms: true,
        invoiceLegalFooter: true,
      }
    })

    // Si pas de config, créer une par défaut
    if (!config) {
      config = await prisma.organizationConfig.create({
        data: {
          organizationId: user.organizationId,
          siteName: user.organization?.name || 'Institut de Beauté',
          address: 'Adresse à configurer',
          postalCode: '00000',
          city: 'Ville',
          phone: '00 00 00 00 00',
          email: 'contact@institut.fr',
          invoicePrefix: 'FACT',
          invoiceLegalDiscount: 'Aucun escompte accordé pour paiement anticipé',
          invoiceLegalPenalty: 'En cas de retard de paiement : pénalités au taux de 3 fois le taux d\'intérêt légal',
          invoiceLegalRecoveryFee: 'Indemnité forfaitaire de 40€ pour frais de recouvrement en cas de retard',
          invoiceLegalPaymentTerms: 'Paiement à réception',
          invoiceLegalFooter: 'Facture à conserver 10 ans',
        },
        select: {
          siteName: true,
          address: true,
          postalCode: true,
          city: true,
          phone: true,
          email: true,
          siret: true,
          tvaNumber: true,
          invoicePrefix: true,
          invoiceLegalDiscount: true,
          invoiceLegalPenalty: true,
          invoiceLegalRecoveryFee: true,
          invoiceLegalPaymentTerms: true,
          invoiceLegalFooter: true,
        }
      })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Erreur récupération config organisation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
