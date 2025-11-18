import Image from 'next/image'

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8 pb-6 border-b-2 border-purple-600">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image
              src="/logo-laia-connect.png"
              alt="LAIA Connect Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Accord de Traitement des Données (DPA)
          </h1>
          <p className="text-xl text-purple-600 font-semibold">Data Processing Agreement</p>
          <p className="text-sm text-gray-600 mt-2">
            Conforme au RGPD (Règlement UE 2016/679)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Bannière RGPD */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🔒</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                Protection des données garantie
              </h2>
              <p className="text-lg text-blue-800">
                LAIA Connect s'engage à traiter vos données en tant que <strong>sous-traitant RGPD</strong> conformément aux exigences les plus strictes.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Préambule */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Préambule</h2>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <p>
                Le présent Accord de Traitement des Données (ci-après le « <strong>DPA</strong> ») définit les obligations respectives
                de <strong>LAIA Connect</strong> (le « <strong>Sous-Traitant</strong> ») et de ses clients professionnels
                (le « <strong>Responsable de Traitement</strong> ») concernant le traitement des données à caractère personnel
                dans le cadre de l'utilisation de la plateforme SaaS LAIA Connect.
              </p>
              <p>
                Ce DPA fait partie intégrante des Conditions Générales de Vente et s'applique automatiquement dès la
                souscription d'un abonnement à LAIA Connect.
              </p>
              <p className="font-semibold text-purple-700">
                En utilisant LAIA Connect, vous bénéficiez automatiquement de cet accord sans démarche supplémentaire.
              </p>
            </div>
          </section>

          {/* Article 1 - Définitions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 1 - Définitions</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">« Données à caractère personnel » :</p>
                <p className="text-sm">
                  Toute information se rapportant à une personne physique identifiée ou identifiable (nom, prénom, email,
                  téléphone, adresse, historique de rendez-vous, etc.) traitée par le Responsable de Traitement via LAIA Connect.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">« Responsable de Traitement » :</p>
                <p className="text-sm">
                  Le client professionnel de LAIA Connect (institut de beauté, salon de coiffure, spa, etc.) qui détermine
                  les finalités et les moyens du traitement des données de ses propres clients.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">« Sous-Traitant » :</p>
                <p className="text-sm">
                  LAIA Connect, qui traite les données pour le compte du Responsable de Traitement conformément à ses instructions.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">« RGPD » :</p>
                <p className="text-sm">
                  Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection
                  des personnes physiques à l'égard du traitement des données à caractère personnel.
                </p>
              </div>
            </div>
          </section>

          {/* Article 2 - Objet et durée */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 2 - Objet et durée</h2>
            <p className="mb-3">
              Le présent DPA a pour objet de définir les conditions dans lesquelles LAIA Connect traite les données
              à caractère personnel pour le compte de ses clients professionnels.
            </p>
            <p className="font-semibold text-purple-700">
              Durée : Le présent DPA s'applique pendant toute la durée de l'abonnement à LAIA Connect et prend
              automatiquement fin à la résiliation de l'abonnement.
            </p>
          </section>

          {/* Article 3 - Nature des opérations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 3 - Nature des opérations de traitement
            </h2>
            <p className="mb-4">
              LAIA Connect traite les données à caractère personnel pour les finalités suivantes :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 bg-blue-50 p-6 rounded-lg">
              <li>Gestion des rendez-vous et réservations en ligne</li>
              <li>Gestion de la relation client (CRM)</li>
              <li>Gestion des programmes de fidélité</li>
              <li>Envoi de notifications et rappels automatisés (email, SMS, WhatsApp)</li>
              <li>Gestion des paiements et facturation</li>
              <li>Statistiques et analyses de performance</li>
              <li>Stockage sécurisé des données clients</li>
              <li>Gestion des avis clients</li>
            </ul>
          </section>

          {/* Article 4 - Catégories de données */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 4 - Catégories de données traitées
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Données d'identification</h3>
                <ul className="text-sm space-y-1">
                  <li>• Nom, prénom</li>
                  <li>• Email</li>
                  <li>• Numéro de téléphone</li>
                  <li>• Adresse postale</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Données de service</h3>
                <ul className="text-sm space-y-1">
                  <li>• Historique de rendez-vous</li>
                  <li>• Préférences de soins</li>
                  <li>• Notes et commentaires</li>
                  <li>• Programme de fidélité</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Données financières</h3>
                <ul className="text-sm space-y-1">
                  <li>• Historique des paiements</li>
                  <li>• Factures</li>
                  <li>• Mode de paiement</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Données de connexion</h3>
                <ul className="text-sm space-y-1">
                  <li>• Adresse IP</li>
                  <li>• Logs de connexion</li>
                  <li>• Cookies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 5 - Obligations du sous-traitant */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 5 - Obligations de LAIA Connect (Sous-Traitant)
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.1 - Traitement conforme aux instructions</h3>
                <p className="text-sm">
                  LAIA Connect s'engage à traiter les données uniquement sur instruction documentée du Responsable de Traitement
                  et conformément au RGPD.
                </p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.2 - Confidentialité</h3>
                <p className="text-sm">
                  LAIA Connect garantit que les personnes autorisées à traiter les données s'engagent à respecter la confidentialité
                  et ont reçu une formation appropriée en matière de protection des données.
                </p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.3 - Sécurité des données</h3>
                <p className="text-sm mb-2">
                  LAIA Connect met en œuvre les mesures techniques et organisationnelles appropriées :
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>✅ Chiffrement des données en transit (HTTPS/TLS)</li>
                  <li>✅ Chiffrement des données au repos</li>
                  <li>✅ Authentification forte (2FA disponible)</li>
                  <li>✅ Contrôle d'accès basé sur les rôles (RBAC)</li>
                  <li>✅ Sauvegardes automatiques quotidiennes</li>
                  <li>✅ Surveillance et logs d'activité</li>
                  <li>✅ Hébergement sécurisé (Vercel + Supabase)</li>
                  <li>✅ Tests de sécurité réguliers</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.4 - Assistance au Responsable de Traitement</h3>
                <p className="text-sm">
                  LAIA Connect assiste le Responsable de Traitement pour répondre aux demandes d'exercice des droits des personnes
                  concernées (accès, rectification, effacement, portabilité, limitation, opposition).
                </p>
              </div>
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">5.5 - Notification des violations</h3>
                <p className="text-sm">
                  En cas de violation de données, LAIA Connect notifie le Responsable de Traitement dans les <strong>72 heures</strong> suivant
                  la découverte de la violation.
                </p>
              </div>
            </div>
          </section>

          {/* Article 6 - Sous-traitance ultérieure */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 6 - Sous-traitance ultérieure
            </h2>
            <p className="mb-4">
              LAIA Connect peut faire appel à des sous-traitants pour traiter les données. Les sous-traitants actuels sont :
            </p>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔹</div>
                <div>
                  <p className="font-semibold">Supabase (Base de données)</p>
                  <p className="text-sm text-gray-600">Localisation : UE (Irlande) • Certifié ISO 27001, SOC 2 Type II</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔹</div>
                <div>
                  <p className="font-semibold">Vercel (Hébergement)</p>
                  <p className="text-sm text-gray-600">Localisation : UE • Conforme RGPD</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔹</div>
                <div>
                  <p className="font-semibold">Stripe (Paiements)</p>
                  <p className="text-sm text-gray-600">Certifié PCI-DSS Level 1 • Conforme RGPD</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔹</div>
                <div>
                  <p className="font-semibold">Resend (Emails transactionnels)</p>
                  <p className="text-sm text-gray-600">Conforme RGPD</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔹</div>
                <div>
                  <p className="font-semibold">Twilio (SMS et WhatsApp)</p>
                  <p className="text-sm text-gray-600">Certifié ISO 27001, SOC 2 • Conforme RGPD</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              LAIA Connect s'engage à informer le Responsable de Traitement de tout changement de sous-traitant ultérieur
              avec un préavis de 30 jours minimum.
            </p>
          </section>

          {/* Article 7 - Droits des personnes concernées */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 7 - Droits des personnes concernées
            </h2>
            <p className="mb-4">
              LAIA Connect met à disposition des outils permettant au Responsable de Traitement de répondre aux demandes
              d'exercice des droits suivants :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-semibold text-green-900 mb-2">✓ Droit d'accès</p>
                <p className="text-sm text-green-800">Export des données clients en un clic</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-semibold text-green-900 mb-2">✓ Droit de rectification</p>
                <p className="text-sm text-green-800">Modification directe dans l'interface</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-semibold text-green-900 mb-2">✓ Droit à l'effacement</p>
                <p className="text-sm text-green-800">Suppression complète des données</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-semibold text-green-900 mb-2">✓ Droit à la portabilité</p>
                <p className="text-sm text-green-800">Export au format CSV/JSON</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-semibold text-green-900 mb-2">✓ Droit d'opposition</p>
                <p className="text-sm text-green-800">Désactivation des notifications</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="font-semibold text-green-900 mb-2">✓ Droit à la limitation</p>
                <p className="text-sm text-green-800">Gel temporaire du traitement</p>
              </div>
            </div>
          </section>

          {/* Article 8 - Transfert hors UE */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 8 - Transferts de données hors Union Européenne
            </h2>
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
              <p className="font-semibold text-blue-900 mb-3">
                ✅ Toutes les données sont hébergées dans l'Union Européenne (datacenter Irlande)
              </p>
              <p className="text-sm text-blue-800">
                LAIA Connect garantit qu'aucun transfert de données hors UE n'est effectué sans garanties appropriées
                (clauses contractuelles types de la Commission européenne ou décision d'adéquation).
              </p>
            </div>
          </section>

          {/* Article 9 - Durée de conservation */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 9 - Durée de conservation et restitution des données
            </h2>
            <div className="space-y-4">
              <p>
                À la fin de la prestation (résiliation de l'abonnement), LAIA Connect s'engage à :
              </p>
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">1️⃣</div>
                  <p className="text-sm">
                    <strong>Restituer toutes les données</strong> au format CSV/JSON dans les 30 jours suivant la demande
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">2️⃣</div>
                  <p className="text-sm">
                    <strong>Supprimer définitivement</strong> toutes les données dans les 90 jours suivant la résiliation
                    (sauf obligation légale de conservation)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">3️⃣</div>
                  <p className="text-sm">
                    <strong>Fournir une attestation</strong> de destruction des données sur demande
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Article 10 - Audit et contrôle */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 10 - Audit et contrôle
            </h2>
            <p className="mb-3">
              Le Responsable de Traitement peut demander à LAIA Connect de fournir :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 bg-gray-50 p-6 rounded-lg">
              <li>Les preuves du respect des obligations RGPD</li>
              <li>Les certifications de sécurité des sous-traitants</li>
              <li>Les rapports d'audit de sécurité (dans la limite du raisonnable)</li>
              <li>Les logs d'accès aux données (sur demande justifiée)</li>
            </ul>
          </section>

          {/* Article 11 - Responsabilité */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Article 11 - Responsabilité
            </h2>
            <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-lg">
              <p className="font-semibold text-orange-900 mb-3">
                Répartition des responsabilités :
              </p>
              <div className="space-y-3 text-sm text-orange-800">
                <p>
                  <strong>Le Responsable de Traitement</strong> est responsable de :
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>La licéité de la collecte des données</li>
                  <li>L'information des personnes concernées</li>
                  <li>La définition des finalités du traitement</li>
                  <li>Le respect des durées de conservation</li>
                </ul>
                <p className="mt-3">
                  <strong>LAIA Connect (Sous-Traitant)</strong> est responsable de :
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>La sécurité technique de la plateforme</li>
                  <li>La conformité des traitements aux instructions</li>
                  <li>La notification des violations de données</li>
                  <li>L'assistance pour l'exercice des droits</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Article 12 - Contact DPO */}
          <section className="bg-purple-50 border-2 border-purple-200 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-purple-900 mb-4">
              Article 12 - Contact et questions
            </h2>
            <p className="text-purple-800 mb-4">
              Pour toute question relative au traitement des données ou à l'application du présent DPA :
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email :</strong> dpo@laiaconnect.fr</p>
              <p><strong>Adresse :</strong> LAIA Connect - Service RGPD, [Adresse à compléter]</p>
              <p><strong>Délégué à la Protection des Données (DPO) :</strong> [Nom à compléter]</p>
            </div>
            <p className="text-sm text-purple-700 mt-4">
              💡 Temps de réponse garanti : <strong>72 heures maximum</strong>
            </p>
          </section>

          {/* Signature */}
          <section className="border-t-2 border-gray-200 pt-8 mt-8">
            <p className="text-sm text-gray-600 text-center">
              Le présent DPA est automatiquement accepté dès la souscription d'un abonnement à LAIA Connect.
              <br />
              Il peut être consulté à tout moment sur cette page.
            </p>
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Version 1.0 - Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
