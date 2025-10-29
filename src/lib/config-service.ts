import { getPrismaClient } from './prisma';
import { SiteConfig } from '@prisma/client';

// Cache en mémoire pour éviter les requêtes répétées
let configCache: SiteConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (optimisé de 5min)

// Cache pour la config complète
let fullConfigCache: SiteConfig | null = null;
let fullCacheTimestamp: number = 0;

/**
 * Récupère la configuration du site depuis la BDD (version optimisée)
 * Ne récupère que les champs essentiels pour de meilleures performances
 * Utilise un cache de 30 minutes
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  const now = Date.now();

  // Retourner le cache si valide
  if (configCache && (now - cacheTimestamp) < CACHE_TTL) {
    return configCache;
  }

  const prisma = await getPrismaClient();

  // Récupérer uniquement les champs essentiels couramment utilisés
  let config = await prisma.siteConfig.findFirst({
    select: {
      id: true,
      siteName: true,
      siteTagline: true,
      siteDescription: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
      facebook: true,
      instagram: true,
      tiktok: true,
      whatsapp: true,
      linkedin: true,
      youtube: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      logoUrl: true,
      faviconUrl: true,
      fontFamily: true,
      headingFont: true,
      baseFontSize: true,
      headingSize: true,
      businessHours: true,
      heroTitle: true,
      heroSubtitle: true,
      heroImage: true,
      aboutText: true,
      emailSignature: true,
      legalRepName: true,
      customDomain: true,
      baseUrl: true,
      // Champs lourds exclus pour performance (textes longs @db.Text, JSON arrays)
      // termsAndConditions, privacyPolicy, legalNotice, aboutIntro, aboutParcours
      // testimonials, formations, founderQuote, welcomeEmailText
      // (utilisez getSiteConfigFull si besoin)
    }
  });

  // Si pas de config, créer une config par défaut
  if (!config) {
    config = await prisma.siteConfig.create({
      data: {
        siteName: "Mon Institut de Beauté",
        siteTagline: "Institut de Beauté & Bien-être",
        email: "contact@mon-institut.fr",
        phone: "+33 6 00 00 00 00",
      }
    }) as SiteConfig;
  }

  // Mettre en cache
  configCache = config as SiteConfig;
  cacheTimestamp = now;

  return configCache;
}

/**
 * Récupère la configuration COMPLÈTE du site (tous les champs)
 * À utiliser uniquement quand nécessaire (pages admin, CGV, etc.)
 */
export async function getSiteConfigFull(): Promise<SiteConfig> {
  const now = Date.now();

  // Retourner le cache si valide
  if (fullConfigCache && (now - fullCacheTimestamp) < CACHE_TTL) {
    return fullConfigCache;
  }

  const prisma = await getPrismaClient();

  // Récupérer la config complète
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
  fullConfigCache = config;
  fullCacheTimestamp = now;

  return config;
}

/**
 * Met à jour la configuration du site
 */
export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  const prisma = await getPrismaClient();
  const currentConfig = await getSiteConfigFull(); // Utiliser la version complète

  const updated = await prisma.siteConfig.update({
    where: { id: currentConfig.id },
    data
  });

  // Invalider les deux caches
  configCache = null;
  fullConfigCache = updated;
  cacheTimestamp = 0;
  fullCacheTimestamp = Date.now();

  return updated;
}

/**
 * Vide le cache de configuration (utile après une mise à jour manuelle)
 */
export function clearConfigCache() {
  configCache = null;
  fullConfigCache = null;
  cacheTimestamp = 0;
  fullCacheTimestamp = 0;
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
