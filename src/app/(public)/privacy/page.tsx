export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            LAIA Connect, accessible via le site <strong>laiaconnect.fr</strong>, attache une grande importance à la protection
            de vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons,
            utilisons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données
            (RGPD).
          </p>
        </section>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Données collectées */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Données collectées
            </h2>
            <p className="text-gray-700 mb-3">
              Nous collectons les informations suivantes lors de votre inscription et utilisation de LAIA Connect :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Informations d'identification</strong> : Nom, prénom, email, téléphone</li>
              <li><strong>Informations professionnelles</strong> : Nom de votre institut, ville, adresse professionnelle</li>
              <li><strong>Informations de compte</strong> : Mot de passe crypté, préférences de notification</li>
              <li><strong>Données clients</strong> (si vous utilisez notre CRM) : Nom, email, téléphone, historique de rendez-vous</li>
              <li><strong>Données de paiement</strong> : Informations bancaires (IBAN) pour le prélèvement SEPA</li>
              <li><strong>Données de navigation</strong> : Cookies, adresse IP, pages visitées</li>
            </ul>
          </section>

          {/* 2. Utilisation des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Utilisation des données
            </h2>
            <p className="text-gray-700 mb-3">
              Vos données personnelles sont utilisées pour :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Créer et gérer votre compte LAIA Connect</li>
              <li>Fournir les services de la plateforme (réservations, CRM, site web, etc.)</li>
              <li>Traiter vos paiements mensuels par prélèvement SEPA</li>
              <li>Vous envoyer des notifications importantes (confirmations, rappels, factures)</li>
              <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
              <li>Vous informer des mises à jour et nouvelles fonctionnalités (avec votre consentement)</li>
              <li>Assurer la sécurité et prévenir les fraudes</li>
            </ul>
          </section>

          {/* 3. Base légale */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Base légale du traitement
            </h2>
            <p className="text-gray-700">
              Le traitement de vos données personnelles repose sur :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li><strong>Exécution du contrat</strong> : Pour fournir les services auxquels vous avez souscrit</li>
              <li><strong>Obligation légale</strong> : Pour respecter nos obligations fiscales et comptables</li>
              <li><strong>Consentement</strong> : Pour l'envoi de communications marketing (révocable à tout moment)</li>
              <li><strong>Intérêt légitime</strong> : Pour améliorer nos services et assurer la sécurité</li>
            </ul>
          </section>

          {/* 4. Partage des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Partage et transfert des données
            </h2>
            <p className="text-gray-700 mb-3">
              Nous ne vendons ni ne louons vos données personnelles. Vos données peuvent être partagées avec :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Hébergeur</strong> : Supabase (infrastructure sécurisée en Europe)</li>
              <li><strong>Processeur de paiement</strong> : Stripe (pour les prélèvements SEPA)</li>
              <li><strong>Service d'emailing</strong> : Brevo (pour l'envoi d'emails transactionnels)</li>
              <li><strong>Sous-traitants techniques</strong> : Uniquement dans le cadre de la fourniture du service</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Tous nos sous-traitants sont situés dans l'Union Européenne et respectent le RGPD.
            </p>
          </section>

          {/* 5. Conservation des données */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Durée de conservation
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Données de compte</strong> : Conservées pendant toute la durée de votre abonnement + 3 ans après résiliation</li>
              <li><strong>Données de facturation</strong> : 10 ans (obligation légale)</li>
              <li><strong>Données clients (CRM)</strong> : Tant que votre compte est actif, supprimées 30 jours après résiliation</li>
              <li><strong>Cookies</strong> : 13 mois maximum</li>
            </ul>
          </section>

          {/* 6. Vos droits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Vos droits RGPD
            </h2>
            <p className="text-gray-700 mb-3">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Droit d'accès</strong> : Obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification</strong> : Corriger vos données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement</strong> : Demander la suppression de vos données (sous conditions)</li>
              <li><strong>Droit à la limitation</strong> : Limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité</strong> : Recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : Vous opposer au traitement de vos données (marketing notamment)</li>
              <li><strong>Droit de retirer votre consentement</strong> : À tout moment pour les traitements basés sur le consentement</li>
            </ul>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 font-semibold mb-2">
                📧 Pour exercer vos droits :
              </p>
              <p className="text-blue-800 text-sm">
                Envoyez un email à <strong>contact@laiaconnect.fr</strong> avec la mention "Exercice de mes droits RGPD"
                en précisant votre demande et en joignant une copie de votre pièce d'identité.
              </p>
              <p className="text-blue-800 text-sm mt-2">
                Nous nous engageons à répondre sous 1 mois maximum.
              </p>
            </div>
          </section>

          {/* 7. Sécurité */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Sécurité des données
            </h2>
            <p className="text-gray-700 mb-3">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Cryptage SSL/TLS pour toutes les communications</li>
              <li>Mots de passe cryptés avec bcrypt</li>
              <li>Hébergement sécurisé ISO 27001</li>
              <li>Sauvegardes quotidiennes automatiques</li>
              <li>Accès limité aux données (principe du moindre privilège)</li>
              <li>Surveillance continue et détection des intrusions</li>
            </ul>
          </section>

          {/* 8. Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Cookies et traceurs
            </h2>
            <p className="text-gray-700 mb-3">
              Nous utilisons les cookies suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Cookies essentiels</strong> : Nécessaires au fonctionnement du site (session, authentification)</li>
              <li><strong>Cookies de performance</strong> : Mesurer l'audience et améliorer l'expérience utilisateur</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels.
            </p>
          </section>

          {/* 9. Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Modifications de cette politique
            </h2>
            <p className="text-gray-700">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
              Toute modification sera publiée sur cette page avec mise à jour de la date.
              Les modifications importantes vous seront notifiées par email.
            </p>
          </section>

          {/* 10. Contact DPO */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Contact et réclamations
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                <strong>Délégué à la Protection des Données (DPO)</strong>
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>📧 Email : <strong>dpo@laiaconnect.fr</strong></li>
                <li>📬 Adresse : LAIA Connect - Service DPO, [Adresse complète]</li>
                <li>📞 Téléphone : [Numéro]</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-gray-700 text-sm">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de :
                </p>
                <p className="text-gray-900 font-semibold mt-2">
                  CNIL (Commission Nationale de l'Informatique et des Libertés)
                </p>
                <p className="text-gray-700 text-sm">
                  3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07
                </p>
                <p className="text-gray-700 text-sm">
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} LAIA Connect - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}
