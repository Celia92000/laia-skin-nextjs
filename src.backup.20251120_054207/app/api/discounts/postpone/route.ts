import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 🔒 SÉCURITÉ MULTI-TENANT : Récupérer l'organisation
    const organizationId = await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    const { discountId, postponeTo, reason } = await request.json();

    if (!discountId || !postponeTo) {
      return NextResponse.json(
        { error: 'discountId et postponeTo requis' },
        { status: 400 }
      );
    }

    // 🔒 Vérifier que la réduction existe et appartient à cette organisation
    const discount = await prisma.discount.findFirst({
      where: {
        id: discountId,
        organizationId: organizationId
      }
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Réduction non trouvée' },
        { status: 404 }
      );
    }

    if (discount.status !== 'available') {
      return NextResponse.json(
        { error: 'Cette réduction ne peut pas être reportée' },
        { status: 400 }
      );
    }

    // Mettre à jour la réduction
    const updatedDiscount = await prisma.discount.update({
      where: { id: discountId },
      data: {
        status: 'postponed',
        postponedTo: new Date(postponeTo),
        postponedReason: reason || 'Report à la demande du client',
        expiresAt: new Date(postponeTo)
      }
    });

    // 🔒 Créer une nouvelle réduction pour la date reportée DANS CETTE ORGANISATION
    await prisma.discount.create({
      data: {
        userId: discount.userId,
        organizationId: organizationId,
        type: 'postponed',
        amount: discount.amount,
        status: 'available',
        originalReason: `Report: ${discount.originalReason}`,
        postponedFrom: discountId,
        expiresAt: new Date(new Date(postponeTo).getTime() + 30 * 24 * 60 * 60 * 1000), // +30 jours
        notes: reason
      }
    });

    // 🔒 Créer une notification POUR CETTE ORGANISATION
    await prisma.notification.create({
      data: {
        userId: discount.userId,
        organizationId: organizationId,
        type: 'discount',
        title: 'Réduction reportée',
        message: `Votre réduction de ${discount.amount}€ a été reportée au ${new Date(postponeTo).toLocaleDateString('fr-FR')}`,
        read: false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Réduction reportée avec succès',
      newExpiryDate: postponeTo
    });

  } catch (error) {
    log.error('Erreur report réduction:', error);
    return NextResponse.json(
      { error: 'Erreur lors du report de la réduction' },
      { status: 500 }
    );
  }
}