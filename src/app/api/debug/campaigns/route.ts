import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET() {
  try {
    const campaigns = await prisma.whatsAppCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    log.info(`\n📊 DEBUG Campagnes WhatsApp:`);
    log.info(`Total: ${campaigns.length} campagnes`);
    
    campaigns.forEach(campaign => {
      log.info(`\n📢 ${campaign.name}:`);
      log.info(`  - ID: ${campaign.id}`);
      log.info(`  - Status: ${campaign.status}`);
      log.info(`  - Template ID: ${campaign.templateId || 'NON DÉFINI'}`);
      log.info(`  - Destinataires: ${campaign.recipientCount}`);
      log.info(`  - Créée: ${campaign.createdAt}`);
    });

    return NextResponse.json({
      success: true,
      count: campaigns.length,
      campaigns: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        templateId: c.templateId,
        templateName: null,
        recipientCount: c.recipientCount,
        createdAt: c.createdAt
      }))
    });

  } catch (error) {
    log.error('Erreur debug campagnes:', error);
    return NextResponse.json({ 
      error: 'Erreur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}