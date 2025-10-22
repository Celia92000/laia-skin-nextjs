import { getPrismaClient } from '@/lib/prisma';
import { decryptConfig } from '@/lib/encryption';
import Stripe from 'stripe';

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
}

let cachedConfig: StripeConfig | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère la configuration Stripe depuis la base de données
 * avec mise en cache pour éviter trop de requêtes
 */
export async function getStripeConfig(): Promise<StripeConfig> {
  // Vérifier le cache
  const now = Date.now();
  if (cachedConfig && (now - cacheTime) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const prisma = await getPrismaClient();

    // 1. Chercher dans la table integration (méthode principale)
    const integration = await prisma.integration.findFirst({
      where: {
        type: 'stripe',
        enabled: true
      }
    });

    if (integration && integration.config) {
      try {
        // Essayer de déchiffrer la configuration
        const decryptedConfig = decryptConfig(integration.config as any);

        // Valider que les clés sont présentes
        if (!decryptedConfig.publishableKey || !decryptedConfig.secretKey) {
          throw new Error('Configuration Stripe incomplète');
        }

        const config: StripeConfig = {
          publishableKey: decryptedConfig.publishableKey,
          secretKey: decryptedConfig.secretKey,
          webhookSecret: decryptedConfig.webhookSecret
        };

        // Mettre en cache
        cachedConfig = config;
        cacheTime = now;

        return config;
      } catch (decryptError) {
        console.error('Erreur déchiffrement config Stripe:', decryptError);

        // Si le déchiffrement échoue, essayer de lire directement (la config peut être en JSON non chiffré)
        try {
          const directConfig = typeof integration.config === 'string'
            ? JSON.parse(integration.config)
            : integration.config;

          if (directConfig.publishableKey && directConfig.secretKey) {
            const config: StripeConfig = {
              publishableKey: directConfig.publishableKey,
              secretKey: directConfig.secretKey,
              webhookSecret: directConfig.webhookSecret
            };

            // Mettre en cache
            cachedConfig = config;
            cacheTime = now;

            return config;
          }
        } catch (jsonError) {
          console.error('Erreur lecture JSON config Stripe:', jsonError);
        }
      }
    }

    // 2. Fallback: chercher dans la table setting (ancienne méthode)
    const setting = await prisma.setting.findUnique({
      where: { key: 'stripe_config' }
    });

    if (setting) {
      const config = JSON.parse(setting.value) as StripeConfig;

      // Valider que les clés sont présentes
      if (!config.publishableKey || !config.secretKey) {
        throw new Error('Configuration Stripe incomplète');
      }

      // Mettre en cache
      cachedConfig = config;
      cacheTime = now;

      return config;
    }

    // 3. Fallback sur les variables d'environnement si pas configuré en BDD
    if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY) {
      const envConfig: StripeConfig = {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
      };

      cachedConfig = envConfig;
      cacheTime = now;

      return envConfig;
    }

    throw new Error('Configuration Stripe non trouvée. Veuillez configurer Stripe dans les paramètres.');
  } catch (error) {
    console.error('Erreur récupération config Stripe:', error);
    throw error;
  }
}

/**
 * Invalide le cache de configuration
 * À appeler après une mise à jour de la configuration
 */
export function invalidateStripeConfigCache() {
  cachedConfig = null;
  cacheTime = 0;
}

/**
 * Crée et retourne une instance Stripe avec la configuration actuelle
 */
export async function getStripeInstance(): Promise<Stripe> {
  const config = await getStripeConfig();
  return new Stripe(config.secretKey, {
    apiVersion: '2024-12-18.acacia',
  });
}

/**
 * Récupère uniquement la clé publique (pour le client)
 */
export async function getStripePublishableKey(): Promise<string> {
  const config = await getStripeConfig();
  return config.publishableKey;
}

/**
 * Récupère le secret webhook
 */
export async function getStripeWebhookSecret(): Promise<string | undefined> {
  const config = await getStripeConfig();
  return config.webhookSecret;
}
