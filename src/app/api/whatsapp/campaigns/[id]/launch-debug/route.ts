import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Version debug qui fonctionne sans authentification stricte
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    console.log(`🚀 Lancement campagne (mode debug): ${id}`);

    // Récupérer la campagne
    const campaign = await prisma.whatsAppCampaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Cette campagne a déjà été lancée' 
      }, { status: 400 });
    }

    // Récupérer le template associé
    const template = await prisma.whatsAppTemplate.findUnique({
      where: { id: campaign.templateId || '' }
    });

    // Mettre à jour le statut de la campagne
    const updatedCampaign = await prisma.whatsAppCampaign.update({
      where: { id },
      data: {
        status: 'active',
        startedAt: new Date(),
        sentCount: campaign.recipientCount || 0
      }
    });

    // Simuler l'envoi des messages
    console.log(`📱 Campagne "${campaign.name}" lancée`);
    console.log(`📨 Template: ${template?.name || 'Non défini'}`);
    console.log(`👥 Envoi à ${campaign.recipientCount} destinataires`);

    // Si des destinataires sont définis, simuler l'envoi
    if (campaign.recipients) {
      try {
        const recipients = JSON.parse(campaign.recipients);
        console.log(`📤 Simulation d'envoi à ${recipients.length} numéros`);
        
        // Récupérer quelques clients pour la simulation
        const clients = await prisma.user.findMany({
          where: {
            role: 'CLIENT',
            phone: { not: null }
          },
          take: 5,
          select: {
            name: true,
            phone: true
          }
        });

        clients.forEach(client => {
          console.log(`  ✉️ Message envoyé à ${client.name} (${client.phone})`);
        });
      } catch (e) {
        console.log('📤 Mode simulation: Envoi des messages...');
      }
    }

    // Après 3 secondes, marquer comme envoyée
    setTimeout(async () => {
      try {
        await prisma.whatsAppCampaign.update({
          where: { id },
          data: { status: 'sent' }
        });
        console.log(`✅ Campagne "${campaign.name}" marquée comme envoyée`);
      } catch (error) {
        console.error('Erreur mise à jour statut:', error);
      }
    }, 3000);

    return NextResponse.json({
      success: true,
      message: 'Campagne lancée avec succès (mode simulation)',
      campaign: {
        ...updatedCampaign,
        templateName: template?.name
      }
    });

  } catch (error) {
    console.error('Erreur lancement campagne:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}