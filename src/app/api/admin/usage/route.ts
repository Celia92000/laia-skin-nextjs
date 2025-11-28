import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUsageDashboard } from '@/lib/quotas';
import { getCurrentOrganizationId } from '@/lib/get-current-organization';

/**
 * GET /api/admin/usage
 * Récupère le dashboard d'usage de l'organisation courante
 */
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer l'organisation
    const organizationId = decoded.organizationId || await getCurrentOrganizationId();
    if (!organizationId) {
      return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });
    }

    // Récupérer le dashboard d'usage
    const dashboard = await getUsageDashboard(organizationId);

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Erreur récupération usage:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
