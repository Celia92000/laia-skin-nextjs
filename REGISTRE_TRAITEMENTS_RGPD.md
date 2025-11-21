# Registre des Traitements de Données Personnelles
## LAIA Connect - Conforme RGPD (Article 30)

**Responsable de traitement** : LAIA Connect
**Adresse** : 65 rue de la Croix, 92000 Nanterre, France
**SIREN** : 988 691 937
**Contact DPO** : dpo@laiaconnect.fr
**Date de dernière mise à jour** : 2025-01-12

---

## 📋 TABLE DES MATIÈRES

1. [Gestion des abonnements clients (Instituts)](#traitement-1)
2. [Authentification et gestion des sessions](#traitement-2)
3. [Facturation et comptabilité](#traitement-3)
4. [Support client et assistance technique](#traitement-4)
5. [Hébergement des sites web clients](#traitement-5)
6. [Traitement des paiements (Stripe)](#traitement-6)
7. [Envoi d'emails transactionnels](#traitement-7)
8. [Statistiques et analytics](#traitement-8)
9. [Sécurité et prévention de la fraude](#traitement-9)
10. [Sauvegarde et restauration](#traitement-10)

---

<a name="traitement-1"></a>
## TRAITEMENT N°1 : Gestion des Abonnements Clients (Instituts)

### 📌 Finalité
Gestion complète des abonnements à la plateforme LAIA Connect (création compte, facturation, support).

### 🔐 Base juridique
- **Exécution du contrat** (abonnement SaaS)
- **Obligation légale** (facturation, comptabilité)

### 🏢 Responsable de traitement
LAIA Connect

### 👥 Catégories de personnes concernées
- Propriétaires d'instituts de beauté (abonnés)
- Gérants et co-gérants
- Employés avec accès admin

### 📊 Catégories de données
- **Identité** : nom, prénom, email, téléphone
- **Entreprise** : raison sociale, SIRET, adresse, TVA
- **Coordonnées bancaires** : IBAN (pour prélèvement SEPA)
- **Connexion** : IP, logs, historique de navigation
- **Abonnement** : formule choisie, date de souscription, statut

### 🔄 Sources des données
- Formulaire d'inscription en ligne
- Modifications via Espace Client
- Données techniques collectées automatiquement

### 🤝 Destinataires
- **Internes** : Équipes LAIA Connect (support, comptabilité)
- **Externes** :
  - **Supabase** : Hébergement BDD (UE)
  - **Vercel** : Hébergement applicatif (UE/USA avec clauses types)
  - **Stripe** : Traitement paiements (USA, certifié PCI-DSS)
  - **Resend / Brevo** : Envoi emails (UE)

### 🌍 Transferts hors UE
- **Stripe** (USA) : Clauses contractuelles types Commission UE
- **Vercel** (USA) : Clauses contractuelles types Commission UE

### ⏱️ Durée de conservation
- **Compte actif** : Pendant toute la durée de l'abonnement
- **Après résiliation** : 30 jours (période de récupération) puis suppression
- **Factures** : 10 ans (obligation légale fiscale)
- **Logs** : 12 mois maximum

### 🔒 Mesures de sécurité
- Chiffrement HTTPS/TLS
- Authentification JWT avec expiration
- Hachage bcrypt des mots de passe
- Sauvegardes quotidiennes automatiques
- Architecture multi-tenant isolée (organizationId)
- Monitoring 24/7

---

<a name="traitement-2"></a>
## TRAITEMENT N°2 : Authentification et Gestion des Sessions

### 📌 Finalité
Permettre aux utilisateurs de se connecter de manière sécurisée à la plateforme.

### 🔐 Base juridique
- **Exécution du contrat**
- **Intérêt légitime** (sécurité)

### 👥 Catégories de personnes concernées
Tous les utilisateurs de la plateforme (admins, staff, clients finaux).

### 📊 Catégories de données
- Email
- Mot de passe (haché bcrypt)
- Token JWT
- IP de connexion
- Date/heure de connexion
- User-Agent (navigateur)

### 🤝 Destinataires
- Équipes LAIA Connect (logs de sécurité)
- Supabase (stockage)

### ⏱️ Durée de conservation
- **Sessions actives** : 7 jours (expiration JWT)
- **Logs de connexion** : 12 mois

### 🔒 Mesures de sécurité
- Hachage bcrypt (10 rounds minimum)
- Rate limiting sur /api/auth/login
- Détection de tentatives de connexion suspectes
- Tokens JWT avec expiration courte
- HTTPS obligatoire

---

<a name="traitement-3"></a>
## TRAITEMENT N°3 : Facturation et Comptabilité

### 📌 Finalité
Émettre des factures conformes à la législation fiscale française.

### 🔐 Base juridique
- **Obligation légale** (Code général des impôts)

### 👥 Catégories de personnes concernées
Abonnés LAIA Connect (instituts).

### 📊 Catégories de données
- Raison sociale, SIRET, adresse
- Email de facturation
- Montant abonnement, TVA
- Historique de paiements
- Coordonnées bancaires (IBAN)

### 🤝 Destinataires
- Expert-comptable de LAIA Connect
- Administration fiscale (sur demande légale)
- Stripe (traitement paiements)

### ⏱️ Durée de conservation
- **Factures** : 10 ans (obligation légale)
- **Coordonnées bancaires** : Pendant la durée de l'abonnement

### 🔒 Mesures de sécurité
- Chiffrement des coordonnées bancaires
- Accès restreint équipe comptabilité
- Archivage sécurisé

---

<a name="traitement-4"></a>
## TRAITEMENT N°4 : Support Client et Assistance Technique

### 📌 Finalité
Répondre aux demandes d'assistance des clients.

### 🔐 Base juridique
- **Exécution du contrat**
- **Intérêt légitime** (satisfaction client)

### 👥 Catégories de personnes concernées
Abonnés et utilisateurs de la plateforme.

### 📊 Catégories de données
- Identité (nom, email)
- Historique des tickets support
- Messages échangés
- Captures d'écran (si fournies)
- Données techniques (version navigateur, OS, logs d'erreur)

### 🤝 Destinataires
- Équipe support LAIA Connect

### ⏱️ Durée de conservation
- **Tickets résolus** : 2 ans
- **Tickets non résolus** : Pendant toute la durée de l'abonnement

### 🔒 Mesures de sécurité
- Accès restreint équipe support
- Anonymisation après clôture (si demandé)

---

<a name="traitement-5"></a>
## TRAITEMENT N°5 : Hébergement des Sites Web Clients

### 📌 Finalité
LAIA Connect héberge les sites web personnalisés de ses clients instituts.

### 🔐 Base juridique
- **Sous-traitance** (LAIA Connect = sous-traitant, Institut = responsable)

### 👥 Catégories de personnes concernées
Clients finaux des instituts (visiteurs du site, personnes prenant RDV).

### 📊 Catégories de données
- Identité : nom, prénom, email, téléphone
- Réservations : date, heure, service, praticien
- Historique client : soins effectués, notes
- Programme de fidélité : points, récompenses
- Avis clients : notation, commentaire

### 🤝 Destinataires
- **Institut client** (responsable de traitement)
- **Sous-traitants de LAIA** : Supabase, Vercel, Stripe

### ⏱️ Durée de conservation
Définie par l'institut client (LAIA applique les instructions).

### 🔒 Mesures de sécurité
- Architecture multi-tenant avec isolation organizationId
- Chiffrement des données sensibles
- Sauvegardes quotidiennes
- Conformité RGPD

### ⚠️ Note importante
**L'institut client est responsable de traitement** pour ces données. LAIA Connect agit en tant que sous-traitant et applique les instructions de l'institut conformément à l'article 28 du RGPD.

---

<a name="traitement-6"></a>
## TRAITEMENT N°6 : Traitement des Paiements (Stripe)

### 📌 Finalité
Encaisser les abonnements mensuels des clients via Stripe.

### 🔐 Base juridique
- **Exécution du contrat**

### 👥 Catégories de personnes concernées
Abonnés LAIA Connect.

### 📊 Catégories de données
- IBAN (mandat SEPA)
- Historique des transactions
- Statut des paiements

### 🤝 Destinataires
- **Stripe** (sous-traitant, certifié PCI-DSS)

### 🌍 Transferts hors UE
- **Stripe** (USA) : Clauses contractuelles types, certification PCI-DSS

### ⏱️ Durée de conservation
- **Mandats SEPA** : Pendant la durée de l'abonnement
- **Transactions** : 10 ans (obligation comptable)

### 🔒 Mesures de sécurité
- **PCI-DSS Level 1** (Stripe)
- Aucun stockage de carte bancaire chez LAIA
- Tokenisation des paiements

---

<a name="traitement-7"></a>
## TRAITEMENT N°7 : Envoi d'Emails Transactionnels

### 📌 Finalité
Envoyer des emails automatiques (confirmation inscription, factures, réinitialisation mot de passe, etc.).

### 🔐 Base juridique
- **Exécution du contrat**

### 👥 Catégories de personnes concernées
Abonnés et clients finaux des instituts.

### 📊 Catégories de données
- Email
- Nom
- Objet et contenu de l'email
- Statut d'envoi (envoyé, échoué)

### 🤝 Destinataires
- **Resend / Brevo** (sous-traitants, UE)

### ⏱️ Durée de conservation
- **Historique emails** : 12 mois

### 🔒 Mesures de sécurité
- SPF/DKIM configurés
- TLS pour envoi sécurisé
- Logs d'envoi chiffrés

---

<a name="traitement-8"></a>
## TRAITEMENT N°8 : Statistiques et Analytics

### 📌 Finalité
Analyser l'utilisation de la plateforme pour l'améliorer.

### 🔐 Base juridique
- **Consentement** (cookies analytics)
- **Intérêt légitime** (amélioration service)

### 👥 Catégories de personnes concernées
Utilisateurs de la plateforme (admins, staff).

### 📊 Catégories de données
- IP anonymisée
- Pages visitées
- Temps passé
- Actions effectuées
- Navigateur et OS

### 🤝 Destinataires
- **Google Analytics** (USA, anonymisé)
- **Hotjar** (UE, heatmaps anonymisés)

### ⏱️ Durée de conservation
- **Google Analytics** : 14 mois
- **Hotjar** : 12 mois

### 🔒 Mesures de sécurité
- Anonymisation IP
- Pas de données personnelles identifiantes
- Possibilité de refus via bandeau cookies

---

<a name="traitement-9"></a>
## TRAITEMENT N°9 : Sécurité et Prévention de la Fraude

### 📌 Finalité
Détecter et prévenir les tentatives de piratage, fraude, abus.

### 🔐 Base juridique
- **Intérêt légitime** (sécurité de la plateforme)

### 👥 Catégories de personnes concernées
Tous les utilisateurs.

### 📊 Catégories de données
- IP
- Logs de connexion (date/heure/User-Agent)
- Tentatives de connexion échouées
- Actions suspectes (rate limiting)

### 🤝 Destinataires
- Équipe technique LAIA Connect

### ⏱️ Durée de conservation
- **Logs de sécurité** : 12 mois

### 🔒 Mesures de sécurité
- Monitoring 24/7
- Alertes automatiques
- Blocage IP en cas d'attaque

---

<a name="traitement-10"></a>
## TRAITEMENT N°10 : Sauvegarde et Restauration

### 📌 Finalité
Assurer la résilience et la continuité de service.

### 🔐 Base juridique
- **Intérêt légitime** (sécurité des données)

### 👥 Catégories de personnes concernées
Tous les utilisateurs.

### 📊 Catégories de données
Copie complète de toutes les données (BDD, fichiers).

### 🤝 Destinataires
- **Supabase** (hébergeur, UE)

### ⏱️ Durée de conservation
- **Sauvegardes automatiques** : 30 jours glissants
- **Sauvegardes mensuelles** : 12 mois

### 🔒 Mesures de sécurité
- Chiffrement AES-256
- Réplication géographique multi-zones
- Tests de restauration mensuels

---

## 📞 Contact et Exercice des Droits

Pour toute question concernant ce registre ou pour exercer vos droits RGPD :

**Email** : dpo@laiaconnect.fr
**Adresse** : LAIA Connect, 65 rue de la Croix, 92000 Nanterre, France

---

*Document conforme à l'article 30 du RGPD*
*Dernière mise à jour : 2025-01-12*
