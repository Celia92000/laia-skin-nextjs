import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

/**
 * API RGPD - Droit à l'oubli (Article 17)
 *
 * Permet à un utilisateur de demander la suppression de toutes ses données personnelles.
 * La suppression effective a lieu 30 jours après la demande (période de grâce).
 *
 * POST /api/gdpr/request-deletion
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
        role: true,
        organizationId: true,
        deletionRequestedAt: true,
        scheduledDeletionAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier qu'une demande n'est pas déjà en cours
    if (user.deletionRequestedAt) {
      return NextResponse.json({
        error: 'Une demande de suppression est déjà en cours',
        deletionRequestedAt: user.deletionRequestedAt,
        scheduledDeletionAt: user.scheduledDeletionAt
      }, { status: 400 });
    }

    // ⚠️ Empêcher les SUPER_ADMIN et ORG_OWNER de se supprimer
    // (ils doivent d'abord transférer la propriété ou contacter le support)
    if (['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role)) {
      return NextResponse.json({
        error: 'Les administrateurs ne peuvent pas supprimer leur compte directement. Veuillez contacter le support.',
        supportEmail: 'contact@laiaconnect.fr'
      }, { status: 403 });
    }

    // Calculer la date de suppression effective (30 jours)
    const deletionRequestedAt = new Date();
    const scheduledDeletionAt = new Date(deletionRequestedAt);
    scheduledDeletionAt.setDate(scheduledDeletionAt.getDate() + 30);

    // Enregistrer la demande de suppression
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletionRequestedAt,
        scheduledDeletionAt
      }
    });

    // TODO : Envoyer un email de confirmation avec lien d'annulation
    // await sendDeletionRequestEmail(user.email, user.name, scheduledDeletionAt);

    return NextResponse.json({
      success: true,
      message: 'Demande de suppression enregistrée',
      deletionRequestedAt,
      scheduledDeletionAt,
      daysRemaining: 30,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/gdpr/cancel-deletion?token=${token}`
    });

  } catch (error) {
    log.error('Erreur demande suppression RGPD:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la demande' },
      { status: 500 }
    );
  }
}
