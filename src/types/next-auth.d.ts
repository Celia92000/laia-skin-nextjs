import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extension de la session NextAuth pour inclure les propriétés custom
   */
  interface Session {
    user: {
      id: string
      role?: UserRole
      organizationId?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    role?: UserRole
    organizationId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: UserRole
    organizationId?: string | null
  }
}
