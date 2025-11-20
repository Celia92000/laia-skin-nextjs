import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export default async function PolitiqueConfidentialite() {
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
          Politique de Confidentialité
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {config.privacyPolicy ? (
            <div className="prose prose-sm max-w-none">
              <div
                className="text-sm font-light leading-relaxed space-y-8"
                dangerouslySetInnerHTML={{ __html: config.privacyPolicy.replace(/\n\n/g, '</p><p class="text-sm font-light leading-relaxed">').replace(/^/, '<p class="text-sm font-light leading-relaxed">').replace(/$/, '</p>') }}
              />
            </div>
          ) : (
            <div className="space-y-8">
          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 1 - Introduction
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              {config.siteName || "L'institut"} s'engage à protéger la vie privée de ses clients. Cette politique de confidentialité
              explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au
              Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 2 - Données collectées
            </h2>
            <p className="text-sm font-light leading-relaxed mb-3" style={{ color: `${accentColor}B3` }}>
              Nous collectons les informations suivantes :
            </p>
            <ul className="text-sm font-light space-y-2 ml-6 list-disc" style={{ color: `${accentColor}B3` }}>
              <li>Nom, prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Date de naissance</li>
              <li>Historique des rendez-vous et soins</li>
              <li>Données de paiement (traitées de manière sécurisée)</li>
              <li>Photos avant/après (avec votre consentement explicite)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 3 - Utilisation des données
            </h2>
            <p className="text-sm font-light leading-relaxed mb-3" style={{ color: `${accentColor}B3` }}>
              Vos données sont utilisées pour :
            </p>
            <ul className="text-sm font-light space-y-2 ml-6 list-disc" style={{ color: `${accentColor}B3` }}>
              <li>Gérer vos rendez-vous et réservations</li>
              <li>Vous envoyer des confirmations et rappels</li>
              <li>Traiter vos paiements</li>
              <li>Vous informer de nos actualités et promotions (avec votre consentement)</li>
              <li>Améliorer nos services</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 4 - Partage des données
            </h2>
            <p className="text-sm font-light leading-relaxed mb-3" style={{ color: `${accentColor}B3` }}>
              Nous ne vendons jamais vos données personnelles. Vos informations peuvent être partagées uniquement avec :
            </p>
            <ul className="text-sm font-light space-y-2 ml-6 list-disc" style={{ color: `${accentColor}B3` }}>
              <li>Nos prestataires de paiement sécurisés</li>
              <li>Nos services de communication (email, WhatsApp) pour les notifications</li>
              <li>Les autorités compétentes si la loi l'exige</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 5 - Conservation des données
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles
              elles ont été collectées, et conformément aux obligations légales (généralement 3 ans après votre
              dernière interaction avec nous).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 6 - Vos droits
            </h2>
            <p className="text-sm font-light leading-relaxed mb-3" style={{ color: `${accentColor}B3` }}>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="text-sm font-light space-y-2 ml-6 list-disc" style={{ color: `${accentColor}B3` }}>
              <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
              <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
              <li><strong>Droit de limitation :</strong> Limiter le traitement de vos données</li>
            </ul>
            <p className="text-sm font-light leading-relaxed mt-3" style={{ color: `${accentColor}B3` }}>
              Pour exercer ces droits, contactez-nous à : <strong>{config.email || "contact@institut.fr"}</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 7 - Sécurité
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos
              données contre tout accès non autorisé, modification, divulgation ou destruction. Toutes les
              données sensibles sont cryptées et stockées sur des serveurs sécurisés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 8 - Cookies
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez configurer votre
              navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient ne pas
              fonctionner correctement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 9 - Modifications
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              {config.siteName || "L'institut"} se réserve le droit de modifier cette politique de confidentialité à tout moment.
              Les modifications entreront en vigueur dès leur publication sur le site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 10 - Contact
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter à :
              {config.email && <><br /><strong>Email :</strong> {config.email}</>}
              {config.phone && <><br /><strong>Téléphone :</strong> {config.phone}</>}
              {config.address && <><br /><strong>Adresse :</strong> {config.address}{config.postalCode && `, ${config.postalCode}`}{config.city && ` ${config.city}`}</>}
            </p>
          </section>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
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
