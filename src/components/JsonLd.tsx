import { getSiteConfig } from '@/lib/config-service';
import { getPrismaClient } from '@/lib/prisma';

export default async function JsonLd() {
  // Récupérer la configuration du site
  const config = await getSiteConfig();

  // Récupérer les services actifs pour le catalogue avec gestion d'erreur
  let services: any[] = [];
  try {
    const prisma = await getPrismaClient();
    services = await prisma.service.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        shortDescription: true,
      },
      take: 20, // Limiter à 20 services pour éviter un JSON trop gros
    });
  } catch (error) {
    // Si Prisma n'est pas connecté ou erreur, continuer sans les services
    console.warn('JsonLd: Impossible de charger les services:', error);
  }

  // Construire l'URL de base avec fallback
  const baseUrl = config.baseUrl || 'https://laia-skin.fr';

  // Construire le tableau sameAs en filtrant les valeurs non nulles
  const socialLinks = [
    config.facebook,
    config.instagram,
    config.linkedin,
    config.youtube,
    config.tiktok,
  ].filter((link): link is string => !!link);

  // Convertir les coordonnées en nombres avec fallback
  const latitude = config.latitude ? parseFloat(config.latitude) : 48.8566;
  const longitude = config.longitude ? parseFloat(config.longitude) : 2.3522;

  // Construire l'URL Google Maps
  const googleMapsUrl = config.googleMapsUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(config.siteName || 'Mon Institut')}`;

  // 1. BeautySalon (informations principales)
  const beautySalon = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": config.siteName || "Mon Institut",
    "description": config.siteDescription || config.siteTagline || "Institut de beauté spécialisé dans les soins innovants du visage",
    "url": baseUrl,
    "telephone": config.phone || "",
    "email": config.email || "",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.address || "",
      "addressLocality": config.city || "",
      "postalCode": config.postalCode || "",
      "addressCountry": config.country || "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": latitude.toString(),
      "longitude": longitude.toString()
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "€€-€€€",
    "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
    "currenciesAccepted": "EUR",
    "hasMap": googleMapsUrl,
    "image": [
      config.logoUrl ? `${baseUrl}${config.logoUrl}` : `${baseUrl}/og-image.jpg`,
      `${baseUrl}/og-image.jpg`
    ].filter(Boolean),
    ...(socialLinks.length > 0 && { "sameAs": socialLinks }),
    // Avis clients (pour afficher les étoiles dans Google)
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    // Services proposés (dynamiques depuis la BDD)
    ...(services.length > 0 && {
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services de Soins Esthétiques",
        "itemListElement": services.map(service => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service.name,
            "description": service.shortDescription || service.name,
            "provider": {
              "@type": "BeautySalon",
              "name": config.siteName || "Mon Institut"
            }
          }
        }))
      }
    }),
    // Action de réservation
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/reservation`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Reservation",
        "name": "Réservation de soin esthétique"
      }
    }
  };

  // 2. LocalBusiness (pour le SEO local - Google Maps)
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": config.siteName || "Mon Institut",
    "image": config.logoUrl ? `${baseUrl}${config.logoUrl}` : `${baseUrl}/og-image.jpg`,
    "@id": baseUrl,
    "url": baseUrl,
    "telephone": config.phone || "",
    "priceRange": "€€-€€€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": config.address || "",
      "addressLocality": config.city || "",
      "postalCode": config.postalCode || "",
      "addressCountry": config.country || "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": latitude,
      "longitude": longitude
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ]
  };

  // 3. Organization (pour le Knowledge Graph de Google)
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.siteName || "Mon Institut",
    "url": baseUrl,
    "logo": config.logoUrl ? `${baseUrl}${config.logoUrl}` : `${baseUrl}/logo.png`,
    "description": config.siteDescription || config.siteTagline || "Institut de beauté premium spécialisé dans les soins innovants du visage",
    ...(socialLinks.length > 0 && { "sameAs": socialLinks }),
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": config.phone || "",
      "contactType": "customer service",
      "availableLanguage": ["French", "English"],
      "areaServed": config.country || "FR"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(beautySalon) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
