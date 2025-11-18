import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

// GET - Obtenir les stats du funnel LAIA Connect
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30d';

    // Calculer la date de début selon la période
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Depuis le début
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Trouver ou créer le funnel LAIA Connect
    let funnel = await prisma.conversionFunnel.findFirst({
      where: {
        name: 'LAIA Connect SaaS',
        organizationId: null // Funnel global, pas lié à une organisation
      }
    });

    if (!funnel) {
      // Créer le funnel LAIA Connect s'il n'existe pas
      funnel = await prisma.conversionFunnel.create({
        data: {
          name: 'LAIA Connect SaaS',
          description: 'Parcours de conversion du visiteur au client payant sur LAIA Connect',
          organizationId: null,
          stages: {
            stages: [
              { name: 'Visite site', stage: 'AWARENESS', description: 'Visite du site laia-connect.fr' },
              { name: 'Intérêt manifesté', stage: 'INTEREST', description: 'Inscription newsletter ou téléchargement documentation' },
              { name: 'Demande démo', stage: 'CONSIDERATION', description: 'Demande de démonstration' },
              { name: 'Essai gratuit', stage: 'INTENT', description: 'Inscription à l\'essai gratuit de 30 jours' },
              { name: 'Utilisation active', stage: 'EVALUATION', description: 'Utilisation de la plateforme pendant l\'essai' },
              { name: 'Client payant', stage: 'PURCHASE', description: 'Souscription à un plan payant' }
            ]
          },
          isActive: true
        }
      });
    }

    // Récupérer toutes les entrées du funnel pour la période
    const entries = await prisma.funnelEntry.findMany({
      where: {
        funnelId: funnel.id,
        createdAt: {
          gte: period === 'all' ? undefined : startDate
        }
      },
      include: {
        lead: {
          include: {
            organization: true
          }
        }
      }
    });

    // Calculer les statistiques
    const totalEntries = entries.length;
    const converted = entries.filter(e => e.isConverted).length;
    const conversionRate = totalEntries > 0 ? (converted / totalEntries) * 100 : 0;

    // Compter les prospects à chaque étape
    const stageCounts: { [key: string]: number } = {
      AWARENESS: 0,
      INTEREST: 0,
      CONSIDERATION: 0,
      INTENT: 0,
      EVALUATION: 0,
      PURCHASE: 0
    };

    entries.forEach(entry => {
      stageCounts[entry.currentStage] = (stageCounts[entry.currentStage] || 0) + 1;

      // Si converti, il est passé par toutes les étapes
      if (entry.isConverted) {
        stageCounts.PURCHASE++;
      }
    });

    // Calculer les taux de transition entre étapes
    const stageRates: { [key: string]: number } = {};
    const stages = ['AWARENESS', 'INTEREST', 'CONSIDERATION', 'INTENT', 'EVALUATION', 'PURCHASE'];

    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];
      const currentCount = stageCounts[currentStage] || 0;
      const nextCount = stageCounts[nextStage] || 0;

      if (currentCount > 0) {
        stageRates[`${currentStage}_to_${nextStage}`] = (nextCount / currentCount) * 100;
      }
    }

    // Calculer la valeur totale et moyenne (basée sur les revenus mensuels)
    const convertedEntries = entries.filter(e => e.isConverted);
    const totalValue = convertedEntries.reduce((sum, e) => {
      return sum + Number(e.conversionValue || 0);
    }, 0);
    const averageValue = converted > 0 ? totalValue / converted : 0;

    // Calculer le temps moyen de conversion (en jours)
    const conversionTimes = convertedEntries
      .filter(e => e.convertedAt)
      .map(e => {
        const created = new Date(e.createdAt);
        const converted = new Date(e.convertedAt!);
        return (converted.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // en jours
      });

    const averageTimeToConvert = conversionTimes.length > 0
      ? conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length
      : 0;

    // Construire la réponse
    const response = {
      id: funnel.id,
      name: funnel.name,
      description: funnel.description,
      stages: funnel.stages,
      isActive: funnel.isActive,
      createdAt: funnel.createdAt,
      _count: {
        entries: totalEntries
      },
      stats: {
        totalEntries,
        converted,
        conversionRate: Number(conversionRate.toFixed(2)),
        stageCounts,
        stageRates: Object.fromEntries(
          Object.entries(stageRates).map(([key, value]) => [key, Number(value.toFixed(2))])
        ),
        totalValue: Number(totalValue.toFixed(2)),
        averageValue: Number(averageValue.toFixed(2)),
        averageTimeToConvert: Number(averageTimeToConvert.toFixed(1))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    log.error('Erreur lors de la récupération des stats funnel:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour une entrée dans le funnel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, stage, source, utmSource, utmMedium, utmCampaign, conversionValue } = body;

    // Trouver le funnel LAIA Connect
    const funnel = await prisma.conversionFunnel.findFirst({
      where: {
        name: 'LAIA Connect SaaS',
        organizationId: null
      }
    });

    if (!funnel) {
      return NextResponse.json(
        { error: 'Funnel LAIA Connect non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si une entrée existe déjà pour ce lead
    const existingEntry = leadId ? await prisma.funnelEntry.findFirst({
      where: {
        funnelId: funnel.id,
        leadId
      }
    }) : null;

    if (existingEntry) {
      // Mettre à jour l'entrée existante
      const stages = ['AWARENESS', 'INTEREST', 'CONSIDERATION', 'INTENT', 'EVALUATION', 'PURCHASE'];
      const currentStageIndex = stages.indexOf(existingEntry.currentStage);
      const newStageIndex = stages.indexOf(stage);

      // Ne mettre à jour que si on avance dans le funnel
      if (newStageIndex > currentStageIndex) {
        const isConverted = stage === 'PURCHASE';

        const updated = await prisma.funnelEntry.update({
          where: { id: existingEntry.id },
          data: {
            currentStage: stage,
            isConverted,
            convertedAt: isConverted ? new Date() : existingEntry.convertedAt,
            conversionValue: conversionValue || existingEntry.conversionValue,
            stages: {
              ...existingEntry.stages,
              [stage]: new Date()
            }
          }
        });

        return NextResponse.json(updated);
      }

      return NextResponse.json(existingEntry);
    }

    // Créer une nouvelle entrée
    const entry = await prisma.funnelEntry.create({
      data: {
        funnelId: funnel.id,
        leadId: leadId || null,
        currentStage: stage,
        stages: {
          [stage]: new Date()
        },
        isConverted: stage === 'PURCHASE',
        convertedAt: stage === 'PURCHASE' ? new Date() : null,
        conversionValue: conversionValue || null,
        source,
        utmSource,
        utmMedium,
        utmCampaign
      }
    });

    return NextResponse.json(entry);

  } catch (error) {
    log.error('Erreur lors de la création de l\'entrée funnel:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
