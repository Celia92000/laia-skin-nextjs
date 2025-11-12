import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';

/**
 * CRON JOB - Traitement des suppressions RGPD
 *
 * Exécute automatiquement les suppressions de comptes demandées il y a 30+ jours.
 * À exécuter quotidiennement via Vercel Cron ou équivalent.
 *
 * GET /api/cron/process-gdpr-deletions?secret=CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();

  try {
    // 🔒 Sécurité : Vérifier le secret CRON
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const now = new Date();

    // 🔍 Trouver tous les utilisateurs dont la date de suppression est dépassée
    const usersToDelete = await prisma.user.findMany({
      where: {
        scheduledDeletionAt: {
          lte: now // Date de suppression <= maintenant
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        deletionRequestedAt: true,
        scheduledDeletionAt: true
      }
    });

    if (usersToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucune suppression RGPD à traiter',
        processedAt: now,
        deletedCount: 0
      });
    }

    const deletionResults = [];

    // 🗑️ Traiter chaque utilisateur individuellement
    for (const user of usersToDelete) {
      try {
        console.log(`[GDPR] Traitement suppression utilisateur: ${user.email} (ID: ${user.id})`);

        // 🔥 SUPPRESSION EN CASCADE
        // Grâce aux relations Prisma avec onDelete: Cascade, la plupart des données
        // liées seront supprimées automatiquement.
        // Pour les relations sans cascade, on doit supprimer manuellement.

        // 1. Supprimer les réservations staffées par cet utilisateur
        await prisma.reservation.updateMany({
          where: { staffId: user.id },
          data: { staffId: null }
        });

        // 2. Supprimer les leads assignés à cet utilisateur
        await prisma.lead.updateMany({
          where: { assignedToId: user.id },
          data: { assignedToId: null }
        });

        // 3. Supprimer les tickets assignés à cet utilisateur
        await prisma.supportTicket.updateMany({
          where: { assignedToId: user.id },
          data: { assignedToId: null }
        });

        // 4. Anonymiser les commandes (garder les données financières mais supprimer les infos perso)
        await prisma.order.updateMany({
          where: { userId: user.id },
          data: {
            customerName: '[Compte supprimé]',
            customerEmail: '[supprimé@gdpr.local]',
            customerPhone: null,
            shippingAddress: null,
            billingAddress: null
          }
        });

        // 5. Anonymiser les paiements
        await prisma.payment.updateMany({
          where: { userId: user.id },
          data: {
            customerEmail: '[supprimé@gdpr.local]'
          }
        });

        // 6. Anonymiser les avis Google
        await prisma.review.updateMany({
          where: { userId: user.id },
          data: {
            authorName: '[Compte supprimé]',
            authorEmail: '[supprimé@gdpr.local]',
            comment: '[Commentaire supprimé pour respect du RGPD]'
          }
        });

        // 7. Supprimer l'historique email lié à cet utilisateur
        await prisma.emailHistory.deleteMany({
          where: { userId: user.id }
        });

        // 8. Supprimer les tokens API
        await prisma.apiToken.deleteMany({
          where: { userId: user.id }
        });

        // 9. SUPPRESSION FINALE DE L'UTILISATEUR
        // (Cascade supprimera automatiquement : loyaltyHistory, loyaltyProfile,
        // clientEvolution, notifications, referrals, discounts, etc.)
        await prisma.user.delete({
          where: { id: user.id }
        });

        console.log(`[GDPR] ✅ Suppression réussie : ${user.email}`);

        deletionResults.push({
          userId: user.id,
          email: user.email,
          success: true,
          deletedAt: now
        });

      } catch (error) {
        console.error(`[GDPR] ❌ Erreur suppression ${user.email}:`, error);
        deletionResults.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    // 📊 Résumé
    const successCount = deletionResults.filter(r => r.success).length;
    const failureCount = deletionResults.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount} compte(s) supprimé(s), ${failureCount} échec(s)`,
      processedAt: now,
      totalProcessed: usersToDelete.length,
      successCount,
      failureCount,
      details: deletionResults
    });

  } catch (error) {
    console.error('Erreur CRON RGPD suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement des suppressions RGPD' },
      { status: 500 }
    );
  }
}
