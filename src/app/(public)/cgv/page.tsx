export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Conditions Générales de Vente - LAIA Connect
        </h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre LAIA Connect (ci-après "le Prestataire") et toute personne physique ou morale (ci-après "le Client") souscrivant à l'un des abonnements proposés par LAIA Connect pour l'utilisation de la plateforme SaaS de gestion pour instituts de beauté.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description des services</h2>
            <p>
              LAIA Connect propose une solution SaaS comprenant :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Site web personnalisable pour l'institut</li>
              <li>Système de réservation en ligne</li>
              <li>Gestion des clients et rendez-vous</li>
              <li>Paiements en ligne via Stripe (0% commission)</li>
              <li>Programme de fidélité et parrainage</li>
              <li>Comptabilité et facturation automatique</li>
              <li>Statistiques et tableaux de bord</li>
              <li>Fonctionnalités additionnelles selon la formule choisie</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Formules d'abonnement</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Formule SOLO - 49€ HT/mois</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>1 utilisateur</li>
                  <li>1 emplacement</li>
                  <li>Site web complet + Réservation en ligne</li>
                  <li>Paiement Stripe + Programme fidélité</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Formule DUO - 69€ HT/mois</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tout de SOLO +</li>
                  <li>3 utilisateurs</li>
                  <li>Blog professionnel</li>
                  <li>CRM & Email Marketing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Formule TEAM - 119€ HT/mois</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tout de DUO +</li>
                  <li>10 utilisateurs, 3 emplacements</li>
                  <li>Boutique en ligne + Gestion stock</li>
                  <li>WhatsApp Business + SMS Marketing</li>
                  <li>Publications Instagram & Facebook</li>
                  <li>Nom de domaine personnalisé</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Formule PREMIUM - 179€ HT/mois</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tout de TEAM +</li>
                  <li>Utilisateurs et emplacements illimités</li>
                  <li>Publications TikTok</li>
                  <li>Support prioritaire</li>
                  <li>Account Manager dédié</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prix et modalités de paiement</h2>
            <p>
              Les prix sont indiqués en euros hors taxes (HT). La TVA applicable sera ajoutée au montant facturé.
            </p>
            <p className="mt-2">
              Le paiement s'effectue par prélèvement automatique SEPA mensuel. Le Client autorise le Prestataire à prélever mensuellement le montant de son abonnement sur le compte bancaire dont il a fourni les coordonnées.
            </p>
            <p className="mt-2">
              <strong>Période d'essai gratuite :</strong> Une période d'essai de 30 jours est offerte lors de la souscription initiale. Le premier prélèvement interviendra à l'issue de cette période.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Durée et résiliation</h2>
            <p>
              L'abonnement est conclu pour une durée indéterminée à compter de la date de souscription. Il se renouvelle automatiquement chaque mois par tacite reconduction.
            </p>
            <p className="mt-2">
              Le Client peut résilier son abonnement à tout moment, sans motif, avec un préavis de 30 jours. La résiliation prend effet au terme de la période d'abonnement en cours.
            </p>
            <p className="mt-2">
              Le Prestataire se réserve le droit de suspendre ou résilier l'accès au service en cas de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Non-paiement</li>
              <li>Utilisation frauduleuse ou abusive du service</li>
              <li>Violation des présentes CGV</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Obligations du Client</h2>
            <p>Le Client s'engage à :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion</li>
              <li>Utiliser le service conformément à sa destination</li>
              <li>Respecter la législation en vigueur</li>
              <li>S'acquitter des paiements dans les délais prévus</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Obligations du Prestataire</h2>
            <p>Le Prestataire s'engage à :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fournir un service conforme à la description</li>
              <li>Assurer la disponibilité du service 24/7 (sauf maintenance)</li>
              <li>Assurer la sécurité et la confidentialité des données</li>
              <li>Fournir une assistance technique par email</li>
              <li>Effectuer des sauvegardes régulières des données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Propriété intellectuelle</h2>
            <p>
              Le service LAIA Connect, son code source, sa structure, ses bases de données et tous les éléments qui le composent sont la propriété exclusive du Prestataire. Le Client dispose uniquement d'un droit d'utilisation non exclusif et non cessible.
            </p>
            <p className="mt-2">
              Les contenus créés par le Client (textes, images, logos) restent sa propriété exclusive.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Données personnelles</h2>
            <p>
              Le Prestataire s'engage à protéger les données personnelles du Client conformément au RGPD. Les données collectées sont uniquement utilisées pour la fourniture du service et ne sont jamais transmises à des tiers sans consentement.
            </p>
            <p className="mt-2">
              Le Client dispose d'un droit d'accès, de rectification et de suppression de ses données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation de responsabilité</h2>
            <p>
              Le Prestataire ne saurait être tenu responsable :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Des dommages indirects résultant de l'utilisation du service</li>
              <li>De la perte de données en cas de force majeure</li>
              <li>Des interruptions de service pour maintenance</li>
              <li>Du contenu publié par le Client</li>
            </ul>
            <p className="mt-2">
              En tout état de cause, la responsabilité du Prestataire est limitée au montant des sommes versées par le Client au cours des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Force majeure</h2>
            <p>
              Le Prestataire ne pourra être tenu responsable de tout retard ou inexécution de ses obligations résultant d'un cas de force majeure tel que défini par la jurisprudence française.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGV sont régies par le droit français. En cas de litige, et après recherche d'une solution amiable, compétence exclusive est attribuée aux tribunaux compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Modifications des CGV</h2>
            <p>
              Le Prestataire se réserve le droit de modifier les présentes CGV à tout moment. Les Clients seront informés par email de toute modification substantielle avec un préavis de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGV, le Client peut contacter le Prestataire :
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong>Email :</strong> contact@laiaconnect.fr</li>
              <li><strong>Adresse :</strong> LAIA Connect, [Adresse à compléter]</li>
            </ul>
          </section>

          <div className="border-t pt-6 mt-8 text-sm text-gray-600">
            <p>Date de dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            <p className="mt-2">Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
