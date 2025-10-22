import { getPrismaClient } from './prisma';
import { SiteConfig } from '@prisma/client';

// Cache en mémoire pour éviter les requêtes répétées
let configCache: SiteConfig | null = null;
let cacheTimestamp: number = 0;
let pendingRequest: Promise<SiteConfig> | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère la configuration du site depuis la BDD
 * Utilise un cache pour optimiser les performances
 * Promise memoization pour éviter les requêtes simultanées
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  const now = Date.now();

  // Retourner le cache si valide
  if (configCache && (now - cacheTimestamp) < CACHE_TTL) {
    return configCache;
  }

  // Si une requête est déjà en cours, attendre son résultat
  if (pendingRequest) {
    return pendingRequest;
  }

  // Créer une nouvelle requête
  pendingRequest = (async () => {
    try {
      const prisma = await getPrismaClient();

      // Récupérer la config (il devrait n'y en avoir qu'une seule)
      let config = await prisma.siteConfig.findFirst();

      // Si pas de config, créer une config par défaut
      if (!config) {
        config = await prisma.siteConfig.create({
          data: {
            siteName: "Mon Institut de Beauté",
            siteTagline: "Institut de Beauté & Bien-être",
            email: "contact@mon-institut.fr",
            phone: "+33 6 00 00 00 00",
          }
        });
      }

      // Mettre en cache
      configCache = config;
      cacheTimestamp = Date.now();

      return config;
    } finally {
      // Réinitialiser la requête en cours
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}

/**
 * Met à jour la configuration du site
 */
export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  const prisma = await getPrismaClient();
  const currentConfig = await getSiteConfig();

  const updated = await prisma.siteConfig.update({
    where: { id: currentConfig.id },
    data
  });

  // Invalider le cache
  configCache = updated;
  cacheTimestamp = Date.now();

  return updated;
}

/**
 * Vide le cache de configuration (utile après une mise à jour manuelle)
 */
export function clearConfigCache() {
  configCache = null;
  cacheTimestamp = 0;
}

/**
 * Récupère une valeur spécifique de la config
 */
export async function getConfigValue<K extends keyof SiteConfig>(
  key: K
): Promise<SiteConfig[K]> {
  const config = await getSiteConfig();
  return config[key];
}

/**
 * Remplace les variables dans un template
 * Ex: "Bonjour {{siteName}}" devient "Bonjour Mon Institut"
 */
export async function replaceConfigVariables(template: string): Promise<string> {
  const config = await getSiteConfig();
  let result = template;

  // Remplacer toutes les variables {{key}}
  Object.keys(config).forEach((key) => {
    const value = config[key as keyof SiteConfig];
    if (value && typeof value === 'string') {
      result = result.replace(
        new RegExp(`{{${key}}}`, 'g'),
        value
      );
    }
  });

  return result;
}
