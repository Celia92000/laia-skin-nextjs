import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export default async function CGV() {
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
        <h1 className="text-4xl font-light  mb-8 tracking-wide uppercase text-center">
          Conditions Générales de Vente
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {config.termsAndConditions ? (
            <div className="prose prose-sm max-w-none">
              <div
                className="text-sm font-light leading-relaxed space-y-8"
                style={{ color: `${accentColor}B3` }}
                dangerouslySetInnerHTML={{ __html: config.termsAndConditions.replace(/\n\n/g, `</p><p class="text-sm font-light leading-relaxed" style="color: ${accentColor}B3">`).replace(/^/, `<p class="text-sm font-light leading-relaxed" style="color: ${accentColor}B3">`).replace(/$/, '</p>') }}
              />
            </div>
          ) : (
            <div className="space-y-8">
          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 1 - Objet
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Les présentes conditions générales de vente régissent les relations contractuelles entre
              {config.siteName || "l'institut"} et ses clients pour toute réservation de prestations de soins esthétiques
              effectuée sur le site ou directement à l'institut.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 2 - Prestations
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              {config.siteName || "L'institut"} propose des soins esthétiques du visage. Les descriptions des prestations
              sont disponibles sur le site internet et peuvent être complétées lors de la consultation.
              Les durées indiquées sont approximatives et peuvent varier selon les besoins spécifiques
              de chaque client.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 3 - Tarifs
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Les prix sont indiqués en euros TTC et sont susceptibles d'être modifiés sans préavis. 
              Les tarifs applicables sont ceux en vigueur au jour de la réservation. Les forfaits et 
              abonnements sont nominatifs et non cessibles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 4 - Réservation
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              La réservation peut s'effectuer en ligne via le site internet, par téléphone ou directement 
              à l'institut. Toute réservation est considérée comme ferme et définitive. Un acompte peut 
              être demandé pour certaines prestations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 5 - Annulation et modification
            </h2>
            <p className="text-sm font-light leading-relaxed mb-3" style={{ color: `${accentColor}B3` }}>
              Les conditions d'annulation et de modification sont les suivantes :
            </p>
            <ul className="text-sm font-light space-y-2 ml-6 list-disc" style={{ color: `${accentColor}B3` }}>
              <li>Annulation gratuite jusqu'à 24 heures avant le rendez-vous</li>
              <li>Annulation dans les 24 heures : 50% du montant de la prestation sera dû</li>
              <li>Non-présentation au rendez-vous : 100% du montant sera dû</li>
              <li>Les modifications sont possibles sous réserve de disponibilité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 6 - Paiement
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Le règlement s'effectue immédiatement après la prestation. Les moyens de paiement acceptés 
              sont : espèces, carte bancaire, et virement pour les forfaits. Les forfaits sont payables 
              à la première séance. Les abonnements sont prélevés mensuellement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 7 - Forfaits et abonnements
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Les forfaits de 4 séances sont valables 3 mois à compter de la date d'achat. Les abonnements 
              mensuels sont reconduits tacitement sauf résiliation avec un préavis de 30 jours. Les séances 
              non utilisées ne sont ni remboursables ni reportables au-delà de la période de validité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 8 - Contre-indications
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Le client s'engage à informer l'institut de tout problème de santé, allergie, traitement
              médicamenteux ou état particulier (grossesse, etc.) pouvant constituer une contre-indication
              aux soins. {config.siteName || "L'institut"} se réserve le droit de refuser ou d'adapter une prestation
              en cas de contre-indication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 9 - Responsabilité
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              {config.siteName || "L'institut"} s'engage à mettre en œuvre tous les moyens pour assurer la qualité
              et la sécurité des prestations. L'institut ne pourra être tenu responsable des réactions
              allergiques non signalées ou des résultats non conformes aux attentes subjectives du client.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 10 - Hygiène et sécurité
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              L'institut respecte strictement les normes d'hygiène et de sécurité en vigueur. Le matériel 
              est désinfecté ou à usage unique. Le client s'engage à respecter les consignes d'hygiène 
              et de sécurité de l'institut.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 11 - Mineurs
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Les mineurs doivent être accompagnés d'un parent ou tuteur légal pour toute prestation. 
              Une autorisation parentale écrite est requise pour les mineurs de plus de 16 ans non accompagnés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 12 - Réclamations
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Toute réclamation doit être formulée dans les 48 heures suivant la prestation. Les réclamations
              peuvent être adressées par email à {config.email || "contact@institut.fr"} ou directement à l'institut.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 13 - Droit de rétractation
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne 
              s'applique pas aux prestations de services pleinement exécutées avant la fin du délai de 
              rétractation et dont l'exécution a commencé avec l'accord préalable exprès du consommateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 14 - Propriété intellectuelle
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              Tous les éléments du site internet de {config.siteName || "l'institut"} (textes, images, vidéos) sont
              protégés par le droit d'auteur. Toute reproduction sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 15 - Litiges
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. 
              À défaut, les tribunaux français seront seuls compétents. Le client peut recourir à 
              une médiation conventionnelle ou à tout autre mode alternatif de règlement des différends.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-4 uppercase tracking-wide" style={{ color: accentColor }}>
              Article 16 - Modification des CGV
            </h2>
            <p className="text-sm font-light leading-relaxed" style={{ color: `${accentColor}B3` }}>
              {config.siteName || "L'institut"} se réserve le droit de modifier les présentes CGV à tout moment.
              Les nouvelles conditions s'appliqueront aux réservations effectuées postérieurement
              à leur mise en ligne.
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