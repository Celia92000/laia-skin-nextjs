/**
 * Gestionnaire sécurisé des tokens API
 * Chiffre/déchiffre et stocke les tokens de manière sécurisée
 */

import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from './encryption-service';

const prisma = new PrismaClient();

export interface ApiToken {
  id?: string;
  service: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'STRIPE' | 'RESEND' | 'OTHER';
  name: string;
  tokenEncrypted: string;
  expiresAt?: Date | null;
  organizationId?: string | null;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Stocke un token API de manière chiffrée
 */
export async function storeApiToken(params: {
  service: ApiToken['service'];
  name: string;
  token: string;
  expiresAt?: Date;
  organizationId?: string;
  metadata?: any;
}): Promise<ApiToken> {
  // Chiffrer le token
  const tokenEncrypted = encrypt(params.token);

  // Vérifier si un token existe déjà pour ce service/nom/org
  const existing = await prisma.apiToken.findFirst({
    where: {
      service: params.service,
      name: params.name,
      organizationId: params.organizationId || null,
    },
  });

  if (existing) {
    // Mettre à jour
    const updated = await prisma.apiToken.update({
      where: { id: existing.id },
      data: {
        tokenEncrypted,
        expiresAt: params.expiresAt,
        metadata: params.metadata,
      },
    });

    console.log(`✅ Token ${params.service}:${params.name} mis à jour`);
    return updated;
  } else {
    // Créer
    const created = await prisma.apiToken.create({
      data: {
        service: params.service,
        name: params.name,
        tokenEncrypted,
        expiresAt: params.expiresAt,
        organizationId: params.organizationId,
        metadata: params.metadata,
      },
    });

    console.log(`✅ Token ${params.service}:${params.name} créé`);
    return created;
  }
}

/**
 * Récupère un token API déchiffré
 */
export async function getApiToken(params: {
  service: ApiToken['service'];
  name: string;
  organizationId?: string;
}): Promise<string | null> {
  const token = await prisma.apiToken.findFirst({
    where: {
      service: params.service,
      name: params.name,
      organizationId: params.organizationId || null,
    },
  });

  if (!token) {
    console.warn(`⚠️  Token ${params.service}:${params.name} introuvable`);
    return null;
  }

  // Vérifier l'expiration
  if (token.expiresAt && token.expiresAt < new Date()) {
    console.warn(`⚠️  Token ${params.service}:${params.name} EXPIRÉ`);
    return null;
  }

  // Déchiffrer et retourner
  try {
    return decrypt(token.tokenEncrypted);
  } catch (error) {
    console.error(`❌ Erreur déchiffrement token ${params.service}:${params.name}:`, error);
    return null;
  }
}

/**
 * Liste tous les tokens (sans les déchiffrer)
 */
export async function listApiTokens(organizationId?: string): Promise<ApiToken[]> {
  return await prisma.apiToken.findMany({
    where: organizationId ? { organizationId } : {},
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Supprime un token
 */
export async function deleteApiToken(tokenId: string): Promise<boolean> {
  try {
    await prisma.apiToken.delete({
      where: { id: tokenId },
    });
    console.log(`✅ Token ${tokenId} supprimé`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur suppression token ${tokenId}:`, error);
    return false;
  }
}

/**
 * Vérifie les tokens qui vont expirer bientôt
 */
export async function checkExpiringTokens(daysBeforeExpiration: number = 7): Promise<ApiToken[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysBeforeExpiration);

  const expiringTokens = await prisma.apiToken.findMany({
    where: {
      expiresAt: {
        gte: new Date(),
        lte: futureDate,
      },
    },
    orderBy: { expiresAt: 'asc' },
  });

  if (expiringTokens.length > 0) {
    console.warn(`⚠️  ${expiringTokens.length} token(s) expirent dans les ${daysBeforeExpiration} prochains jours`);
    expiringTokens.forEach(token => {
      const daysLeft = Math.ceil(
        (token.expiresAt!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      console.warn(`   - ${token.service}:${token.name} expire dans ${daysLeft} jours`);
    });
  }

  return expiringTokens;
}

/**
 * Migre les tokens depuis .env vers la base de données
 */
export async function migrateTokensFromEnv(): Promise<void> {
  console.log('🔄 Migration des tokens depuis .env...\n');

  const migrations = [
    {
      service: 'WHATSAPP' as const,
      name: 'access_token',
      token: process.env.WHATSAPP_ACCESS_TOKEN,
      expiresAt: new Date('2025-12-15'), // À calculer selon vos tokens
    },
    {
      service: 'INSTAGRAM' as const,
      name: 'access_token',
      token: process.env.INSTAGRAM_ACCESS_TOKEN,
      expiresAt: new Date('2025-12-16'),
    },
    {
      service: 'FACEBOOK' as const,
      name: 'page_access_token',
      token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      expiresAt: new Date('2025-12-11'),
    },
    {
      service: 'STRIPE' as const,
      name: 'secret_key',
      token: process.env.STRIPE_SECRET_KEY,
      expiresAt: undefined, // Pas d'expiration
    },
    {
      service: 'RESEND' as const,
      name: 'api_key',
      token: process.env.RESEND_API_KEY,
      expiresAt: undefined,
    },
  ];

  for (const migration of migrations) {
    if (migration.token) {
      try {
        await storeApiToken(migration);
        console.log(`   ✅ ${migration.service}:${migration.name}`);
      } catch (error) {
        console.error(`   ❌ ${migration.service}:${migration.name}:`, error);
      }
    } else {
      console.log(`   ⚠️  ${migration.service}:${migration.name} manquant dans .env`);
    }
  }

  console.log('\n✅ Migration terminée\n');
}

/**
 * Helper pour obtenir le token WhatsApp
 */
export async function getWhatsAppToken(organizationId?: string): Promise<string | null> {
  // D'abord chercher en base
  const dbToken = await getApiToken({
    service: 'WHATSAPP',
    name: 'access_token',
    organizationId,
  });

  // Fallback sur .env si pas en base
  return dbToken || process.env.WHATSAPP_ACCESS_TOKEN || null;
}

/**
 * Helper pour obtenir le token Instagram
 */
export async function getInstagramToken(organizationId?: string): Promise<string | null> {
  const dbToken = await getApiToken({
    service: 'INSTAGRAM',
    name: 'access_token',
    organizationId,
  });

  return dbToken || process.env.INSTAGRAM_ACCESS_TOKEN || null;
}

/**
 * Helper pour obtenir le token Facebook
 */
export async function getFacebookToken(organizationId?: string): Promise<string | null> {
  const dbToken = await getApiToken({
    service: 'FACEBOOK',
    name: 'page_access_token',
    organizationId,
  });

  return dbToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
}

/**
 * Helper pour obtenir la clé Stripe
 */
export async function getStripeKey(organizationId?: string): Promise<string | null> {
  const dbToken = await getApiToken({
    service: 'STRIPE',
    name: 'secret_key',
    organizationId,
  });

  return dbToken || process.env.STRIPE_SECRET_KEY || null;
}
