import { headers } from 'next/headers';
import { getPrismaClient } from '@/lib/prisma';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import CrispChatLoader from "@/components/CrispChatLoader";
import PushNotificationManager from "@/components/PushNotificationManager";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Détection de l'organisation pour les couleurs
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  let organization = null;

  try {
    const prisma = await getPrismaClient();

    // 1️⃣ Domaine personnalisé
    if (!cleanHost.includes('localhost')) {
      organization = await prisma.organization.findUnique({
        where: { domain: cleanHost },
        include: { config: true }
      });
    }

    // 2️⃣ Subdomain
    if (!organization) {
      const parts = cleanHost.split('.');
      let subdomain = 'laia-skin-institut';

      if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
        subdomain = parts[0];
      }

      organization = await prisma.organization.findUnique({
        where: { subdomain },
        include: { config: true }
      });
    }

    // 3️⃣ Fallback
    if (!organization) {
      organization = await prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' },
        include: { config: true }
      });
    }
  } catch (error) {
    console.error('Error loading organization in layout:', error);
    // Continuer avec organization = null, les couleurs par défaut seront utilisées
  }

  // Couleurs par défaut
  const primaryColor = organization?.config?.primaryColor || '#d4b5a0';
  const secondaryColor = organization?.config?.secondaryColor || '#c9a084';
  const accentColor = organization?.config?.accentColor || '#2c3e50';

  return (
    <div
      style={{
        // @ts-ignore
        '--color-primary': primaryColor,
        '--color-secondary': secondaryColor,
        '--color-accent': accentColor,
      }}
    >
      <ImpersonationBanner />
      <Header organizationData={organization} />
      {children}
      <Footer organizationData={organization} />
      <PWAInstallPrompt />
      <CrispChatLoader />
      <PushNotificationManager />
    </div>
  );
}