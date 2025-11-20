/**
 * Réexporte prisma depuis db.ts pour compatibilité
 */
import dbPrisma from './db';

/**
 * Instance Prisma singleton
 */
export const prisma = dbPrisma;

/**
 * Retourne l'instance Prisma Client singleton
 */
export async function getPrismaClient() {
  return dbPrisma;
}

export default dbPrisma;
