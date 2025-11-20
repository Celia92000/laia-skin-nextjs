import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export default async function MentionsLegales() {
  // Récupérer l'organisation par domaine
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();

  let organization = null;

  // Sur localhost, forcer Laia Skin Institut
  if (cleanHost.includes('localhost')) {
    organization = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' },
      include: { OrganizationConfig: true }
    });
  } else {
    const parts = cleanHost.split('.');
    const subdomain = parts.length > 1 && parts[0] !== 'www' ? parts[0] : 'laia-skin-institut';

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

  const config = organization.OrganizationConfig || {};

  // Couleurs dynamiques
  const accentColor = config.accentColor || '#2c3e50';

  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-light mb-8 tracking-wide uppercase text-center" style={{ color: accentColor }}>
          Mentions Légales
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              1. Éditeur du site
            </h2>
            <div className="text-sm space-y-2 font-light" style={{ color: `${accentColor}B3` }}>
              {config.legalName && <p><strong>Raison sociale :</strong> {config.legalName}</p>}
              {config.siren && <p><strong>N° SIREN :</strong> {config.siren}</p>}
              {config.siret && <p><strong>N° SIRET :</strong> {config.siret}</p>}
              {config.legalRepName && <p><strong>Responsable :</strong> {config.legalRepName}</p>}
              {config.address && (
                <p><strong>Adresse :</strong> {config.address}{config.postalCode && `, ${config.postalCode}`}{config.city && ` ${config.city}`}{config.country && `, ${config.country}`}</p>
              )}
              {config.phone && <p><strong>Téléphone :</strong> {config.phone}</p>}
              {config.email && <p><strong>Email :</strong> {config.email}</p>}
              {config.instagram && <p><strong>Instagram :</strong> {config.instagram}</p>}
              {config.tvaNumber && <p><strong>N° TVA :</strong> {config.tvaNumber}</p>}
              {config.rcs && <p><strong>RCS :</strong> {config.rcs}</p>}
              {config.apeCode && <p><strong>Code APE :</strong> {config.apeCode}</p>}
              {config.capital && <p><strong>Capital social :</strong> {config.capital}</p>}
              {config.legalForm && <p><strong>Forme juridique :</strong> {config.legalForm}</p>}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              2. Hébergement
            </h2>
            <div className="text-sm space-y-2 font-light" style={{ color: `${accentColor}B3` }}>
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              <p><strong>Site web :</strong> https://vercel.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              3. Propriété intellectuelle
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur
              et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les
              documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p className="text-sm font-light leading-relaxed mt-3" style={{ color: `${accentColor}B3` }}>
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est
              formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              4. Protection des données personnelles
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement
              Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification,
              de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p className="text-sm font-light leading-relaxed mt-3" style={{ color: `${accentColor}B3` }}>
              Pour exercer ce droit, vous pouvez nous contacter par email à : {config.email || 'contact@example.com'}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              5. Cookies
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.
              En continuant à naviguer sur ce site, vous acceptez l'utilisation de cookies conformément
              à notre politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              6. Responsabilité
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              {config.siteName || 'Notre institut'} s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations
              diffusées sur ce site. Cependant, nous ne pouvons garantir l'exactitude, la précision ou
              l'exhaustivité des informations mises à disposition sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              7. Droit applicable
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Les présentes mentions légales sont régies par le droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 space-y-3">
            <p className="text-xs text-center font-light" style={{ color: `${accentColor}80` }}>
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-center font-light" style={{ color: `${accentColor}60` }}>
              Plateforme éditée par <strong>LAIA Connect</strong> - Solution de gestion pour instituts de beauté
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
