import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environnement et release
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% des sessions en production
  replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur

  // Intégrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Ignorer certaines erreurs connues
  ignoreErrors: [
    // Erreurs de navigation
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Erreurs réseau temporaires
    'NetworkError',
    'Network request failed',
    // Extensions navigateur
    'Non-Error promise rejection captured',
  ],

  // Filtrer les transactions
  beforeSend(event, hint) {
    // Ne pas logger les erreurs 404
    if (event.exception?.values?.[0]?.value?.includes('404')) {
      return null;
    }

    // Ajouter des infos utilisateur si disponible
    if (typeof window !== 'undefined') {
      const user = window.localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          event.user = {
            id: userData.id,
            email: userData.email,
            username: userData.firstName + ' ' + userData.lastName,
          };
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    }

    return event;
  },
});