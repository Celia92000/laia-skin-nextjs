# 📋 TODO LAIA - Liste des tâches restantes

## 🔴 CRITIQUE - À faire avant la mise en production

### 💳 Paiements & Prélèvements SEPA
- [ ] **Intégrer GoCardless ou Stripe pour les prélèvements SEPA automatiques**
  - Créer un compte GoCardless/Stripe
  - Configurer l'API dans le projet
  - Créer un cronjob qui vérifie `nextBillingDate` chaque jour
  - Effectuer automatiquement les prélèvements SEPA via l'API
  - Gérer les échecs de prélèvement (relances, suspension)
  - Envoyer un email de confirmation après chaque prélèvement réussi
  - Générer et envoyer automatiquement les factures PDF

### 🔐 Sécurité
- [ ] **Changer TOUS les mots de passe par défaut en production**
  - Super admin : `SuperAdmin123!` → mot de passe fort unique
  - Admin Laia Skin : `admin123` → mot de passe fort unique
  - Configurer `JWT_SECRET` avec une valeur unique et aléatoire dans `.env`

- [ ] **Sécuriser les informations bancaires**
  - Chiffrer les IBAN/BIC dans la base de données
  - Conformité RGPD pour les données bancaires

### 📧 Emails automatiques
- [ ] **Configuration du service d'emailing**
  - Configurer SendGrid / Mailgun / Amazon SES
  - Email de bienvenue à la création d'organisation
  - Email de confirmation de mandat SEPA
  - Email 7 jours avant la fin d'essai
  - Email de confirmation après chaque prélèvement
  - Email de facture mensuelle
  - Email en cas d'échec de prélèvement

### 📄 Génération de factures
- [ ] **Système de facturation automatique**
  - Créer un modèle de facture PDF (avec logo LAIA, mentions légales)
  - Générer automatiquement les factures après chaque prélèvement
  - Stocker les factures dans un dossier sécurisé
  - Permettre aux clients de télécharger leurs factures depuis l'admin

## 🟡 IMPORTANT - Fonctionnalités à compléter

### 🎨 Template centralisé
- [ ] **Finaliser le système de mise à jour des templates**
  - Page de gestion des mises à jour (`/super-admin/template-updates`)
  - API pour mettre à jour tous les sites en un clic
  - Système de rollback en cas de problème
  - Logs des mises à jour appliquées

### 📊 Dashboard Super Admin
- [ ] **Améliorer le dashboard super admin**
  - Graphiques de revenus mensuels
  - Statistiques globales (nombre d'organisations, revenus totaux, taux de conversion)
  - Liste des prochains prélèvements à effectuer
  - Alertes pour les échecs de paiement
  - Export des données comptables

### 🔔 Notifications
- [ ] **Système de notifications**
  - Notifications pour les échecs de prélèvement
  - Notifications pour les fins d'essai imminentes
  - Notifications pour les nouvelles organisations créées

## 🟢 BONUS - Améliorations futures

### 💰 Gestion des codes promo
- [ ] **Système de codes promotionnels**
  - Créer des codes promo (ex: -50% pendant 3 mois)
  - Appliquer automatiquement les réductions
  - Gérer les dates d'expiration

### 📱 Application mobile
- [ ] **Développer une application mobile (React Native)**
  - Pour les clients (gestion de réservations)
  - Pour les admins (gestion en déplacement)

### 🤖 Automatisations avancées
- [ ] **Relances automatiques pour impayés**
  - 1er email après 3 jours
  - 2ème email après 7 jours
  - Suspension après 15 jours
  - Annulation après 30 jours

- [ ] **Passage automatique de TRIAL à ACTIVE**
  - Vérifier chaque jour les fins d'essai
  - Effectuer le premier prélèvement
  - Passer le statut à ACTIVE si succès
  - Passer à SUSPENDED si échec

### 📈 Analytics
- [ ] **Tableau de bord analytics avancé**
  - Revenus par plan (SOLO, DUO, TEAM, PREMIUM)
  - Taux de rétention client
  - Taux de conversion essai → payant
  - Churn rate (taux d'annulation)

---

## ✅ DÉJÀ FAIT

- [x] Système multi-tenant avec organisations
- [x] Création d'organisations avec informations légales (SIRET)
- [x] Collecte des mandats SEPA (IBAN, BIC, titulaire)
- [x] Génération de mots de passe ultra-sécurisés (16 caractères)
- [x] Gestion des utilisateurs avec limites par plan
- [x] Gestion des emplacements avec limites par plan
- [x] Modification et suppression d'organisations
- [x] Rôle COMPTABLE ajouté
- [x] Design system LAIA centralisé
- [x] ThemeProvider pour personnalisation des couleurs
- [x] Calcul automatique des dates de facturation
- [x] Protection contre suppression de l'organisation par défaut

---

**Date de création :** ${new Date().toLocaleDateString('fr-FR')}
**Dernière mise à jour :** ${new Date().toLocaleDateString('fr-FR')}
