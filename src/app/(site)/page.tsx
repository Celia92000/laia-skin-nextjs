import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import dynamicImport from 'next/dynamic';

// Import dynamique avec SSR désactivé pour éviter ENOENT
const PageContent = dynamicImport(
  () => import('@/components/PageContent'),
  { ssr: false }
);

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function Home() {
  // Routing par domaine : laiaconnect.fr → /platform
  const headersList = await headers();
  const host = headersList.get('host') || '';

  if (host.includes('laiaconnect.fr')) {
    redirect('/platform');
  }

  // Récupérer l'organisation par domaine personnalisé ou subdomain
  const cleanHost = host.split(':')[0].toLowerCase();

  console.log(`🌐 Host reçu: ${host} → Clean host: ${cleanHost}`);

  let organization = null;

  // 1️⃣ D'abord, essayer de trouver par domaine personnalisé (custom domain)
  // Ex: beaute-eternelle.fr → chercher dans organization.domain
  if (!cleanHost.includes('localhost')) {
    organization = await prisma.organization.findUnique({
      where: { domain: cleanHost },
      include: { config: true }
    });

    if (organization) {
      console.log(`✅ Organisation trouvée par domaine personnalisé: ${organization.name}`);
    }
  }

  // 2️⃣ Si pas trouvé, extraire le subdomain (première partie avant le premier point)
  // Ex: belle-peau-institut.localhost → belle-peau-institut
  if (!organization) {
    const parts = cleanHost.split('.');
    let subdomain = 'laia-skin-institut'; // Par défaut

    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
      subdomain = parts[0];
    }

    console.log(`🔍 Recherche par subdomain: ${subdomain}`);

    organization = await prisma.organization.findUnique({
      where: { subdomain: subdomain },
      include: { config: true }
    });

    if (organization) {
      console.log(`✅ Organisation trouvée par subdomain: ${organization.name}`);
    }
  }

  // 3️⃣ Fallback vers l'organisation par défaut (LAIA SKIN INSTITUT)
  if (!organization) {
    console.log(`⚠️ Aucune organisation trouvée, utilisation de laia-skin-institut par défaut`);
    organization = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' },
      include: { config: true }
    });

    if (!organization) {
      return <div>Organisation non trouvée</div>;
    }
  }

  const config = organization?.config || await getSiteConfig();

  // Couleurs de l'organisation
  const primaryColor = organization?.config?.primaryColor || '#d4b5a0';
  const secondaryColor = organization?.config?.secondaryColor || '#c9a084';
  const accentColor = organization?.config?.accentColor || '#2c3e50';

  let services: any[] = [];

  // Parse testimonials from config (JSON)
  let testimonials: any[] = [];
  try {
    if (config.testimonials) {
      testimonials = JSON.parse(config.testimonials);
    }
  } catch (e) {
    console.error('Error parsing testimonials:', e);
  }

  try {
    // Récupérer les services depuis la base de données (sans les forfaits)
    services = await prisma.service.findMany({
      where: {
        organizationId: organization.id, // Filtrer par organisation
        active: true,
        category: { not: 'forfaits' } // Exclure les forfaits
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    // En cas d'erreur, on continue avec un tableau vide
  }

  // Trier pour mettre les services featured en premier, puis par ordre
  const sortedServices = [...services].sort((a, b) => {
    // D'abord trier par featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Ensuite par ordre
    return (a.order || 0) - (b.order || 0);
  });

  // Return the PageContent component with all data
  return (
    <PageContent
      organization={organization}
      services={sortedServices}
      config={config}
      testimonials={testimonials}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      accentColor={accentColor}
    />
  );
}
