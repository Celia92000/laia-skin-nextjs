import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendBulkSMS, replaceVariables } from '@/lib/sms-service';
import { log } from '@/lib/logger';

// POST - Envoyer une campagne SMS
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);

    if (!decoded || !decoded.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer la campagne
    const campaign = await prisma.sMSCampaign.findUnique({
      where: {
        id: id,
        organizationId: decoded.organizationId
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    // Vérifier que la campagne est en brouillon
    if (campaign.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Cette campagne a déjà été envoyée ou est programmée' }, { status: 400 });
    }

    // Récupérer les destinataires selon le segment
    let recipients: { id: string; phone?: string | null; firstName?: string | null; lastName?: string | null }[] = [];

    if (!campaign.segmentId) {
      // Tous les clients avec numéro de téléphone
      recipients = await prisma.user.findMany({
        where: {
          organizationId: decoded.organizationId,
          role: 'CLIENT',
          phone: {
            not: null
          }
        },
        select: {
          id: true,
          phone: true,
          firstName: true,
          lastName: true
        }
      });
    } else if (campaign.segmentId === 'vip') {
      // Clients VIP uniquement
      recipients = await prisma.user.findMany({
        where: {
          organizationId: decoded.organizationId,
          role: 'CLIENT',
          vipStatus: 'VIP',
          phone: {
            not: null
          }
        },
        select: {
          id: true,
          phone: true,
          firstName: true,
          lastName: true
        }
      });
    } else if (campaign.segmentId === 'inactive') {
      // Clients inactifs (dernière visite > 3 mois)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      recipients = await prisma.user.findMany({
        where: {
          organizationId: decoded.organizationId,
          role: 'CLIENT',
          phone: {
            not: null
          },
          lastVisit: {
            lt: threeMonthsAgo
          }
        },
        select: {
          id: true,
          phone: true,
          firstName: true,
          lastName: true
        }
      });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'Aucun destinataire trouvé avec un numéro de téléphone' }, { status: 400 });
    }

    // Récupérer le nom de l'organisation pour l'expéditeur SMS
    const organization = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: { name: true }
    });

    const organizationName = organization?.name || 'LAIA';

    // Préparer les messages personnalisés pour chaque destinataire
    const smsToSend = recipients.map(recipient => ({
      phoneNumber: recipient.phone || '',
      message: replaceVariables(campaign.message, {
        prenom: recipient.firstName || '',
        nom: recipient.lastName || '',
        institut: organizationName
      })
    }));

    // Envoyer les SMS via Brevo API
    const { totalSent, totalFailed, results } = await sendBulkSMS(
      smsToSend,
      organizationName
    );

    // Créer les logs d'envoi avec les résultats réels
    const smsLogs = recipients.map((recipient, index) => {
      const result = results[index];

      return {
        organizationId: decoded.organizationId || '',
        campaignId: campaign.id,
        clientId: recipient.id,
        clientName: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
        phoneNumber: recipient.phone || '',
        message: smsToSend[index].message,
        status: result.success ? (result.status || 'sent') : 'failed',
        errorMessage: result.errorMessage || null,
        cost: result.cost || 0.035
      };
    });

    // Créer tous les logs en une seule transaction
    await prisma.sMSLog.createMany({
      data: smsLogs
    });

    // Calculer le coût total
    const totalCost = smsLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

    // Mettre à jour la campagne avec les résultats réels
    const updatedCampaign = await prisma.sMSCampaign.update({
      where: {
        id: id
      },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentCount: totalSent,
        deliveredCount: totalSent, // Brevo confirme l'envoi, pas forcément la livraison immédiate
        failedCount: totalFailed,
        totalCost
      }
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: `Campagne envoyée avec succès ! ${totalSent} SMS envoyés, ${totalFailed} échecs. Coût total: ${totalCost.toFixed(2)}€`
    });
  } catch (error) {
    log.error('Error sending SMS campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la campagne' }, { status: 500 });
  }
}
