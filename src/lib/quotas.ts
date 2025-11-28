import { getPrismaClient } from '@/lib/prisma';
import { log } from '@/lib/logger';

// Types de quotas
export type QuotaType =
  | 'users'
  | 'locations'
  | 'storage'
  | 'emails'
  | 'sms'
  | 'whatsapp'
  | 'apiCalls';

// Limites par plan - LAIA Connect tarification officielle (Nov 2024)
export const PLAN_LIMITS: Record<string, Record<QuotaType, number>> = {
  // SOLO - 49€/mois - Esthéticienne indépendante
  SOLO: {
    users: 1,
    locations: 1,
    storage: 5 * 1024 * 1024 * 1024, // 5 GB
    emails: 1000,
    sms: 0,        // Pas de SMS en SOLO
    whatsapp: 200,
    apiCalls: 10000,
  },
  // DUO - 69€/mois - Petit institut 2-3 personnes
  DUO: {
    users: 3,
    locations: 1,
    storage: 15 * 1024 * 1024 * 1024, // 15 GB
    emails: 2000,
    sms: 0,        // Pas de SMS en DUO
    whatsapp: 500,
    apiCalls: 25000,
  },
  // TEAM - 119€/mois - Institut établi
  TEAM: {
    users: 8,
    locations: 3,
    storage: 30 * 1024 * 1024 * 1024, // 30 GB
    emails: 5000,
    sms: 200,      // SMS inclus à partir de TEAM
    whatsapp: 1000,
    apiCalls: 50000,
  },
  // PREMIUM - 179€/mois - Multi-sites / Scale
  PREMIUM: {
    users: -1,     // Illimité
    locations: -1, // Illimité
    storage: -1,   // Illimité
    emails: -1,    // Illimité
    sms: 1000,
    whatsapp: -1,  // Illimité
    apiCalls: -1,  // Illimité
  },
  // ENTERPRISE - Sur devis (alias PREMIUM)
  ENTERPRISE: {
    users: -1,
    locations: -1,
    storage: -1,   // Illimité
    emails: -1,
    sms: -1,
    whatsapp: -1,
    apiCalls: -1,
  },
};

/**
 * Récupère ou crée l'enregistrement d'usage pour une organisation
 */
export async function getOrCreateUsage(organizationId: string) {
  const prisma = await getPrismaClient();

  let usage = await prisma.organizationUsage.findUnique({
    where: { organizationId },
  });

  if (!usage) {
    // Créer l'enregistrement d'usage
    usage = await prisma.organizationUsage.create({
      data: { organizationId },
    });
  }

  return usage;
}

/**
 * Récupère les limites d'une organisation selon son plan
 */
export async function getOrganizationLimits(organizationId: string) {
  const prisma = await getPrismaClient();

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      plan: true,
      maxUsers: true,
      maxLocations: true,
      maxStorage: true,
    },
  });

  if (!org) {
    throw new Error('Organisation non trouvée');
  }

  const planLimits = PLAN_LIMITS[org.plan] || PLAN_LIMITS.SOLO;

  // Les limites custom de l'org remplacent les limites du plan si définies
  return {
    users: org.maxUsers || planLimits.users,
    locations: org.maxLocations || planLimits.locations,
    storage: (org.maxStorage || 5) * 1024 * 1024 * 1024, // Convertir GB en bytes
    emails: planLimits.emails,
    sms: planLimits.sms,
    whatsapp: planLimits.whatsapp,
    apiCalls: planLimits.apiCalls,
  };
}

/**
 * Vérifie si un quota est dépassé
 * @returns { allowed: boolean, current: number, limit: number, message?: string }
 */
export async function checkQuota(
  organizationId: string,
  quotaType: QuotaType,
  increment: number = 1
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  message?: string;
}> {
  const usage = await getOrCreateUsage(organizationId);
  const limits = await getOrganizationLimits(organizationId);

  let current: number;
  let limit: number;

  switch (quotaType) {
    case 'users':
      current = usage.currentUsers;
      limit = limits.users;
      break;
    case 'locations':
      current = usage.currentLocations;
      limit = limits.locations;
      break;
    case 'storage':
      current = Number(usage.currentStorageBytes);
      limit = limits.storage;
      break;
    case 'emails':
      current = usage.emailsSentThisMonth;
      limit = limits.emails;
      break;
    case 'sms':
      current = usage.smsSentThisMonth;
      limit = limits.sms;
      break;
    case 'whatsapp':
      current = usage.whatsappSentThisMonth;
      limit = limits.whatsapp;
      break;
    case 'apiCalls':
      current = usage.apiCallsThisMonth;
      limit = limits.apiCalls;
      break;
    default:
      throw new Error(`Type de quota inconnu: ${quotaType}`);
  }

  // -1 = illimité
  if (limit === -1) {
    return {
      allowed: true,
      current,
      limit: -1,
      remaining: -1,
    };
  }

  const allowed = current + increment <= limit;
  const remaining = Math.max(0, limit - current);

  return {
    allowed,
    current,
    limit,
    remaining,
    message: allowed
      ? undefined
      : `Quota ${quotaType} dépassé. Limite: ${limit}, Actuel: ${current}`,
  };
}

