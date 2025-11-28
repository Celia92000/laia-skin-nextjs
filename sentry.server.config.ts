import * as Sentry from "@sentry/nextjs";

// Désactiver complètement Sentry en développement pour la performance
const isDev = process.env.NODE_ENV === 'development';

if (!isDev && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,

    beforeSend(event) {
      // Ignorer les erreurs de navigation Next.js
      if (event.exception?.values?.[0]?.value?.includes('NEXT_REDIRECT')) {
        return null;
      }
      // Ignorer les erreurs 404
      if (event.exception?.values?.[0]?.value?.includes('404')) {
        return null;
      }
      return event;
    },
  });
}
