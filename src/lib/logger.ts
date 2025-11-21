import winston from 'winston';

// Déterminer l'environnement
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Format personnalisé pour les logs
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

  // Ajouter les métadonnées si présentes
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Configuration des transports (où vont les logs)
const transports: winston.transport[] = [];

// En développement : logs dans la console avec couleurs
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        customFormat
      )
    })
  );
}

// En production : logs structurés JSON (pour Vercel/Sentry)
if (isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Créer le logger
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports,
  // Ne pas quitter le process en cas d'erreur
  exitOnError: false
});

// Wrapper pour faciliter l'utilisation
export const log = {
  // Informations générales
  info: (message: string, meta?: any) => {
    logger.info(message, typeof meta === 'object' && meta !== null ? meta : { value: meta });
  },

  // Avertissements
  warn: (message: string, meta?: any) => {
    logger.warn(message, typeof meta === 'object' && meta !== null ? meta : { value: meta });
  },

  // Erreurs
  error: (message: string, error?: Error | unknown, meta?: Record<string, any>) => {
    if (error instanceof Error) {
      logger.error(message, {
        ...meta,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      });
    } else {
      logger.error(message, { ...meta, error });
    }
  },

  // Debug (uniquement en développement)
  debug: (message: string, meta?: Record<string, any>) => {
    if (isDevelopment) {
      logger.debug(message, meta);
    }
  },

  // Succès (niveau info avec préfixe)
  success: (message: string, meta?: Record<string, any>) => {
    logger.info(`✅ ${message}`, meta);
  },

  // Requêtes HTTP
  http: (method: string, path: string, status: number, duration?: number) => {
    logger.info(`HTTP ${method} ${path} ${status}`, { duration });
  },

  // Requêtes BDD
  db: (query: string, duration?: number, meta?: Record<string, any>) => {
    if (duration && duration > 1000) {
      logger.warn(`🐌 Slow query (${duration}ms): ${query}`, meta);
    } else {
      logger.debug(`DB: ${query}`, { duration, ...meta });
    }
  },

  // Stripe events
  stripe: (event: string, meta?: Record<string, any>) => {
    logger.info(`💳 Stripe: ${event}`, meta);
  },

  // Email events
  email: (action: string, to: string, meta?: Record<string, any>) => {
    logger.info(`📧 Email ${action}: ${to}`, meta);
  },

  // SMS events
  sms: (action: string, to: string, meta?: Record<string, any>) => {
    logger.info(`📱 SMS ${action}: ${to}`, meta);
  },

  // WhatsApp events
  whatsapp: (action: string, to: string, meta?: Record<string, any>) => {
    logger.info(`💬 WhatsApp ${action}: ${to}`, meta);
  },

  // Auth events
  auth: (action: string, user?: string, meta?: Record<string, any>) => {
    logger.info(`🔐 Auth ${action}${user ? `: ${user}` : ''}`, meta);
  },

  // Cron jobs
  cron: (job: string, status: 'start' | 'success' | 'error', meta?: Record<string, any>) => {
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏰';
    logger.info(`${emoji} Cron ${job}: ${status}`, meta);
  }
};

// Export aussi le logger Winston brut pour cas avancés
export default logger;
