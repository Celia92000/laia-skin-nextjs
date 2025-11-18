import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Créer une instance Prisma avec pool de connexions optimisé pour Supabase free tier
const createPrismaClient = () => {
  // Vérifier que DATABASE_URL est définie
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not defined');
    // Retourner un client mock en développement si DATABASE_URL n'est pas définie
    if (process.env.NODE_ENV === 'development') {
      throw new Error('DATABASE_URL environment variable is required');
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        let retries = 3;
        let lastError;

        while (retries > 0) {
          try {
            return await query(args);
          } catch (error: any) {
            lastError = error;
            // Si le moteur n'est pas connecté, la réponse est vide, ou erreur de connexion DB
            const isRetriableError =
              error.message?.includes('Engine is not yet connected') ||
              error.message?.includes('Response from the Engine was empty') ||
              error.message?.includes('Can\'t reach database server') ||
              error.name?.includes('PrismaClientUnknownRequestError') ||
              error.name?.includes('PrismaClientInitializationError') ||
              error.code === 'P1001' || // Prisma connection error
              error.code === 'P1008' || // Timeout
              error.code === 'P1017';   // Server closed connection

            if (isRetriableError) {
              retries--;
              if (retries > 0) {
                console.log(`Retrying ${model}.${operation} (${3 - retries}/3)...`);
                // Attendre un peu avant de réessayer (backoff exponentiel)
                const delay = (4 - retries) * 500; // 500ms, 1s, 1.5s
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
            }
            throw error;
          } finally {
            const end = performance.now();
            if (end - start > 1000) {
              console.warn(`Slow query: ${model}.${operation} took ${end - start}ms`);
            }
          }
        }

        throw lastError;
      }
    }
  });
};

// Instance Prisma singleton
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Sauvegarder l'instance globale en développement pour éviter les multiples instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma as any;
}

// Variable pour stocker la promesse de connexion
let connectionPromise: Promise<typeof prisma> | null = null;

// Fonction pour obtenir le client Prisma (avec connexion assurée)
const getPrismaClient = async () => {
  // Si une connexion est déjà en cours, attendre qu'elle se termine
  if (connectionPromise) {
    return connectionPromise;
  }

  // Créer la promesse de connexion
  connectionPromise = (async () => {
    let retries = 3;
    while (retries > 0) {
      try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully');
        return prisma;
      } catch (error: any) {
        retries--;
        if (retries > 0) {
          console.log(`⏳ Retrying Prisma connection (${3 - retries}/3)...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.error('❌ Failed to connect to Prisma after 3 attempts:', error);
          // Retourner quand même le client - il se connectera à la première requête
          return prisma;
        }
      }
    }
    return prisma;
  })();

  return connectionPromise;
};

// Gérer la déconnexion gracieuse
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
export { prisma, getPrismaClient };