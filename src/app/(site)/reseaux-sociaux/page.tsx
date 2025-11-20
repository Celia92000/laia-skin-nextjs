import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSiteConfig } from '@/lib/config-service';
import { SocialQRCodes } from '@/components/SocialQRCodes';

export const revalidate = 60;

export default async function ReseauxSociauxPage() {
  // Récupérer l'organisation par domaine personnalisé ou subdomain
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  let organization = null;

  // 🔥 Sur localhost, on force Laia Skin Institut
  if (cleanHost.includes('localhost')) {
    organization = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' },
      include: { OrganizationConfig: true }
    });
  } else {
    // Optimisation: recherche parallèle par domaine, subdomain et fallback
    const parts = cleanHost.split('.');
    const subdomain = parts.length > 1 && parts[0] !== 'www'
      ? parts[0]
      : 'laia-skin-institut';

    const [orgByDomain, orgBySubdomain, orgBySlug] = await Promise.all([
      prisma.organization.findUnique({
        where: { domain: cleanHost },
        include: { OrganizationConfig: true }
      }),
      prisma.organization.findUnique({
        where: { subdomain: subdomain },
        include: { OrganizationConfig: true }
      }),
      prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' },
        include: { OrganizationConfig: true }
      })
    ]);

    organization = orgByDomain || orgBySubdomain || orgBySlug;
  }

  if (!organization) {
    return <div>Organisation non trouvée</div>;
  }

  const config = organization.OrganizationConfig || await getSiteConfig();

  // Couleurs de l'organisation
  const primaryColor = organization?.OrganizationConfig?.primaryColor || '#d4b5a0';
  const secondaryColor = organization?.OrganizationConfig?.secondaryColor || '#c9a084';
  const accentColor = organization?.OrganizationConfig?.accentColor || '#2c3e50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6">
            <span
              className="px-6 py-3 rounded-full text-sm font-semibold tracking-wide uppercase"
              style={{
                background: `linear-gradient(to right, ${primaryColor}20, ${secondaryColor}20)`,
                color: primaryColor
              }}
            >
              Rejoignez notre communauté
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6 leading-tight"
            style={{ color: accentColor }}
          >
            {config.qrCodesSectionTitle || 'Suivez-nous sur les Réseaux'}
          </h1>

          <p
            className="text-lg md:text-xl max-w-3xl mx-auto mb-8"
            style={{ color: `${accentColor}b3` }}
          >
            {config.qrCodesSectionDescription || 'Scannez les QR codes pour nous rejoindre et ne manquer aucune de nos actualités'}
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <div
              className="w-20 h-[0.5px]"
              style={{ background: `linear-gradient(to right, transparent, ${primaryColor})` }}
            ></div>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
            ></div>
            <div
              className="w-20 h-[0.5px]"
              style={{ background: `linear-gradient(to left, transparent, ${primaryColor})` }}
            ></div>
          </div>
        </div>
      </section>

      {/* QR Codes et Galerie */}
      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SocialQRCodes showTitle={true} size="large" showGallery={true} />
        </div>
      </section>
    </div>
  );
}
