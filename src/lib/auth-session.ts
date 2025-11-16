import { cookies, headers } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

interface JWTPayload {
  userId: string
  email: string
  role?: string
  organizationId?: string
}

/**
 * Récupère l'utilisateur actuel depuis le token JWT
 * Utilisé dans les API routes pour vérifier l'authentification
 */
export async function getCurrentUser(request?: Request) {
  try {
    let token: string | null = null

    // Essayer de récupérer le token depuis le header Authorization
    if (request) {
      const authHeader = request.headers.get('authorization')
      token = authHeader?.replace('Bearer ', '') || null
    }

    // Si pas de token dans le header, essayer dans les cookies
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get('token')?.value || null
    }

    if (!token) {
      return null
    }

    // Vérifier et décoder le token
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET non configuré')
    }

    const decoded = jwt.verify(token, secret) as JWTPayload

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization
    }
  } catch (error) {
    console.error('Erreur getCurrentUser:', error)
    return null
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function requireAuth(request?: Request) {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new Error('Non authentifié')
  }

  return user
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export async function requireRole(role: string | string[], request?: Request) {
  const user = await requireAuth(request)

  const roles = Array.isArray(role) ? role : [role]

  if (!roles.includes(user.role)) {
    throw new Error('Permissions insuffisantes')
  }

  return user
}
