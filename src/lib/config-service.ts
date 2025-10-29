import { getPrismaClient } from './prisma';
import { SiteConfig } from '@prisma/client';
import { unstable_cache } from 'next/cache';

/**
 * Récupère la configuration du site depuis la BDD (version optimisée)
 * Ne récupère que les champs essentiels pour de meilleures performances
 * Utilise unstable_cache de Next.js pour un cache persistant de 30 minutes
 */
export const getSiteConfig = unstable_cache(
  async (): Promise<SiteConfig> => {
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
        latitude: true,
        longitude: true,
        googleMapsUrl: true,
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

    return config as SiteConfig;
  },
  ['site-config'], // Cache key
  {
    revalidate: 1800, // 30 minutes en secondes
    tags: ['site-config'] // Tag pour invalidation manuelle
  }
);

/**
 * Récupère la configuration COMPLÈTE du site (tous les champs)
 * À utiliser uniquement quand nécessaire (pages admin, CGV, etc.)
 */
export const getSiteConfigFull = unstable_cache(
  async (): Promise<SiteConfig> => {
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

    return config;
  },
  ['site-config-full'], // Cache key
  {
    revalidate: 1800, // 30 minutes
    tags: ['site-config-full']
  }
);

/**
 * Met à jour la configuration du site
 */
export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  const { revalidateTag } = await import('next/cache');
  const prisma = await getPrismaClient();
  const currentConfig = await getSiteConfigFull();

  const updated = await prisma.siteConfig.update({
    where: { id: currentConfig.id },
    data
  });

  // Invalider les caches Next.js
  revalidateTag('site-config');
  revalidateTag('site-config-full');

  return updated;
}

/**
 * Vide le cache de configuration (utile après une mise à jour manuelle)
 */
export async function clearConfigCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('site-config');
  revalidateTag('site-config-full');
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
