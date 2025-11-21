import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/logger';

// Vérification admin
async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    const prisma = await getPrismaClient();
    const user = await prisma.user.findFirst({
      where: { id: decoded.userId }
    });

    if (!user || !['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER'].includes(user.role as string)) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

// GET - Récupérer les analytics du funnel
export async function GET(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!admin.organizationId) {
    return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get('funnelId');

    // Si un funnelId est fourni, retourner les stats pour ce funnel spécifique
    if (funnelId) {
      const funnel = await prisma.conversionFunnel.findFirst({
        where: {
          id: funnelId,
          organizationId: admin.organizationId ?? undefined
        },
        include: {
          entries: true
        }
      });

      if (!funnel) {
        return NextResponse.json({ error: 'Funnel non trouvé' }, { status: 404 });
      }

      // Calculer les statistiques par étape
      const stageStats = await calculateFunnelStats(funnel.id);

      return NextResponse.json({
        funnel,
        stats: stageStats
      });
    }

    // Sinon, retourner tous les funnels avec leurs stats
    const funnels = await prisma.conversionFunnel.findMany({
      where: {
        organizationId: admin.organizationId ?? undefined
      },
      include: {
        _count: {
          select: { entries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const funnelsWithStats = await Promise.all(
      funnels.map(async (funnel) => {
        const stats = await calculateFunnelStats(funnel.id);
        return {
          ...funnel,
          stats
        };
      })
    );

    return NextResponse.json(funnelsWithStats);
  } catch (error) {
    log.error('Erreur lors de la récupération du funnel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau funnel
export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!admin.organizationId) {
    return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, stages } = body;

    const funnel = await prisma.conversionFunnel.create({
      data: {
        organizationId: admin.organizationId ?? undefined,
        name,
        description,
        stages
      }
    });

    return NextResponse.json(funnel);
  } catch (error) {
    log.error('Erreur lors de la création du funnel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un funnel ou ajouter une entrée
export async function PATCH(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'add_entry') {
      // Ajouter une nouvelle entrée dans le funnel
      const { funnelId, leadId, userId, source, utmSource, utmMedium, utmCampaign } = data;

      const entry = await prisma.funnelEntry.create({
        data: {
          funnelId,
          leadId,
          userId,
          currentStage: 'AWARENESS',
          stages: [
            {
              stage: 'AWARENESS',
              enteredAt: new Date().toISOString()
            }
          ],
          source,
          utmSource,
          utmMedium,
          utmCampaign
        }
      });

      return NextResponse.json(entry);
    } else if (action === 'update_stage') {
      // Faire progresser une entrée dans le funnel
      const { entryId, newStage } = data;

      const entry = await prisma.funnelEntry.findUnique({
        where: { id: entryId }
      });

      if (!entry) {
        return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 });
      }

      const stages = entry.stages as any[];
      const currentStageIndex = stages.length - 1;

      // Marquer l'étape actuelle comme sortie
      stages[currentStageIndex].exitedAt = new Date().toISOString();

      // Ajouter la nouvelle étape
      stages.push({
        stage: newStage,
        enteredAt: new Date().toISOString()
      });

      const updated = await prisma.funnelEntry.update({
        where: { id: entryId },
        data: {
          currentStage: newStage,
          stages
        }
      });

      return NextResponse.json(updated);
    } else if (action === 'mark_converted') {
      // Marquer une entrée comme convertie
      const { entryId, conversionValue } = data;

      const updated = await prisma.funnelEntry.update({
        where: { id: entryId },
        data: {
          isConverted: true,
          convertedAt: new Date(),
          conversionValue,
          currentStage: 'PURCHASE'
        }
      });

      return NextResponse.json(updated);
    } else {
      // Mettre à jour le funnel lui-même
      const { id, name, description, stages, isActive } = data;

      if (!admin.organizationId) {
        return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
      }

      // Vérifier que le funnel appartient à l'organisation
      const existingFunnel = await prisma.conversionFunnel.findFirst({
        where: {
          id,
          organizationId: admin.organizationId ?? undefined
        }
      });

      if (!existingFunnel) {
        return NextResponse.json({ error: 'Funnel non trouvé' }, { status: 404 });
      }

      const funnel = await prisma.conversionFunnel.update({
        where: { id },
        data: {
          name,
          description,
          stages,
          isActive
        }
      });

      return NextResponse.json(funnel);
    }
  } catch (error) {
    log.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un funnel
export async function DELETE(request: NextRequest) {
  const prisma = await getPrismaClient();
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!admin.organizationId) {
    return NextResponse.json({ error: 'Organization ID manquant' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Vérifier que le funnel appartient à l'organisation
    const funnel = await prisma.conversionFunnel.findFirst({
      where: {
        id,
        organizationId: admin.organizationId ?? undefined
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel non trouvé' }, { status: 404 });
    }

    await prisma.conversionFunnel.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Erreur lors de la suppression du funnel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

// Fonction helper pour calculer les statistiques du funnel
async function calculateFunnelStats(funnelId: string) {
  const prisma = await getPrismaClient();

  const entries = await prisma.funnelEntry.findMany({
    where: { funnelId }
  });

  const totalEntries = entries.length;
  const converted = entries.filter(e => e.isConverted).length;
  const conversionRate = totalEntries > 0 ? (converted / totalEntries) * 100 : 0;

  // Compter par étape
  const stages = ['AWARENESS', 'INTEREST', 'CONSIDERATION', 'INTENT', 'EVALUATION', 'PURCHASE'];
  const stageCounts: { [key: string]: number } = {};
  const stageConversions: { [key: string]: number } = {};

  stages.forEach(stage => {
    stageCounts[stage] = entries.filter(e => e.currentStage === stage).length;
  });

  // Calculer les taux de conversion entre chaque étape
  const stageRates: { [key: string]: number } = {};
  for (let i = 0; i < stages.length - 1; i++) {
    const current = stageCounts[stages[i]];
    const next = stageCounts[stages[i + 1]];
    stageRates[`${stages[i]}_to_${stages[i + 1]}`] = current > 0 ? (next / current) * 100 : 0;
  }

  // Calculer la valeur totale des conversions
  const totalValue = entries
    .filter(e => e.isConverted && e.conversionValue)
    .reduce((sum, e) => sum + Number(e.conversionValue || 0), 0);

  const averageValue = converted > 0 ? totalValue / converted : 0;

  return {
    totalEntries,
    converted,
    conversionRate: Math.round(conversionRate * 100) / 100,
    stageCounts,
    stageRates,
    totalValue,
    averageValue: Math.round(averageValue * 100) / 100
  };
}
