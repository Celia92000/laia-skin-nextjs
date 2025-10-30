import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CrispChat from './CrispChat';

export default async function CrispChatLoader() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.organizationId) {
      return null;
    }

    // Récupérer la configuration de l'organisation
    const org = await prisma.organization.findUnique({
      where: { id: decoded.organizationId },
      select: { plan: true }
    });

    // Vérifier que l'organisation a accès au chat (TEAM ou PREMIUM)
    if (!org || (org.plan !== 'TEAM' && org.plan !== 'PREMIUM')) {
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

    if (!config?.crispEnabled || !config.crispWebsiteId) {
      return null;
    }

    return <CrispChat websiteId={config.crispWebsiteId} />;
  } catch (error) {
    console.error('[Crisp] Erreur lors du chargement:', error);
    return null;
  }
}
