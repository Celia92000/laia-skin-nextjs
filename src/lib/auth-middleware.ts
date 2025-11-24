import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';

/**
 * Vérifie que l'utilisateur est authentifié et a le rôle SUPER_ADMIN
 * @returns L'utilisateur si autorisé, null sinon
 */
export async function verifySuperAdmin(request: NextRequest): Promise<{
  userId: string;
  role: string;
  organizationId?: string | null;
} | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'SUPER_ADMIN') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Vérifie que l'utilisateur est authentifié et a un rôle admin (ORG_ADMIN, LOCATION_MANAGER, etc.)
 * @returns L'utilisateur complet avec organizationId si autorisé, null sinon
 */
export async function verifyAdmin(request: NextRequest): Promise<{
  id: string;
  role: string;
  organizationId: string | null;
} | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return null;
    }

    // Vérifier que l'utilisateur a un rôle admin
    const allowedRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'LOCATION_MANAGER', 'STAFF', 'RECEPTIONIST', 'ACCOUNTANT'];
    if (!allowedRoles.includes(decoded.role)) {
      return null;
    }

    // Récupérer l'utilisateur complet avec organizationId
    const prisma = await getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        organizationId: true
      }
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware pour protéger les routes SUPER_ADMIN
 * Retourne une réponse 401/403 si non autorisé
 */
export async function requireSuperAdmin(request: NextRequest) {
  const user = await verifySuperAdmin(request);

  if (!user) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé - Token manquant' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Accès refusé - Rôle SUPER_ADMIN requis' }, { status: 403 });
  }

  return user;
}

/**
 * Middleware pour protéger les routes ADMIN (tous types d'admin)
 * Retourne une réponse 401/403 si non autorisé
 */
export async function requireAdmin(request: NextRequest) {
  const user = await verifyAdmin(request);

  if (!user) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé - Token manquant' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Accès refusé - Rôle admin requis' }, { status: 403 });
  }

  return user;
}
