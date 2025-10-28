import { encrypt, decrypt } from './encryption-service';
import prisma from './prisma';

export interface ApiToken {
  id: string;
  service: string;
  name: string;
  encryptedToken: string;
  expiresAt: Date | null;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreApiTokenParams {
  organizationId?: string | null;  // Support multi-tenant
  service: string;
  name: string;
  token: string;
  expiresAt?: Date;
  metadata?: any;
}

/**
 * Liste tous les tokens API d'une organisation (sans les déchiffrer)
 */
export async function listApiTokens(organizationId?: string | null): Promise<ApiToken[]> {
  try {
    console.log('📡 [listApiTokens] Récupération des tokens...');
    if (organizationId) {
      console.log(`🏢 [listApiTokens] Organization ID: ${organizationId}`);
    }

    // Récupérer uniquement les tokens de l'organisation (multi-tenant strict)
    const tokens = await prisma.apiToken.findMany({
      where: {
        organizationId: organizationId || null
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 [listApiTokens] ${tokens.length} token(s) trouvé(s) pour l'organisation`);

    return tokens;
  } catch (error) {
    console.error('❌ [listApiTokens] Erreur lors de la récupération des tokens:', error);
    throw error;
  }
}

/**
 * Stocke un nouveau token API (chiffré)
 */
export async function storeApiToken(params: StoreApiTokenParams): Promise<ApiToken> {
  const { organizationId, service, name, token, expiresAt, metadata } = params;

  try {
    // Chiffrer le token avant de le stocker
    const encryptedToken = encrypt(token);

    // Vérifier si un token existe déjà pour cette organisation/service/nom
    const existing = await prisma.apiToken.findFirst({
      where: {
        organizationId: organizationId || null,
        service,
        name,
      },
    });

    let savedToken;

    if (existing) {
      // Mettre à jour le token existant
      savedToken = await prisma.apiToken.update({
        where: { id: existing.id },
        data: {
          encryptedToken,
          expiresAt,
          metadata,
        },
      });
      console.log(`✅ Token ${organizationId ? `[${organizationId}]` : '[global]'} ${service}/${name} mis à jour`);
    } else {
      // Créer un nouveau token
      savedToken = await prisma.apiToken.create({
        data: {
          organizationId: organizationId || null,
          service,
          name,
          encryptedToken,
          expiresAt,
          metadata,
        },
      });
      console.log(`✅ Token ${organizationId ? `[${organizationId}]` : '[global]'} ${service}/${name} créé`);
    }

    return savedToken;
  } catch (error) {
    console.error(`❌ Erreur lors du stockage du token ${service}/${name}:`, error);
    throw error;
  }
}

/**
 * Récupère un token API spécifique (déchiffré)
 * @param service - Le service (INSTAGRAM, FACEBOOK, etc.)
 * @param name - Le nom du token (access_token, page_id, etc.)
 * @param organizationId - L'ID de l'organisation (optionnel, null = global)
 */
export async function getApiToken(
  service: string,
  name: string,
  organizationId?: string | null
): Promise<string | null> {
  try {
    const token = await prisma.apiToken.findFirst({
      where: {
        organizationId: organizationId || null,
        service,
        name,
      },
    });

    if (!token) {
      console.log(`⚠️  Token ${service}/${name} non trouvé pour l'organisation`);
      return null;
    }

    // Déchiffrer le token
    const decrypted = decrypt(token.encryptedToken);
    if (!decrypted) {
      console.log(`⚠️  Token ${service}/${name} ne peut pas être déchiffré (clé invalide ou corrompu)`);
      return null;
    }
    return decrypted;
  } catch (error) {
    console.error(`Erreur lors de la récupération du token ${service}/${name}:`, error);
    return null;
  }
}

/**
 * Récupère un token API avec ses metadata complètes
 * @param service - Le service (INSTAGRAM, FACEBOOK, etc.)
 * @param name - Le nom du token (access_token, page_access_token, etc.)
 * @param organizationId - L'ID de l'organisation (optionnel, null = global)
 * @returns {token: string, metadata: any} ou null
 */
export async function getApiTokenWithMetadata(
  service: string,
  name: string,
  organizationId?: string | null
): Promise<{ token: string; metadata: any } | null> {
  try {
    const tokenRecord = await prisma.apiToken.findFirst({
      where: {
        organizationId: organizationId || null,
        service,
        name,
      },
    });

    if (!tokenRecord) {
      console.log(`⚠️  Token ${service}/${name} non trouvé pour l'organisation`);
      return null;
    }

    // Déchiffrer le token et retourner avec metadata
    return {
      token: decrypt(tokenRecord.encryptedToken),
      metadata: tokenRecord.metadata || {}
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du token ${service}/${name}:`, error);
    throw error;
  }
}

/**
 * Vérifie les tokens qui vont expirer dans les N prochains jours
 */
export async function checkExpiringTokens(days: number = 7): Promise<ApiToken[]> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const expiringTokens = await prisma.apiToken.findMany({
      where: {
        AND: [
          { expiresAt: { not: null } },
          { expiresAt: { lte: cutoffDate } },
          { expiresAt: { gte: new Date() } }, // Pas déjà expiré
        ],
      },
      orderBy: {
        expiresAt: 'asc',
      },
    });

    if (expiringTokens.length > 0) {
      console.log(`⚠️  ${expiringTokens.length} token(s) expirent dans les ${days} prochains jours:`);
      expiringTokens.forEach(token => {
        const daysLeft = token.expiresAt
          ? Math.ceil((token.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : null;
        console.log(`   - ${token.service}/${token.name}: ${daysLeft} jour(s) restant(s)`);
      });
    }

    return expiringTokens;
  } catch (error) {
    console.error('Erreur lors de la vérification des tokens expirants:', error);
    throw error;
  }
}

/**
 * Migre les tokens depuis les variables d'environnement vers la base de données
 */
export async function migrateTokensFromEnv(): Promise<void> {
  console.log('🔄 Migration des tokens depuis .env...\n');

  const tokens = [
    {
      service: 'WHATSAPP',
      name: 'access_token',
      envVar: 'WHATSAPP_ACCESS_TOKEN',
      expiresInDays: 60,
    },
    {
      service: 'INSTAGRAM',
      name: 'access_token',
      envVar: 'INSTAGRAM_ACCESS_TOKEN',
      expiresInDays: 60,
    },
    {
      service: 'FACEBOOK',
      name: 'page_access_token',
      envVar: 'FACEBOOK_PAGE_ACCESS_TOKEN',
      expiresInDays: 60,
    },
    {
      service: 'STRIPE',
      name: 'secret_key',
      envVar: 'STRIPE_SECRET_KEY',
      expiresInDays: null, // Pas d'expiration
    },
    {
      service: 'STRIPE',
      name: 'publishable_key',
      envVar: 'STRIPE_PUBLISHABLE_KEY',
      expiresInDays: null,
    },
    {
      service: 'STRIPE',
      name: 'webhook_secret',
      envVar: 'STRIPE_WEBHOOK_SECRET',
      expiresInDays: null,
    },
    {
      service: 'RESEND',
      name: 'api_key',
      envVar: 'RESEND_API_KEY',
      expiresInDays: null,
    },
  ];

  let migrated = 0;
  let skipped = 0;

  for (const tokenConfig of tokens) {
    const tokenValue = process.env[tokenConfig.envVar];

    if (!tokenValue) {
      console.log(`⏭️  ${tokenConfig.service}/${tokenConfig.name}: variable ${tokenConfig.envVar} non trouvée`);
      skipped++;
      continue;
    }

    try {
      const expiresAt = tokenConfig.expiresInDays
        ? new Date(Date.now() + tokenConfig.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      await storeApiToken({
        service: tokenConfig.service,
        name: tokenConfig.name,
        token: tokenValue,
        expiresAt: expiresAt || undefined,
        metadata: {
          migratedFrom: 'env',
          migratedAt: new Date().toISOString(),
        },
      });

      migrated++;
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de ${tokenConfig.service}/${tokenConfig.name}:`, error);
    }
  }

  console.log(`\n📊 RÉSUMÉ DE LA MIGRATION:`);
  console.log(`   ✅ ${migrated} token(s) migré(s)`);
  console.log(`   ⏭️  ${skipped} token(s) ignoré(s) (variable .env non trouvée)`);
}

/**
 * Supprime un token API
 */
export async function deleteApiToken(id: string): Promise<void> {
  try {
    await prisma.apiToken.delete({
      where: { id },
    });
    console.log(`✅ Token supprimé: ${id}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du token ${id}:`, error);
    throw error;
  }
}
