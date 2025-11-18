import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration spéciale pour Supabase avec PgBouncer
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Fix pour PgBouncer - désactive les prepared statements
  // et utilise le mode transaction
  ...(process.env.DATABASE_URL?.includes('pooler.supabase.com') && {
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '&pgbouncer=true&connection_limit=1'
      }
    }
  })
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma