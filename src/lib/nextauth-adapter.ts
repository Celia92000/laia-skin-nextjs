import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters"

/**
 * Custom NextAuth Adapter pour gérer le multi-tenancy
 *
 * Le problème : Notre modèle User a un unique constraint sur (organizationId, email)
 * mais PrismaAdapter essaie de chercher par email seul.
 *
 * Solution : Override getUserByEmail pour gérer le cas OAuth (organizationId = null)
 */
export function CustomPrismaAdapter(): Adapter {
  const baseAdapter = PrismaAdapter(prisma as any)

  return {
    ...baseAdapter,

    // Override getUserByEmail pour chercher les users OAuth sans organization
    async getUserByEmail(email: string) {
      // Pour OAuth, on cherche les users sans organizationId
      const user = await prisma.user.findFirst({
        where: {
          email,
          organizationId: null // OAuth users n'ont pas d'organization au départ
        }
      })
      return user
    },

    // Override createUser pour créer un user OAuth sans organization
    async createUser(data: any) {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name || '',
          emailVerified: data.emailVerified,
          image: data.image,
          password: null, // Pas de password pour OAuth
          organizationId: null, // Sera défini après le paiement
        }
      })
      return user
    }
  }
}
