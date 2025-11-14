import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const campaign = await prisma.whatsAppCampaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    log.error('Erreur récupération campagne:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier le rôle de l'utilisateur
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'ORG_OWNER' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, templateId, recipients, scheduledAt, status } = body;

    // Vérifier que la campagne existe
    const existingCampaign = await prisma.whatsAppCampaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    // Ne pas modifier une campagne déjà envoyée
    if (existingCampaign.status === 'sent') {
      return NextResponse.json({ 
        error: 'Impossible de modifier une campagne déjà envoyée' 
      }, { status: 400 });
    }

    // Mettre à jour la campagne
    const updatedCampaign = await prisma.whatsAppCampaign.update({
      where: { id },
      data: {
        name: name || existingCampaign.name,
        templateId: templateId || existingCampaign.templateId,
        recipients: recipients ? JSON.stringify(recipients) : existingCampaign.recipients,
        recipientCount: recipients ? recipients.length : existingCampaign.recipientCount,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingCampaign.scheduledAt,
        status: status || existingCampaign.status
      }
    });

    log.info(`✅ Campagne ${updatedCampaign.name} modifiée`);

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign
    });

  } catch (error) {
    log.error('Erreur modification campagne:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier le rôle de l'utilisateur
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'ORG_OWNER' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier que la campagne existe
    const existingCampaign = await prisma.whatsAppCampaign.findUnique({
      where: { id }
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campagne non trouvée' }, { status: 404 });
    }

    // Ne pas supprimer une campagne active ou envoyée
    if (existingCampaign.status === 'active' || existingCampaign.status === 'sent') {
      return NextResponse.json({ 
        error: 'Impossible de supprimer une campagne active ou envoyée' 
      }, { status: 400 });
    }

    // Supprimer la campagne
    await prisma.whatsAppCampaign.delete({
      where: { id }
    });

    log.info(`🗑️ Campagne ${existingCampaign.name} supprimée`);

    return NextResponse.json({ 
      success: true, 
      message: 'Campagne supprimée avec succès' 
    });

  } catch (error) {
    log.error('Erreur suppression campagne:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}