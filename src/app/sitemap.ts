import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Détection du domaine via variable d'environnement
  const isLaiaConnect = process.env.NEXT_PUBLIC_SITE_TYPE === 'saas';
  const baseUrl = isLaiaConnect
    ? 'https://laiaconnect.fr'
    : 'https://laiaskininstitut.fr';
  const currentDate = new Date();

  // Sitemap pour LAIA Connect (SaaS)
  if (isLaiaConnect) {
    return [
      // Page d'accueil SaaS (priorité maximale)
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 1,
      },
      {
        url: `${baseUrl}/platform`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 1,
      },

      // Pages principales SaaS (haute priorité)
      {
        url: `${baseUrl}/pour-qui`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/platform/nouveautes`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/register`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/connexion`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: 0.5,
      },

      // Pages légales
      {
        url: `${baseUrl}/mentions-legales`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/politique-confidentialite`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cgv`,
        lastModified: currentDate,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
    ];
  }

  // Sitemap pour LAIA Skin Institut (Template démo)
  return [
    // Page d'accueil institut (priorité maximale)
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },

    // Pages principales (haute priorité)
    {
      url: `${baseUrl}/prestations`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reservation`,
      lastModified: currentDate,
      changeFrequency: 'daily', // Change souvent (disponibilités)
      priority: 0.9,
    },

    // Prestations individuelles (importante pour SEO local)
    {
      url: `${baseUrl}/prestations/hydrofacial`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prestations/bb-glow`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prestations/microneedling`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prestations/led-therapie`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prestations/soin-visage`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // Pages secondaires
    {
      url: `${baseUrl}/a-propos`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // Pages utiles (priorité basse)
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cgv`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },

    // Pages de connexion (priorité très basse, mais indexables)
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}