import * as Sentry from '@sentry/nextjs';

// Désactiver complètement Sentry en développement pour la performance
const isDev = process.env.NODE_ENV === 'development';

if (!isDev && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance Monitoring - seulement 10% en prod
    tracesSampleRate: 0.1,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Intégrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Ignorer certaines erreurs connues
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'NetworkError',
      'Network request failed',
      'Non-Error promise rejection captured',
    ],

    // Filtrer les transactions
    beforeSend(event) {
      if (event.exception?.values?.[0]?.value?.includes('404')) {
        return null;
      }
      return event;
    },
  });
}
