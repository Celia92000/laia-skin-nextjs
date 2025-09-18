import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Fix pour Supabase PgBouncer - utilise le port direct pour éviter les erreurs
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || ''
  
  // Sur Vercel, ajouter les paramètres pour éviter l'erreur "prepared statement already exists"
  if (process.env.VERCEL) {
    // Si l'URL n'a pas déjà les paramètres, les ajouter
    if (!url.includes('pgbouncer=true')) {
      const separator = url.includes('?') ? '&' : '?'
      return url + separator + 'pgbouncer=true&statement_cache_size=0'
    }
  }
  
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
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  // Configuration pour éviter les erreurs de prepared statements
  ...(process.env.VERCEL && {
    datasourceUrl: getDatabaseUrl()
  })
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma