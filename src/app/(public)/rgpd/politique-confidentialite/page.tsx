export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8 pb-6 border-b-2 border-purple-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Politique de Confidentialité
          </h1>
          <p className="text-xl text-purple-600 font-semibold">LAIA Connect</p>
          <p className="text-sm text-gray-600 mt-2">Conforme au RGPD (Règlement UE 2016/679)</p>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed">

          {/* Préambule */}
          <section className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="font-semibold text-blue-900 mb-2">Engagement de LAIA Connect</p>
            <p className="text-sm">
              LAIA Connect accorde une importance particulière à la protection de vos données personnelles
              et s'engage à les traiter de manière transparente, sécurisée et conforme au Règlement Général
              sur la Protection des Données (RGPD).
            </p>
          </section>

          {/* Article 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Identité du Responsable de Traitement</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Raison sociale :</strong> LAIA Connect</p>
              <p><strong>Adresse :</strong> 65 rue de la Croix, 92000 Nanterre, France</p>
              <p><strong>Email :</strong> <a href="mailto:contact@laiaconnect.fr" className="text-purple-600 hover:underline">contact@laiaconnect.fr</a></p>
              <p><strong>SIREN :</strong> 988 691 937</p>
              <p><strong>SIRET :</strong> 988 691 937 00001 (à vérifier selon l'établissement)</p>
              <p><strong>Délégué à la Protection des Données (DPO) :</strong> <a href="mailto:dpo@laiaconnect.fr" className="text-purple-600 hover:underline">dpo@laiaconnect.fr</a></p>
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Données Collectées et Finalités</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.1 - Données des Abonnés (Instituts)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Données collectées</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Finalités</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Base juridique</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Identité (nom, prénom, email)</td>
                    <td className="border border-gray-300 px-4 py-2">Gestion du compte, authentification</td>
                    <td className="border border-gray-300 px-4 py-2">Exécution du contrat</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Entreprise (raison sociale, SIRET, adresse)</td>
                    <td className="border border-gray-300 px-4 py-2">Facturation, conformité légale</td>
                    <td className="border border-gray-300 px-4 py-2">Obligation légale</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Coordonnées bancaires (IBAN)</td>
                    <td className="border border-gray-300 px-4 py-2">Prélèvement SEPA, encaissement</td>
                    <td className="border border-gray-300 px-4 py-2">Exécution du contrat</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Données de connexion (IP, logs)</td>
                    <td className="border border-gray-300 px-4 py-2">Sécurité, prévention fraude</td>
                    <td className="border border-gray-300 px-4 py-2">Intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Données d'utilisation</td>
                    <td className="border border-gray-300 px-4 py-2">Amélioration du service, support</td>
                    <td className="border border-gray-300 px-4 py-2">Intérêt légitime</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.2 - Données des Clients Finaux (Clients des Instituts)</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3">
              <p className="text-sm">
                <strong>⚠️ Important :</strong> LAIA Connect agit en tant que <strong>sous-traitant</strong> pour
                le traitement des données des clients finaux. <strong>L'institut (notre abonné) est le responsable
                de traitement</strong> et doit informer ses clients conformément au RGPD.
              </p>
            </div>
            <p className="mt-3">
              Les données traitées comprennent : nom, prénom, email, téléphone, historique de réservations,
              notes, communications, programme de fidélité. Ces données sont traitées sur instruction de l'institut
              pour la gestion de sa relation client.
            </p>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Destinataires des Données</h2>
            <p>Vos données personnelles sont accessibles uniquement :</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Aux équipes internes de LAIA Connect (support technique, comptabilité)</li>
              <li>À nos sous-traitants techniques conformes RGPD :
                <ul className="list-circle pl-6 mt-1 text-sm">
                  <li><strong>Supabase</strong> : Hébergement base de données (UE)</li>
                  <li><strong>Vercel</strong> : Hébergement applicatif (UE)</li>
                  <li><strong>Stripe</strong> : Traitement des paiements (certifié PCI-DSS)</li>
                  <li><strong>Resend / Brevo</strong> : Envoi d'emails transactionnels (UE)</li>
                  <li><strong>Cloudinary</strong> : Stockage de médias (UE)</li>
                </ul>
              </li>
              <li>Aux autorités légales sur réquisition judiciaire uniquement</li>
            </ul>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
              <p className="text-sm">
                ✅ Tous nos sous-traitants sont soigneusement sélectionnés et ont signé des clauses
                contractuelles de protection des données conformes au RGPD.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Durée de Conservation</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Type de données</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Données de compte actif</td>
                    <td className="border border-gray-300 px-4 py-2">Pendant toute la durée de l'abonnement</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Données après résiliation</td>
                    <td className="border border-gray-300 px-4 py-2">30 jours (période de récupération) puis suppression définitive</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Factures et documents comptables</td>
                    <td className="border border-gray-300 px-4 py-2">10 ans (obligation légale fiscale)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">Logs de connexion</td>
                    <td className="border border-gray-300 px-4 py-2">12 mois maximum</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Données clients finaux (institut)</td>
                    <td className="border border-gray-300 px-4 py-2">Selon la politique définie par l'institut</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Vos Droits sur vos Données</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">🔍 Droit d'accès</h4>
                <p className="text-sm">Obtenir une copie de vos données personnelles traitées par LAIA Connect.</p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">✏️ Droit de rectification</h4>
                <p className="text-sm">Corriger ou mettre à jour vos données inexactes ou incomplètes.</p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">🗑️ Droit à l'effacement</h4>
                <p className="text-sm">Demander la suppression de vos données (sauf obligations légales de conservation).</p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">📦 Droit à la portabilité</h4>
                <p className="text-sm">Récupérer vos données dans un format structuré et exploitable (JSON, CSV).</p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">🚫 Droit d'opposition</h4>
                <p className="text-sm">S'opposer au traitement de vos données pour des motifs légitimes.</p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-600 mb-2">⏸️ Droit à la limitation</h4>
                <p className="text-sm">Demander la limitation temporaire du traitement de vos données.</p>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mt-6">
              <p className="font-semibold mb-2">📧 Comment exercer vos droits ?</p>
              <p className="text-sm">
                Envoyez votre demande par email à <strong>dpo@laiaconnect.fr</strong> ou
                <strong> contact@laiaconnect.fr</strong> en précisant :
              </p>
              <ul className="list-disc pl-6 text-sm mt-2">
                <li>Votre identité (nom, email de compte)</li>
                <li>Le droit que vous souhaitez exercer</li>
                <li>Une copie de votre pièce d'identité (si nécessaire pour vérification)</li>
              </ul>
              <p className="text-sm mt-2">
                <strong>Délai de réponse :</strong> 1 mois maximum à compter de la réception de votre demande.
              </p>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Sécurité des Données</h2>
            <p>
              LAIA Connect met en œuvre des mesures techniques et organisationnelles robustes pour protéger
              vos données contre tout accès non autorisé, perte, divulgation ou destruction :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Chiffrement :</strong> Toutes les communications sont sécurisées via HTTPS/TLS. Les données sensibles sont chiffrées au repos.</li>
              <li><strong>Authentification :</strong> Accès protégé par mot de passe fort, possibilité de 2FA (authentification à deux facteurs).</li>
              <li><strong>Sauvegardes :</strong> Sauvegardes quotidiennes automatiques, réplication des données sur plusieurs zones géographiques.</li>
              <li><strong>Surveillance :</strong> Monitoring 24/7, détection d'intrusion, journalisation des accès.</li>
              <li><strong>Isolation :</strong> Architecture multi-tenant avec séparation stricte des données par organisation.</li>
              <li><strong>Mises à jour :</strong> Correctifs de sécurité appliqués régulièrement.</li>
              <li><strong>Formation :</strong> Nos équipes sont formées aux bonnes pratiques de sécurité et confidentialité.</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
              <p className="text-sm">
                🔒 En cas de violation de données susceptible d'engendrer un risque élevé pour vos droits et libertés,
                nous nous engageons à vous notifier dans les <strong>72 heures</strong> conformément au RGPD.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies et Traceurs</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">7.1 - Cookies strictement nécessaires</h3>
            <p>Ces cookies sont indispensables au fonctionnement de la plateforme (authentification, sécurité). Ils ne nécessitent pas de consentement.</p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li><strong>token</strong> : Jeton d'authentification (validité : session)</li>
              <li><strong>organizationId</strong> : Identifiant de l'organisation (validité : session)</li>
              <li><strong>csrf_token</strong> : Protection contre les attaques CSRF (validité : session)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.2 - Cookies analytiques (avec consentement)</h3>
            <p>Ces cookies nous permettent d'analyser l'utilisation de la plateforme pour l'améliorer. Vous pouvez les refuser.</p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li><strong>Google Analytics</strong> : Statistiques de fréquentation (anonymisé)</li>
              <li><strong>Hotjar</strong> : Analyse comportementale (heatmaps, enregistrements anonymisés)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.3 - Gestion de vos préférences</h3>
            <p>Vous pouvez à tout moment :</p>
            <ul className="list-disc pl-6 mt-2 text-sm">
              <li>Modifier vos préférences via le bandeau cookies</li>
              <li>Supprimer les cookies depuis les paramètres de votre navigateur</li>
              <li>Activer le mode "Do Not Track" de votre navigateur</li>
            </ul>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Transferts de Données hors UE</h2>
            <p>
              LAIA Connect privilégie des hébergeurs et sous-traitants basés dans l'Union Européenne. Toutefois,
              certains services peuvent impliquer des transferts vers des pays tiers :
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li><strong>Stripe :</strong> USA (garanties : clauses contractuelles types, certification)</li>
              <li><strong>Vercel (hébergement) :</strong> USA/UE (garanties : Privacy Shield successeur, clauses types)</li>
            </ul>
            <p className="mt-3">
              Ces transferts sont encadrés par les mécanismes prévus par le RGPD (articles 44 à 50) : clauses
              contractuelles types de la Commission européenne, certifications, décisions d'adéquation.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Mineurs</h2>
            <p>
              LAIA Connect est un service destiné aux <strong>professionnels</strong> (instituts de beauté).
              Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas
              sciemment de données de mineurs.
            </p>
            <p className="mt-2">
              Si vous êtes parent ou tuteur légal et que vous constatez que votre enfant nous a fourni des données
              personnelles, contactez-nous immédiatement pour suppression.
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications de la Politique</h2>
            <p>
              LAIA Connect se réserve le droit de modifier cette Politique de Confidentialité à tout moment
              pour refléter les évolutions légales, réglementaires ou de nos pratiques.
            </p>
            <p className="mt-2">
              En cas de modification substantielle, vous serez informé par email avec un préavis de <strong>30 jours</strong>.
              La date de dernière mise à jour est indiquée en bas de page.
            </p>
            <p className="mt-2">
              Nous vous invitons à consulter régulièrement cette page pour rester informé.
            </p>
          </section>

          {/* Article 11 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Réclamation auprès de la CNIL</h2>
            <p>
              Si vous estimez que LAIA Connect ne respecte pas ses obligations en matière de protection des données,
              vous avez le droit d'introduire une réclamation auprès de la <strong>Commission Nationale de l'Informatique
              et des Libertés (CNIL)</strong> :
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p><strong>CNIL</strong></p>
              <p>3 Place de Fontenoy - TSA 80715</p>
              <p>75334 Paris Cedex 07</p>
              <p>Téléphone : 01 53 73 22 22</p>
              <p>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">www.cnil.fr</a></p>
              <p className="mt-2 text-sm">Formulaire de plainte en ligne : <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">www.cnil.fr/fr/plaintes</a></p>
            </div>
            <p className="mt-3 text-sm italic text-gray-600">
              Nous vous encourageons néanmoins à nous contacter en priorité afin que nous puissions traiter votre demande directement.
            </p>
          </section>

          {/* Article 12 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact</h2>
            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="mb-3"><strong>LAIA Connect</strong></p>
              <p className="mb-2">📧 <strong>DPO / Questions confidentialité :</strong> <a href="mailto:dpo@laiaconnect.fr" className="text-purple-600 hover:underline">dpo@laiaconnect.fr</a></p>
              <p className="mb-2">📧 <strong>Contact général :</strong> <a href="mailto:contact@laiaconnect.fr" className="text-purple-600 hover:underline">contact@laiaconnect.fr</a></p>
              <p className="mb-2">🌐 <strong>Site web :</strong> <a href="https://www.laiaconnect.fr" className="text-purple-600 hover:underline">www.laiaconnect.fr</a></p>
              <p className="text-sm text-gray-600 mt-4">
                Adresse postale : 65 rue de la Croix, 92000 Nanterre, France<br />
                SIREN : 988 691 937<br />
                SIRET : 988 691 937 00001 (à vérifier selon l'établissement)
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t-2 border-gray-300 pt-6 mt-8 text-center">
            <p className="text-sm text-gray-600">
              <strong>Date de dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Version 1.0
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © {new Date().getFullYear()} LAIA Connect - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
