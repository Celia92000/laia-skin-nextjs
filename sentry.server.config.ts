import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environnement et release
  environment: process.env.NODE_ENV,

  // Taux d'échantillonnage des traces de performance (10% en prod pour économiser)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Désactiver en développement (seulement actif en production)
  enabled: process.env.NODE_ENV === "production",

  // Configuration pour ignorer certaines erreurs
  beforeSend(event) {
    // Ignorer les erreurs de navigation Next.js
    if (event.exception?.values?.[0]?.value?.includes('NEXT_REDIRECT')) {
      return null;
    }

    // Ignorer les erreurs 404
    if (event.exception?.values?.[0]?.value?.includes('404')) {
      return null;
    }

    // Ignorer les erreurs de bot/crawler
    const userAgent = event.request?.headers?.['user-agent'];
    if (userAgent && /bot|crawler|spider/i.test(userAgent)) {
      return null;
    }

    // Ajouter des métadonnées serveur
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'Next.js',
        version: process.env.npm_package_version || 'unknown',
      },
    };

    return event;
  },
});