/**
 * Incrémente un compteur d'usage
 */
export async function incrementUsage(
  organizationId: string,
  quotaType: QuotaType,
  amount: number = 1
): Promise<void> {
  const prisma = await getPrismaClient();

  const updateData: Record<string, { increment: number }> = {};

  switch (quotaType) {
    case 'users':
      updateData.currentUsers = { increment: amount };
      break;
    case 'locations':
      updateData.currentLocations = { increment: amount };
      break;
    case 'storage':
      updateData.currentStorageBytes = { increment: amount };
      break;
    case 'emails':
      updateData.emailsSentThisMonth = { increment: amount };
      updateData.totalEmailsSent = { increment: amount };
      break;
    case 'sms':
      updateData.smsSentThisMonth = { increment: amount };
      updateData.totalSmsSent = { increment: amount };
      break;
    case 'whatsapp':
      updateData.whatsappSentThisMonth = { increment: amount };
      updateData.totalWhatsappSent = { increment: amount };
      break;
    case 'apiCalls':
      updateData.apiCallsThisMonth = { increment: amount };
      updateData.totalApiCalls = { increment: amount };
      break;
  }

  await prisma.organizationUsage.upsert({
    where: { organizationId },
    create: {
      organizationId,
      ...Object.fromEntries(
        Object.entries(updateData).map(([k, v]) => [k, v.increment])
      ),
    },
    update: updateData,
  });
}

/**
 * Décrémente un compteur d'usage (pour les suppressions)
 */
export async function decrementUsage(
  organizationId: string,
  quotaType: 'users' | 'locations' | 'storage',
  amount: number = 1
): Promise<void> {
  const prisma = await getPrismaClient();

  const updateData: Record<string, { decrement: number }> = {};

  switch (quotaType) {
    case 'users':
      updateData.currentUsers = { decrement: amount };
      break;
    case 'locations':
      updateData.currentLocations = { decrement: amount };
      break;
    case 'storage':
      updateData.currentStorageBytes = { decrement: amount };
      break;
  }

  await prisma.organizationUsage.update({
    where: { organizationId },
    data: updateData,
  });
}

/**
 * Récupère le dashboard d'usage complet d'une organisation
 */
export async function getUsageDashboard(organizationId: string) {
  const prisma = await getPrismaClient();

  const [usage, limits, org] = await Promise.all([
    getOrCreateUsage(organizationId),
    getOrganizationLimits(organizationId),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true, status: true, trialEndsAt: true },
    }),
  ]);

  // Calculer les pourcentages
  const calculatePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Illimité
    return Math.min(100, Math.round((current / limit) * 100));
  };

  return {
    organization: {
      plan: org?.plan || 'SOLO',
      status: org?.status || 'TRIAL',
      trialEndsAt: org?.trialEndsAt,
    },
    quotas: {
      users: {
        current: usage.currentUsers,
        limit: limits.users,
        remaining: limits.users === -1 ? -1 : Math.max(0, limits.users - usage.currentUsers),
        percentage: calculatePercentage(usage.currentUsers, limits.users),
        unlimited: limits.users === -1,
      },
      locations: {
        current: usage.currentLocations,
        limit: limits.locations,
        remaining: limits.locations === -1 ? -1 : Math.max(0, limits.locations - usage.currentLocations),
        percentage: calculatePercentage(usage.currentLocations, limits.locations),
        unlimited: limits.locations === -1,
      },
      storage: {
        current: Number(usage.currentStorageBytes),
        currentFormatted: formatBytes(Number(usage.currentStorageBytes)),
        limit: limits.storage,
        limitFormatted: limits.storage === -1 ? 'Illimité' : formatBytes(limits.storage),
        remaining: limits.storage === -1 ? -1 : Math.max(0, limits.storage - Number(usage.currentStorageBytes)),
        percentage: calculatePercentage(Number(usage.currentStorageBytes), limits.storage),
        unlimited: limits.storage === -1,
      },
      emails: {
        current: usage.emailsSentThisMonth,
        limit: limits.emails,
        remaining: limits.emails === -1 ? -1 : Math.max(0, limits.emails - usage.emailsSentThisMonth),
        percentage: calculatePercentage(usage.emailsSentThisMonth, limits.emails),
        unlimited: limits.emails === -1,
      },
      sms: {
        current: usage.smsSentThisMonth,
        limit: limits.sms,
        remaining: limits.sms === -1 ? -1 : Math.max(0, limits.sms - usage.smsSentThisMonth),
        percentage: calculatePercentage(usage.smsSentThisMonth, limits.sms),
        unlimited: limits.sms === -1,
      },
      whatsapp: {
        current: usage.whatsappSentThisMonth,
        limit: limits.whatsapp,
        remaining: limits.whatsapp === -1 ? -1 : Math.max(0, limits.whatsapp - usage.whatsappSentThisMonth),
        percentage: calculatePercentage(usage.whatsappSentThisMonth, limits.whatsapp),
        unlimited: limits.whatsapp === -1,
      },
    },
    totals: {
      emailsSent: usage.totalEmailsSent,
      smsSent: usage.totalSmsSent,
      whatsappSent: usage.totalWhatsappSent,
      apiCalls: usage.totalApiCalls,
      reservations: usage.totalReservations,
      revenue: usage.totalRevenue,
    },
    lastResetDate: usage.lastResetDate,
    lastUpdatedAt: usage.lastUpdatedAt,
  };
}

