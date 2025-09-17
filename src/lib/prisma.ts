import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Fix pour Supabase PgBouncer - utilise le port direct pour éviter les erreurs
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || ''
  // Si on utilise le pooler (port 6543), on bascule sur le port direct (5432)
  if (url.includes(':6543')) {
    return url.replace(':6543', ':5432').replace('?pgbouncer=true&statement_cache_size=0', '')
  }
  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma