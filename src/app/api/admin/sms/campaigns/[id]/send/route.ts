import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Envoyer une campagne SMS
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        id: params.id,
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

    // TODO: Intégrer ici l'API SMS (Twilio, Brevo, etc.)
    // Pour l'instant, simulation de l'envoi

    const sentCount = recipients.length;
    const deliveredCount = Math.floor(recipients.length * 0.95); // Simulation: 95% de taux de livraison
    const failedCount = recipients.length - deliveredCount;

    // Créer les logs d'envoi (simulation)
    const smsLogs = recipients.map(recipient => ({
      organizationId: decoded.organizationId,
      campaignId: campaign.id,
      clientId: recipient.id,
      clientName: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
      phoneNumber: recipient.phone || '',
      message: campaign.message
        .replace('{{prenom}}', recipient.firstName || '')
        .replace('{{nom}}', recipient.lastName || '')
        .replace('{{institut}}', decoded.organizationName || 'notre institut'),
      status: Math.random() > 0.05 ? 'delivered' : 'failed', // 95% de succès
      cost: 0.08 // Coût moyen d'un SMS en France
    }));

    // Créer tous les logs en une seule transaction
    await prisma.sMSLog.createMany({
      data: smsLogs
    });

    // Mettre à jour la campagne
    const updatedCampaign = await prisma.sMSCampaign.update({
      where: {
        id: params.id
      },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        sentCount,
        deliveredCount,
        failedCount,
        totalCost: sentCount * 0.08
      }
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: `Campagne envoyée avec succès à ${sentCount} destinataires !`
    });
  } catch (error) {
    console.error('Error sending SMS campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la campagne' }, { status: 500 });
  }
}