/**
 * Réinitialise les compteurs mensuels (à appeler via cron)
 */
export async function resetMonthlyCounters(): Promise<number> {
  const prisma = await getPrismaClient();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Trouver tous les usages qui n'ont pas été réinitialisés ce mois
  const usagesToReset = await prisma.organizationUsage.findMany({
    where: {
      OR: [
        { lastResetDate: { lt: new Date(currentYear, currentMonth, 1) } },
        { lastResetDate: null },
      ],
    },
    include: {
      organization: {
        select: { id: true },
      },
    },
  });

  let resetCount = 0;

  for (const usage of usagesToReset) {
    try {
      // Sauvegarder l'historique avant reset
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      await prisma.organizationUsageHistory.upsert({
        where: {
          organizationId_year_month: {
            organizationId: usage.organizationId,
            year: lastYear,
            month: lastMonth + 1, // 1-12
          },
        },
        create: {
          organizationId: usage.organizationId,
          year: lastYear,
          month: lastMonth + 1,
          usersCount: usage.currentUsers,
          locationsCount: usage.currentLocations,
          storageBytes: usage.currentStorageBytes,
          emailsSent: usage.emailsSentThisMonth,
          smsSent: usage.smsSentThisMonth,
          whatsappSent: usage.whatsappSentThisMonth,
          apiCalls: usage.apiCallsThisMonth,
        },
        update: {
          usersCount: usage.currentUsers,
          locationsCount: usage.currentLocations,
          storageBytes: usage.currentStorageBytes,
          emailsSent: usage.emailsSentThisMonth,
          smsSent: usage.smsSentThisMonth,
          whatsappSent: usage.whatsappSentThisMonth,
          apiCalls: usage.apiCallsThisMonth,
        },
      });

      // Reset les compteurs mensuels
      await prisma.organizationUsage.update({
        where: { id: usage.id },
        data: {
          emailsSentThisMonth: 0,
          smsSentThisMonth: 0,
          whatsappSentThisMonth: 0,
          apiCallsThisMonth: 0,
          lastResetDate: now,
        },
      });

      resetCount++;
    } catch (error) {
      log.error(`Erreur reset usage org ${usage.organizationId}:`, error);
    }
  }

  log.info(`Reset mensuel: ${resetCount} organisations réinitialisées`);
  return resetCount;
}

/**
 * Middleware helper pour vérifier le quota avant une action
 */
export async function withQuotaCheck<T>(
  organizationId: string,
  quotaType: QuotaType,
  action: () => Promise<T>,
  increment: number = 1
): Promise<T> {
  const check = await checkQuota(organizationId, quotaType, increment);

  if (!check.allowed) {
    throw new QuotaExceededError(quotaType, check.current, check.limit);
  }

  const result = await action();

  // Incrémenter après succès
  await incrementUsage(organizationId, quotaType, increment);

  return result;
}

// Erreur personnalisée pour quota dépassé
export class QuotaExceededError extends Error {
  constructor(
    public quotaType: QuotaType,
    public current: number,
    public limit: number
  ) {
    super(`Quota ${quotaType} dépassé. Limite: ${limit}, Actuel: ${current}`);
    this.name = 'QuotaExceededError';
  }
}

// Helper pour formater les bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
