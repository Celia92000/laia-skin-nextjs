import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

/**
 * API RGPD - Annulation du Droit à l'oubli
 *
 * Permet à un utilisateur d'annuler sa demande de suppression dans les 30 jours.
 *
 * POST /api/gdpr/cancel-deletion
 */
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        deletionRequestedAt: true,
        scheduledDeletionAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier qu'une demande est bien en cours
    if (!user.deletionRequestedAt || !user.scheduledDeletionAt) {
      return NextResponse.json({
        error: 'Aucune demande de suppression en cours'
      }, { status: 400 });
    }

    // Vérifier que la date de suppression n'est pas dépassée
    const now = new Date();
    if (now >= user.scheduledDeletionAt) {
      return NextResponse.json({
        error: 'La période d\'annulation est expirée. Vos données sont en cours de suppression.',
        scheduledDeletionAt: user.scheduledDeletionAt
      }, { status: 400 });
    }

    // Annuler la demande de suppression
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletionRequestedAt: null,
        scheduledDeletionAt: null
      }
    });

    // TODO : Envoyer un email de confirmation d'annulation
    // await sendDeletionCancelledEmail(user.email, user.name);

    const daysRemaining = Math.ceil(
      (user.scheduledDeletionAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      success: true,
      message: 'Demande de suppression annulée avec succès',
      cancelledAt: now,
      daysRemainingBeforeCancellation: daysRemaining
    });

  } catch (error) {
    log.error('Erreur annulation suppression RGPD:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de la demande' },
      { status: 500 }
    );
  }
}
