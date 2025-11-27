import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import CrispChat from './CrispChat';

export default async function CrispChatLoader() {
  try {
    console.log('[Crisp] Chargement du composant...');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      console.log('[Crisp] ❌ Pas de token');
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      console.log('[Crisp] ❌ Token invalide ou pas d\'organizationId');
      return null;
    }

    console.log('[Crisp] ✅ Token valide, orgId:', decoded.organizationId);

    try {
      const prisma = await getPrismaClient();

      // Récupérer la configuration de l'organisation
      const org = await prisma.organization.findUnique({
        where: { id: decoded.organizationId },
        select: { plan: true }
      });

      console.log('[Crisp] Plan organisation:', org?.plan);

      // Vérifier que l'organisation a accès au chat (TEAM ou PREMIUM)
      if (!org || (org.plan !== 'TEAM' && org.plan !== 'PREMIUM')) {
        console.log('[Crisp] ❌ Plan non éligible (besoin TEAM ou PREMIUM)');
        return null;
      }

      // Récupérer la config Crisp
      const config = await prisma.organizationConfig.findUnique({
        where: { organizationId: decoded.organizationId },
        select: {
          crispEnabled: true,
          crispWebsiteId: true
        }
      });

      console.log('[Crisp] Config:', { enabled: config?.crispEnabled, websiteId: config?.crispWebsiteId });

      if (!config?.crispEnabled || !config.crispWebsiteId) {
        console.log('[Crisp] ❌ Crisp non activé ou Website ID manquant');
        return null;
      }

      console.log('[Crisp] ✅ Chargement widget avec ID:', config.crispWebsiteId);
      return <CrispChat websiteId={config.crispWebsiteId} />;
    } catch (dbError) {
      console.log('[Crisp] ⚠️ Erreur DB, skip Crisp chat');
      return null;
    }
  } catch (error) {
    console.error('[Crisp] Erreur lors du chargement:', error);
    return null;
  }
}
