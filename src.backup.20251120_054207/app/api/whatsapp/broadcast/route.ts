import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

// POST - Envoyer une campagne de messages groupés
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, clientIds, customMessage, filters } = body;

    let recipients: any[] = [];

    // Si des IDs clients spécifiques sont fournis
    if (clientIds && clientIds.length > 0) {
      recipients = await prisma.user.findMany({
        where: {
          id: { in: clientIds },
          phone: { not: null }
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      });
    } 
    // Sinon, appliquer les filtres
    else if (filters) {
      const whereClause: any = {
        phone: { not: null }
      };

      // Filtrer par type de client
      if (filters.clientType === 'active') {
        // Clients avec réservation dans les 3 derniers mois
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const activeClients = await prisma.reservation.findMany({
          where: {
            createdAt: { gte: threeMonthsAgo }
          },
          select: {
            userId: true
          },
          distinct: ['userId']
        });
        
        whereClause.id = { in: activeClients.map(r => r.userId) };
      }

      // Filtrer par anniversaire du mois
      if (filters.birthday) {
        const currentMonth = new Date().getMonth() + 1;
        whereClause.birthMonth = currentMonth;
      }

      recipients = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      });
    }

    // Simuler l'envoi des messages
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        // Personnaliser le message avec les variables
        let personalizedMessage = customMessage || '';
        personalizedMessage = personalizedMessage.replace('{clientName}', recipient.name || 'Cliente');
        personalizedMessage = personalizedMessage.replace('{phone}', recipient.phone || '');

        // Ici, intégration avec l'API WhatsApp Business
        // Pour le moment, on simule l'envoi

        return {
          recipientId: recipient.id,
          recipientName: recipient.name,
          phone: recipient.phone,
          status: 'sent',
          messageId: `broadcast_${Date.now()}_${recipient.id}`
        };
      })
    );

    // Enregistrer la campagne dans la base de données
    const campaign = {
      id: `campaign_${Date.now()}`,
      templateId,
      recipientCount: recipients.length,
      sentAt: new Date(),
      results
    };

    return NextResponse.json({
      success: true,
      campaign,
      totalSent: recipients.length,
      results
    });
  } catch (error) {
    log.error('Erreur lors de l\'envoi de la campagne:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la campagne' },
      { status: 500 }
    );
  }
}