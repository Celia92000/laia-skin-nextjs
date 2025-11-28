import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  isConnected: boolean
}

// Créer une instance Prisma optimisée pour Supabase PgBouncer
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    errorFormat: 'minimal',
  });

  // Extension pour retry automatique et logging
  return client.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const maxRetries = 2;
        let lastError: any;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const result = await query(args);

            // Log des requêtes lentes (> 3s seulement pour éviter spam)
            const duration = performance.now() - start;
            if (duration > 3000) {
              console.warn(`⚠️ Slow query: ${model}.${operation} took ${Math.round(duration)}ms`);
            }

            return result;
          } catch (error: any) {
            lastError = error;

            // Erreurs retriables
            const isRetriable =
              error.code === 'P1001' || // Can't reach database
              error.code === 'P1008' || // Timeout
              error.code === 'P1017' || // Server closed connection
              error.code === 'P2024' || // Connection pool timeout
              error.message?.includes('Connection pool timeout') ||
              error.message?.includes('Can\'t reach database') ||
              error.message?.includes('Connection terminated');

            if (isRetriable && attempt < maxRetries) {
              const delay = Math.min(100 * Math.pow(2, attempt), 1000); // 100ms, 200ms, max 1s
              console.log(`🔄 Retry ${model}.${operation} (${attempt + 1}/${maxRetries}) in ${delay}ms...`);
              await new Promise(r => setTimeout(r, delay));
              continue;
            }

            throw error;
          }
        }

        throw lastError;
      }
    }
  });
};

// Singleton Prisma - une seule instance par process
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as any;
}

// Connexion initiale asynchrone (non-bloquante)
let connectionPromise: Promise<void> | null = null;

const ensureConnection = async () => {
  if (globalForPrisma.isConnected) return;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        await prisma.$connect();
        globalForPrisma.isConnected = true;
        console.log('✅ Prisma connected to Supabase');
      } catch (e) {
        console.log('⚠️ Prisma initial connection failed, will retry on first query');
      }
    })();
  }

  await connectionPromise;
};

// Fonction qui retourne le client Prisma après avoir assuré la connexion
const getPrismaClient = async () => {
  await ensureConnection();
  return prisma;
};

// Lancer la connexion en background au démarrage
if (typeof window === 'undefined') {
  ensureConnection().catch(() => {});
}

// Cleanup gracieux
if (process.env.NODE_ENV === 'production') {
  const cleanup = async () => {
    await prisma.$disconnect();
  };
  process.on('beforeExit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

export default prisma;
export { prisma, getPrismaClient };