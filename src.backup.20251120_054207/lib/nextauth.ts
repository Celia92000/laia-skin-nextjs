import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  // Pas d'adapter : on gère manuellement pour le multi-tenancy
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Lors de la première connexion Google
      if (account && profile) {
        // Créer ou récupérer l'utilisateur OAuth (sans organizationId)
        let dbUser = await prisma.user.findFirst({
          where: {
            email: profile.email,
            organizationId: null // OAuth users sans organization
          }
        })

        if (!dbUser) {
          // Créer le user OAuth
          dbUser = await prisma.user.create({
            data: {
              email: profile.email!,
              name: profile.name || '',
              image: (profile as any).picture,
              emailVerified: new Date(),
              password: null,
              organizationId: null,
            }
          })

          // Créer l'Account pour stocker les tokens OAuth
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            }
          })
        }

        token.id = dbUser.id
        token.role = dbUser.role
        token.organizationId = dbUser.organizationId
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.organizationId = token.organizationId as string | null
      }
      return session
    },
  },
  pages: {
    signIn: '/onboarding-shopify',
    error: '/onboarding-shopify',
  },
  session: {
    strategy: "jwt", // Utiliser JWT au lieu de database
  },
}
