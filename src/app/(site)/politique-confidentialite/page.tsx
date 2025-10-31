export default function PolitiqueConfidentialite() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Politique de confidentialité</h1>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <p className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              LAIA Platform, exploité par Laia Skin Institut, s'engage à protéger la vie privée de ses utilisateurs.
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
            <p>Nous collectons les informations suivantes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informations d'identification :</strong> Nom, prénom, email, téléphone</li>
              <li><strong>Informations professionnelles :</strong> Nom de l'institut, SIRET, adresse</li>
              <li><strong>Données de paiement :</strong> Gérées par Stripe (nous ne stockons pas les données bancaires)</li>
              <li><strong>Données d'utilisation :</strong> Logs de connexion, analytics, statistiques d'utilisation</li>
              <li><strong>Données des clientes :</strong> Informations des clientes de nos instituts partenaires (réservations, historique)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fournir nos services de gestion d'institut</li>
              <li>Traiter les paiements via Stripe Connect</li>
              <li>Envoyer des notifications et communications importantes</li>
              <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Partage des données</h2>
            <p>Nous partageons vos données uniquement avec :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe :</strong> Pour le traitement des paiements (conforme PCI-DSS)</li>
              <li><strong>Vercel :</strong> Hébergement de la plateforme (serveurs sécurisés)</li>
              <li><strong>Supabase :</strong> Base de données (chiffrée et sécurisée)</li>
              <li><strong>Resend :</strong> Envoi d'emails transactionnels</li>
            </ul>
            <p className="mt-4">Nous ne vendons jamais vos données à des tiers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sécurité des données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité robustes :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Chiffrement des données sensibles en base de données</li>
              <li>Authentification sécurisée avec tokens JWT</li>
              <li>Sauvegardes automatiques quotidiennes</li>
              <li>Conformité PCI-DSS via Stripe pour les paiements</li>
              <li>Accès restreint aux données (principe du moindre privilège)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> Supprimer vos données ("droit à l'oubli")</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format exploitable</li>
              <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
              <li><strong>Droit à la limitation :</strong> Limiter le traitement de vos données</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à : <a href="mailto:privacy@laiaskin.com" className="text-blue-600 hover:underline">privacy@laiaskin.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Conservation des données</h2>
            <p>Nous conservons vos données :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Pendant toute la durée de votre abonnement</li>
              <li>3 ans après la fin de votre abonnement (obligations comptables)</li>
              <li>Les données de paiement sont conservées par Stripe selon leur politique</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
            <p>Nous utilisons des cookies pour :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintenir votre session de connexion</li>
              <li>Mémoriser vos préférences</li>
              <li>Analyser l'utilisation de la plateforme (analytics anonymisés)</li>
            </ul>
            <p className="mt-4">Vous pouvez désactiver les cookies dans votre navigateur.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité.
              Toute modification sera notifiée par email et sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p>Pour toute question concernant cette politique de confidentialité :</p>
            <ul className="list-none space-y-2 mt-4">
              <li><strong>Email :</strong> privacy@laiaskin.com</li>
              <li><strong>Adresse :</strong> [Ton adresse professionnelle]</li>
              <li><strong>DPO :</strong> [Si tu as un délégué à la protection des données]</li>
            </ul>
          </section>

          <section className="border-t pt-8 mt-8">
            <p className="text-sm text-gray-500">
              <strong>Responsable du traitement :</strong> Laia Skin Institut<br/>
              <strong>SIRET :</strong> [Ton SIRET]<br/>
              <strong>Hébergeur :</strong> Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
