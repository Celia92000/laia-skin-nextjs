export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8 pb-6 border-b-2 border-purple-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Conditions Générales de Vente
          </h1>
          <p className="text-xl text-purple-600 font-semibold">LAIA Connect</p>
          <p className="text-sm text-gray-600 mt-2">Plateforme SaaS de gestion pour instituts de beauté</p>
        </div>

        {/* Bannière Sans Engagement */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="text-5xl">✅</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                SANS ENGAGEMENT • SANS PRÉAVIS
              </h2>
              <p className="text-lg text-green-800">
                <strong>Résiliez quand vous voulez, sans frais, sans préavis.</strong>
              </p>
              <p className="text-sm text-green-700 mt-2">
                Comme Planity, nous croyons en la liberté totale. Votre abonnement prend fin à la date que vous choisissez, sans condition.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 1 - Définitions</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>« LAIA Connect »</strong> : Société éditrice et exploitante de la plateforme SaaS de gestion pour instituts de beauté.</p>
              <p><strong>« Client » ou « Abonné »</strong> : Toute personne physique ou morale ayant souscrit un abonnement à LAIA Connect.</p>
              <p><strong>« Plateforme » ou « Service »</strong> : Ensemble des fonctionnalités et services accessibles via LAIA Connect en mode SaaS.</p>
              <p><strong>« Abonnement »</strong> : Formule tarifaire mensuelle choisie par le Client (SOLO, DUO, TEAM ou PREMIUM).</p>
              <p><strong>« Espace Client »</strong> : Interface personnalisée accessible après authentification permettant la gestion complète de l'institut.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 2 - Objet et Acceptation</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent l'accès et l'utilisation de la plateforme LAIA Connect, solution SaaS (Software as a Service) destinée à la gestion complète d'instituts de beauté.
            </p>
            <p className="mt-3">
              <strong>L'acceptation des CGV est obligatoire</strong> pour souscrire un abonnement. En validant son inscription, le Client reconnaît avoir lu, compris et accepté sans réserve l'intégralité des présentes CGV.
            </p>
            <p className="mt-3">
              LAIA Connect se réserve le droit de modifier les présentes CGV à tout moment. Les Clients seront informés par email de toute modification substantielle avec un préavis de 30 jours calendaires. L'utilisation continue du Service après cette période vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 3 - Description du Service</h2>
            <p>
              LAIA Connect est une plateforme SaaS multi-tenant offrant aux instituts de beauté un ensemble complet d'outils de gestion en ligne :
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.1 - Fonctionnalités principales (toutes formules)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Site web personnalisable avec nom de domaine ou sous-domaine</li>
              <li>Système de réservation en ligne 24/7</li>
              <li>Gestion complète des clients et historique</li>
              <li>Calendrier et planning automatisé</li>
              <li>Paiements sécurisés via Stripe (sans commission LAIA)</li>
              <li>Programme de fidélité et parrainage</li>
              <li>Système d'avis clients connecté à Google Reviews</li>
              <li>Facturation et comptabilité automatiques</li>
              <li>Statistiques et tableaux de bord en temps réel</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">3.2 - Fonctionnalités avancées (selon formule)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Blog professionnel et création de contenu</li>
              <li>CRM avancé et prospection</li>
              <li>Email Marketing avec automations</li>
              <li>Boutique en ligne (produits et formations)</li>
              <li>Gestion de stock et inventaire</li>
              <li>WhatsApp Business et SMS Marketing</li>
              <li>Publications automatiques sur réseaux sociaux (Instagram, Facebook, TikTok)</li>
              <li>Multi-utilisateurs et multi-emplacements</li>
              <li>Rapports et statistiques avancés</li>
            </ul>

            <p className="mt-4 text-sm italic text-gray-600">
              La disponibilité de certaines fonctionnalités dépend de la formule d'abonnement souscrite. Le détail exact est consultable sur la page tarifaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 4 - Formules et Tarification</h2>

            <div className="space-y-4 mt-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800">SOLO - 49€ HT/mois</h3>
                <p className="text-sm">1 utilisateur • 1 emplacement • Fonctionnalités essentielles</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800">DUO - 69€ HT/mois</h3>
                <p className="text-sm">3 utilisateurs • Blog + CRM + Email Marketing</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800">TEAM - 119€ HT/mois</h3>
                <p className="text-sm">10 utilisateurs • 3 emplacements • Boutique + WhatsApp + Réseaux sociaux</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-800">PREMIUM - 179€ HT/mois</h3>
                <p className="text-sm">Illimité • Toutes fonctionnalités avancées</p>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm">
                <strong>Période d'essai gratuite :</strong> 30 jours offerts sur toute nouvelle souscription. Aucun prélèvement durant cette période. Résiliation possible à tout moment sans frais.
              </p>
            </div>

            <p className="mt-4">
              <strong>Tarifs exprimés en euros hors taxes (HT).</strong> La TVA au taux en vigueur (20% en France) sera ajoutée sur la facture.
            </p>
            <p className="mt-2">
              Les tarifs sont révisables annuellement avec un préavis de 60 jours. Les Clients existants bénéficient d'un maintien de tarif pendant 12 mois minimum.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 5 - Souscription et Activation</h2>
            <p>
              La souscription s'effectue en ligne sur le site www.laiaconnect.fr en suivant le processus d'inscription guidé. Le Client doit fournir :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Ses coordonnées complètes et exactes</li>
              <li>Les informations légales de son entreprise (SIRET obligatoire)</li>
              <li>Un mandat de prélèvement SEPA pour le paiement mensuel</li>
            </ul>
            <p className="mt-3">
              L'activation du compte est <strong>immédiate</strong> après validation du formulaire et mise en place du mandat SEPA. Le Client reçoit ses identifiants de connexion par email sous quelques minutes.
            </p>
            <p className="mt-3">
              Toute fausse déclaration ou information erronée peut entraîner la suspension ou la résiliation du compte sans préavis ni remboursement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 6 - Modalités de Paiement</h2>
            <p>
              Le paiement s'effectue exclusivement par <strong>prélèvement automatique SEPA mensuel</strong>. En souscrivant, le Client autorise LAIA Connect à prélever mensuellement le montant de son abonnement.
            </p>
            <p className="mt-3">
              <strong>Échéancier :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Jour 1 à 30 : Période d'essai gratuite (aucun prélèvement)</li>
              <li>Jour 31 : Premier prélèvement au tarif de la formule choisie</li>
              <li>Puis : Prélèvement récurrent le même jour chaque mois</li>
            </ul>
            <p className="mt-3">
              En cas de rejet de prélèvement, le Service sera suspendu automatiquement après 48h. Des frais de rejet bancaire (15€ HT) pourront être facturés. La réactivation nécessite la régularisation du paiement.
            </p>
            <p className="mt-3">
              Les factures sont envoyées par email et disponibles dans l'Espace Client. Elles sont conformes à la réglementation fiscale française.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 7 - Durée et Résiliation</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">7.1 - Durée</h3>
            <p>
              L'abonnement est souscrit pour une <strong>durée indéterminée</strong> avec reconduction tacite mensuelle. Il n'y a aucun engagement de durée minimum.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.2 - Résiliation par le Client</h3>
            <p>
              Le Client peut résilier son abonnement <strong>à tout moment, sans préavis et sans frais</strong>, depuis son Espace Client ou par email à contact@laiaconnect.fr.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Préavis :</strong> Aucun</li>
              <li><strong>Effet :</strong> La résiliation prend effet à la fin de la période de facturation en cours (pas de remboursement au prorata)</li>
              <li><strong>Accès :</strong> Le Client conserve l'accès au Service jusqu'à la fin de la période déjà payée</li>
              <li><strong>Remboursement :</strong> Aucun remboursement de la période en cours</li>
            </ul>
            <p className="mt-3 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
              💡 <strong>Exemple :</strong> Si vous résiliez le 15 janvier et que votre facturation mensuelle court du 1er au 31 janvier, vous conservez l'accès jusqu'au 31 janvier. Le prélèvement du 1er février n'aura pas lieu.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.3 - Résiliation par LAIA Connect</h3>
            <p>
              LAIA Connect se réserve le droit de suspendre ou résilier immédiatement l'accès au Service en cas de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Non-paiement après mise en demeure restée infructueuse (délai 15 jours)</li>
              <li>Utilisation contraire aux CGV ou à la législation en vigueur</li>
              <li>Activité frauduleuse ou atteinte à la sécurité de la Plateforme</li>
              <li>Propos injurieux envers l'équipe LAIA Connect</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">7.4 - Conséquences de la résiliation</h3>
            <p>
              À la date effective de résiliation :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>L'accès au Service est immédiatement désactivé</li>
              <li>Le site web du Client est mis hors ligne</li>
              <li>Les données sont conservées 30 jours puis supprimées définitivement</li>
              <li>Le Client dispose de 30 jours pour exporter ses données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 8 - Obligations de LAIA Connect</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">8.1 - Disponibilité</h3>
            <p>
              LAIA Connect s'engage à maintenir le Service accessible <strong>24h/24 et 7j/7</strong>, hors opérations de maintenance. Un taux de disponibilité de 99,5% est visé sur l'année.
            </p>
            <p className="mt-2 text-sm italic">
              Les maintenances programmées sont notifiées 72h à l'avance et planifiées de préférence la nuit (2h-6h).
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">8.2 - Sécurité et Confidentialité</h3>
            <p>
              LAIA Connect met en œuvre toutes les mesures techniques et organisationnelles nécessaires pour assurer :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>La protection des données contre tout accès non autorisé</li>
              <li>Le chiffrement des données sensibles (HTTPS, SSL/TLS)</li>
              <li>Des sauvegardes quotidiennes automatiques</li>
              <li>La conformité au RGPD (voir Article 14)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">8.3 - Support Technique</h3>
            <p>
              LAIA Connect met à disposition de tous ses Clients, quelle que soit la formule souscrite :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Support par email :</strong> Réponse sous 48h ouvrées maximum</li>
              <li><strong>Documentation complète :</strong> Centre d'aide en ligne accessible 24/7</li>
              <li><strong>Tutoriels vidéo :</strong> Guides pas à pas pour toutes les fonctionnalités</li>
              <li><strong>Base de connaissances :</strong> FAQ et articles détaillés</li>
            </ul>
            <p className="mt-3 text-sm italic text-gray-600">
              Tous les clients bénéficient du même niveau de support, sans distinction selon la formule d'abonnement.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">8.4 - Évolutions et Mises à Jour</h3>
            <p>
              LAIA Connect améliore continuellement sa Plateforme. Les mises à jour sont automatiques et gratuites, sans interruption de service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 9 - Obligations du Client</h2>
            <p>
              Le Client s'engage à :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Fournir des informations exactes et à jour</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion</li>
              <li>Ne pas partager son compte avec des tiers non autorisés</li>
              <li>Utiliser le Service conformément à sa destination professionnelle</li>
              <li>Respecter la législation en vigueur (RGPD, code de la consommation, etc.)</li>
              <li>Ne pas tenter d'accéder aux systèmes informatiques de LAIA Connect</li>
              <li>S'acquitter des paiements dans les délais prévus</li>
              <li>Effectuer des sauvegardes locales de ses données critiques</li>
            </ul>

            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm">
                <strong>Interdictions formelles :</strong> Reverse engineering, reproduction, revente ou sous-location du Service, utilisation abusive des ressources, spam, intrusion, collecte de données d'autres utilisateurs.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 10 - Propriété Intellectuelle</h2>
            <p>
              La Plateforme LAIA Connect, son code source, son architecture, ses bases de données, ses logos, ses marques et tous les éléments qui la composent sont et restent la <strong>propriété exclusive de LAIA Connect</strong>.
            </p>
            <p className="mt-3">
              Le Client dispose uniquement d'un <strong>droit d'usage personnel, non exclusif, non cessible et non transférable</strong> de la Plateforme, strictement limité à la durée de son abonnement et à l'usage professionnel de son institut.
            </p>
            <p className="mt-3">
              <strong>Contenus du Client :</strong> Les textes, images, logos, vidéos et autres contenus créés ou téléchargés par le Client restent sa propriété exclusive. Le Client accorde à LAIA Connect une licence d'utilisation limitée à l'hébergement et l'affichage sur son site web.
            </p>
            <p className="mt-3">
              Toute reproduction, représentation, modification, publication ou exploitation non autorisée de tout ou partie de la Plateforme est strictement interdite et constituerait une contrefaçon sanctionnée par le Code de la Propriété Intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 11 - Limitation de Responsabilité</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">11.1 - Responsabilité de LAIA Connect</h3>
            <p>
              LAIA Connect est tenu à une <strong>obligation de moyens</strong> concernant la fourniture du Service. Sa responsabilité ne saurait être engagée en cas de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Dommages indirects (perte de chiffre d'affaires, perte de clientèle, préjudice d'image)</li>
              <li>Mauvaise utilisation du Service par le Client</li>
              <li>Interruption due à un cas de force majeure</li>
              <li>Défaillance d'un fournisseur tiers (hébergeur, service de paiement, etc.)</li>
              <li>Acte malveillant d'un tiers (piratage, DDoS, etc.)</li>
              <li>Contenu publié par le Client ou par les clients finaux</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">11.2 - Plafonnement</h3>
            <p>
              En toute hypothèse, la responsabilité totale de LAIA Connect, tous dommages confondus, est strictement limitée au <strong>montant des sommes effectivement payées par le Client au cours des 12 derniers mois</strong> précédant le fait générateur.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">11.3 - Perte de Données</h3>
            <p>
              Bien que LAIA Connect effectue des sauvegardes quotidiennes, il est <strong>fortement recommandé au Client d'effectuer ses propres sauvegardes</strong> de ses données critiques. LAIA Connect ne pourra être tenu responsable d'une perte de données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 12 - Force Majeure</h2>
            <p>
              LAIA Connect ne saurait être tenu responsable de l'inexécution de ses obligations en cas de survenance d'un événement de force majeure tel que défini par la jurisprudence française, notamment :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Catastrophes naturelles</li>
              <li>Incendies, inondations</li>
              <li>Défaillance des réseaux de télécommunication</li>
              <li>Attaques informatiques majeures</li>
              <li>Grèves générales</li>
              <li>Décisions gouvernementales ou réglementaires</li>
            </ul>
            <p className="mt-3">
              En cas de force majeure, les obligations de LAIA Connect sont suspendues pour la durée de l'événement. Si la situation perdure plus de 30 jours, chaque partie peut résilier l'abonnement sans frais ni indemnité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 13 - Sous-Traitance</h2>
            <p>
              LAIA Connect se réserve le droit de sous-traiter tout ou partie des prestations nécessaires à la fourniture du Service, notamment :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Hébergement (serveurs cloud)</li>
              <li>Paiements (Stripe)</li>
              <li>Envoi d'emails transactionnels (Resend, Brevo)</li>
              <li>Stockage de médias (Cloudinary)</li>
            </ul>
            <p className="mt-3">
              Tous les sous-traitants sont sélectionnés pour leur fiabilité et leur conformité RGPD. LAIA Connect reste responsable de la bonne exécution du Service vis-à-vis du Client.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 14 - Données Personnelles et RGPD</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">14.1 - Responsable de traitement</h3>
            <p>
              LAIA Connect agit en tant que <strong>sous-traitant</strong> pour le traitement des données des clients finaux de l'institut (coordonnées, historique des réservations, etc.).
            </p>
            <p className="mt-2">
              Le Client (l'institut) est le <strong>responsable de traitement</strong> de ces données et doit se conformer au RGPD, notamment en informant ses clients et en obtenant leur consentement.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">14.2 - Données collectées par LAIA Connect</h3>
            <p>
              Pour la gestion de l'abonnement, LAIA Connect collecte et traite :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Informations d'identification (nom, prénom, email)</li>
              <li>Informations de l'entreprise (raison sociale, SIRET, adresse)</li>
              <li>Coordonnées bancaires (IBAN pour prélèvement SEPA)</li>
              <li>Données de connexion et logs (IP, date/heure)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">14.3 - Droits des personnes</h3>
            <p>
              Conformément au RGPD, le Client dispose des droits suivants :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Droit d'accès :</strong> Consulter ses données personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger ses données</li>
              <li><strong>Droit à l'effacement :</strong> Supprimer ses données (sauf obligation légale)</li>
              <li><strong>Droit à la portabilité :</strong> Récupérer ses données dans un format exploitable</li>
              <li><strong>Droit d'opposition :</strong> S'opposer au traitement</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits : <strong>contact@laiaconnect.fr</strong><br />
              Consultez notre <a href="/rgpd/politique-confidentialite" className="text-purple-600 hover:underline">Politique de Confidentialité complète</a>
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">14.4 - Conservation</h3>
            <p>
              Les données sont conservées pendant toute la durée de l'abonnement + 30 jours après résiliation (période de récupération). Les factures et documents comptables sont conservés 10 ans (obligation légale).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 15 - Modifications du Service</h2>
            <p>
              LAIA Connect se réserve le droit de faire évoluer le Service (ajout, modification ou suppression de fonctionnalités) afin de l'améliorer ou de respecter de nouvelles obligations légales.
            </p>
            <p className="mt-3">
              Les évolutions majeures susceptibles d'affecter l'utilisation du Service seront communiquées par email avec un préavis raisonnable. Le Client conserve son droit de résiliation s'il n'accepte pas les modifications.
            </p>
            <p className="mt-3">
              Les corrections de bugs, mises à jour de sécurité et améliorations mineures sont déployées sans préavis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 16 - Droit Applicable et Juridiction</h2>
            <p>
              Les présentes CGV sont régies par le <strong>droit français</strong>.
            </p>
            <p className="mt-3">
              En cas de litige relatif à l'interprétation ou à l'exécution des présentes CGV, les parties s'engagent à rechercher prioritairement une solution amiable.
            </p>
            <p className="mt-3">
              À défaut d'accord amiable dans un délai de 30 jours, compétence exclusive est attribuée aux <strong>tribunaux compétents du ressort du siège social de LAIA Connect</strong>, nonobstant pluralité de défendeurs ou appel en garantie.
            </p>

            <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm">
                <strong>Médiation :</strong> Conformément à l'article L.612-1 du Code de la consommation, le Client consommateur a le droit de recourir gratuitement à un médiateur de la consommation en cas de litige.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 17 - Dispositions Diverses</h2>

            <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-2">17.1 - Nullité partielle</h3>
            <p>
              Si une ou plusieurs stipulations des présentes CGV sont tenues pour non valides ou déclarées nulles, les autres stipulations garderont toute leur force et portée.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">17.2 - Non-renonciation</h3>
            <p>
              Le fait pour LAIA Connect de ne pas se prévaloir d'un manquement du Client à l'une des obligations des présentes CGV ne saurait être interprété comme une renonciation à se prévaloir ultérieurement de ce manquement.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">17.3 - Intégralité</h3>
            <p>
              Les présentes CGV constituent l'intégralité de l'accord entre les parties et annulent et remplacent tout accord, arrangement ou protocole antérieur, écrit ou oral, relatif au même objet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article 18 - Contact et Service Client</h2>
            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="mb-3"><strong>LAIA Connect</strong></p>
              <p className="mb-2">📧 Email : <a href="mailto:contact@laiaconnect.fr" className="text-purple-600 hover:underline">contact@laiaconnect.fr</a></p>
              <p className="mb-2">📞 Support technique : Depuis l'Espace Client</p>
              <p className="mb-2">📚 Centre d'aide : <a href="https://help.laiaconnect.fr" className="text-purple-600 hover:underline">help.laiaconnect.fr</a></p>
              <p className="mb-2">🌐 Site web : <a href="https://www.laiaconnect.fr" className="text-purple-600 hover:underline">www.laiaconnect.fr</a></p>
              <p className="text-sm text-gray-600 mt-4">
                Adresse postale : 65 rue de la Croix, 92000 Nanterre, France<br />
                SIREN : 988 691 937<br />
                SIRET : 988 691 937 00001 (à vérifier selon l'établissement)<br />
                N° TVA intracommunautaire : FR[XX] 988 691 937 (à calculer via INSEE)
              </p>
            </div>
          </section>

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
  )
}
