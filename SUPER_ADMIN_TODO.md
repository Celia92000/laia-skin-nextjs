# 📋 Super Admin - TODO List

## ✅ Fonctionnalités Implémentées

### Dashboard & Organisations
- [x] Dashboard principal avec statistiques globales
- [x] Statistiques par plan (SOLO, DUO, TEAM, PREMIUM)
- [x] Statistiques par statut (ACTIVE, TRIAL, SUSPENDED, CANCELLED)
- [x] Liste des organisations avec filtres et recherche
- [x] Export CSV des organisations
- [x] Tri des organisations (nom, date, plan, statut)
- [x] Création de nouvelles organisations
- [x] Page de détail d'une organisation
- [x] Modification des organisations (nom, slug, plan, statut, domaine)
- [x] Changement automatique des limites selon le plan

### Emplacements
- [x] Gestion des emplacements (CRUD complet)
- [x] Page dédiée gestion emplacements
- [x] Aperçus directs (site, admin, espace client) pour chaque emplacement
- [x] Respect des limites par plan

### Utilisateurs
- [x] Gestion des utilisateurs par organisation
- [x] **Gestion globale de TOUS les utilisateurs (nouvelle page)**
- [x] **Recherche avancée (nom, email, organisation)**
- [x] **Filtres multiples (rôle, statut, organisation)**
- [x] **Tri et pagination (50 users par page)**
- [x] **Export CSV de tous les utilisateurs**
- [x] **Statistiques utilisateurs (actifs/inactifs, par rôle)**
- [x] Changement de rôle utilisateur
- [x] Activation/Désactivation utilisateurs
- [x] Suppression d'utilisateurs
- [x] Impersonnation depuis la liste globale

### Paramètres & Impersonnation
- [x] Paramètres organisations (général, paiement, réservations, fidélité)
- [x] Impersonnation (se connecter en tant que propriétaire)
- [x] Impersonnation d'un utilisateur spécifique
- [x] **Bannière d'impersonnation visible en orange en haut de page**
- [x] **Bouton "Retour Super Admin" dans la bannière**
- [x] Sortie du mode impersonnation
- [x] **API pour vérifier le statut d'impersonnation**

---

## 🔴 PRIORITÉ HAUTE - À Implémenter

### ~~1. Gestion Globale des Utilisateurs~~ ✅ TERMINÉ
**Page** : `/super-admin/users` ✅

**Fonctionnalités implémentées** :
- [x] Liste de TOUS les utilisateurs de TOUTES les organisations
- [x] Recherche avancée multi-critères (nom, email, organisation)
- [x] Filtres par rôle, statut, organisation
- [x] Tri des colonnes (date, nom, organisation, dernière connexion)
- [x] Pagination (50 users par page)
- [x] Actions : activer/désactiver, impersonner
- [x] Export CSV
- [x] Statistiques complètes (total, par rôle, actifs/inactifs)

**API Routes créées** :
- [x] `GET /api/super-admin/all-users` - Liste tous les users
- [x] `PATCH /api/super-admin/all-users/[userId]` - Modifier user

**Fonctionnalités bonus à ajouter** :
- [ ] Réinitialiser mot de passe
- [ ] Page de détails utilisateur
- [ ] Historique des actions utilisateur

---

### ~~2. Analytics Dashboard~~ ✅ TERMINÉ
**Page** : `/super-admin/analytics` ✅

**Fonctionnalités implémentées** :
- [x] **Graphiques de croissance** :
  - Nouvelles organisations par mois
  - Nouveaux utilisateurs par mois
  - Réservations par mois

- [x] **Taux de conversion** :
  - Essai → Payant (%)
  - Taux d'annulation (%)
  - Taux de rétention (%)

- [x] **Revenus** :
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - Revenus par plan
  - ARPU (Revenu moyen par utilisateur)

- [x] **Comparaisons** :
  - Top 5 organisations (revenus)
  - Top 5 organisations (réservations)

- [x] **Filtres** :
  - Période (7j, 30j, 90j, 1an)

**API Routes créées** :
- [x] `GET /api/super-admin/analytics` - Toutes les données analytics

**Fonctionnalités bonus à ajouter** :
- [ ] Graphiques interactifs avec recharts
- [ ] Export PDF des rapports
- [ ] Comparaisons mois vs mois dernier

---

### ~~3. Système de Notifications & Alertes~~ ✅ TERMINÉ
**Page** : `/super-admin/notifications` ✅

**Fonctionnalités implémentées** :
- [x] **Types d'alertes définis** :
  - Essais qui expirent dans 7 jours
  - Essais qui expirent dans 3 jours
  - Essais expirés
  - Organisations qui atteignent 80% de leurs limites
  - Organisations qui atteignent 100% de leurs limites
  - Paiements échoués
  - Organisations inactives
  - Nouvelles organisations
  - Abonnements annulés

- [x] **Centre de notifications** :
  - Liste des notifications avec stats (total, non lues, lues)
  - Marquer comme lu/non lu (individuel et bulk)
  - Supprimer notifications (individuel et bulk)
  - Filtrer par statut (toutes, non lues, lues)
  - Filtrer par type
  - Sélection multiple avec actions groupées
  - Affichage temps relatif (il y a X min/h/j)
  - Couleurs et icônes par type de notification
  - Lien vers organisation depuis notification

- [x] **Actions rapides depuis les notifications** :
  - Voir l'organisation concernée
  - Marquer comme lu/non lu
  - Supprimer

**Tables Prisma créées** :
- [x] `SuperAdminNotification` model avec tous les champs
- [x] `NotificationType` enum avec 9 types
- [x] Relations avec Organization

**API Routes créées** :
- [x] `GET /api/super-admin/notifications` - Liste notifications avec filtres
- [x] `PATCH /api/super-admin/notifications` - Marquer lu/non lu (bulk)
- [x] `DELETE /api/super-admin/notifications` - Supprimer (bulk)

**Tâches Cron à créer** (TODO) :
- [ ] Script quotidien pour générer les alertes
- [ ] Fichier : `/scripts/check-trials.ts`
- [ ] Fichier : `/scripts/check-limits.ts`

**Fonctionnalités bonus à ajouter** :
- [ ] Badge avec nombre de notifications non lues dans le header
- [ ] Configuration des alertes (activer/désactiver par type)
- [ ] Email pour les alertes critiques

---

### ~~4. Audit Logs & Historique~~ ✅ TERMINÉ
**Page** : `/super-admin/logs` ✅

**Fonctionnalités implémentées** :
- [x] **Logs des actions super admin** :
  - Qui a fait quoi et quand
  - 17 types d'actions trackées (CREATE_ORG, UPDATE_ORG, IMPERSONATE, etc.)
  - Informations utilisateur et organisation
  - IP address et User Agent

- [x] **Filtres** :
  - Par action (17 actions disponibles)
  - Par type de cible (ORGANIZATION, USER, LOCATION, SETTINGS)
  - Par date (date début et date fin)
  - Pagination (50 logs par page)

- [x] **Statistiques** :
  - Total logs enregistrés
  - Logs aujourd'hui
  - Logs cette semaine
  - Logs ce mois
  - Top 10 actions les plus fréquentes

- [x] **Détails du log** :
  - Action effectuée avec icône et couleur
  - Utilisateur qui l'a fait (nom + email)
  - Organisation concernée
  - Date et heure formatée
  - Données avant/après (JSON expandable)
  - Métadonnées (JSON expandable)
  - IP address
  - User Agent

- [x] **Export** :
  - Export des logs en CSV
  - Colonnes: Date, Utilisateur, Action, Type, Organisation, IP, User Agent

**Table Prisma créée** :
- [x] `AuditLog` model avec tous les champs
- [x] `AuditAction` enum avec 17 actions
- [x] Relations avec User et Organization
- [x] Index sur userId, action, targetType, organizationId, createdAt

**Lib créée** :
- [x] `/lib/audit-logger.ts` - Helper pour créer des logs
- [x] Fonction `createAuditLog()`
- [x] Helpers `getIpAddress()` et `getUserAgent()`

**API Routes créées** :
- [x] `GET /api/super-admin/logs` - Liste des logs avec filtres, pagination et stats

**Fonctionnalités bonus à ajouter** :
- [ ] Intégrer audit logging dans toutes les routes super admin
- [ ] Alerte si action suspecte détectée
- [ ] Graphique timeline des actions
- [ ] Comparaison visuelle avant/après pour les modifications

---

## 🟡 PRIORITÉ MOYENNE - À Implémenter

### 5. Gestion Facturation & Abonnements
**Page** : `/super-admin/billing`

**Fonctionnalités** :
- [ ] **Intégration Stripe Billing** :
  - Connexion compte Stripe
  - Configuration webhooks Stripe
  - Synchronisation abonnements

- [ ] **Historique des paiements** :
  - Liste de tous les paiements
  - Statut (réussi, échoué, en attente)
  - Montant, date, organisation
  - Factures générées

- [ ] **Gestion manuelle** :
  - Créer facture manuelle
  - Marquer comme payé
  - Rembourser
  - Annuler abonnement

- [ ] **Gestion des essais** :
  - Prolonger période d'essai
  - Réduire période d'essai
  - Convertir en payant immédiatement

- [ ] **Configuration des plans** :
  - Modifier prix des plans
  - Modifier limites des plans
  - Créer nouveaux plans
  - Archiver anciens plans

**Tables Prisma à ajouter** :
```prisma
model Invoice {
  id             String   @id @default(cuid())
  organizationId String
  amount         Float
  currency       String   @default("EUR")
  status         String   // PAID, PENDING, FAILED, REFUNDED
  stripeInvoiceId String?
  paidAt         DateTime?
  dueDate        DateTime
  createdAt      DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id])
}

model Payment {
  id             String   @id @default(cuid())
  invoiceId      String
  amount         Float
  method         String   // STRIPE, MANUAL, BANK_TRANSFER
  stripePaymentId String?
  status         String   // SUCCESS, FAILED, REFUNDED
  createdAt      DateTime @default(now())

  invoice        Invoice  @relation(fields: [invoiceId], references: [id])
}
```

**API Routes à créer** :
- `GET /api/super-admin/billing/invoices` - Liste factures
- `POST /api/super-admin/billing/invoices` - Créer facture
- `POST /api/super-admin/billing/refund/[id]` - Rembourser
- `POST /api/super-admin/billing/extend-trial` - Prolonger essai
- `GET /api/super-admin/billing/plans` - Liste des plans
- `PATCH /api/super-admin/billing/plans/[id]` - Modifier plan

---

### 6. Templates d'Emails
**Page** : `/super-admin/email-templates`

**Fonctionnalités** :
- [ ] **Gestion des templates** :
  - Email de bienvenue nouvelle organisation
  - Email fin d'essai (7j, 3j, expiré)
  - Email paiement réussi
  - Email paiement échoué
  - Email limite atteinte
  - Email newsletters

- [ ] **Éditeur de template** :
  - Éditeur WYSIWYG
  - Variables dynamiques ({{org_name}}, {{trial_end}}, etc.)
  - Aperçu du rendu
  - Test d'envoi

- [ ] **Configuration email** :
  - Paramètres SMTP
  - Email expéditeur
  - Nom expéditeur
  - Test connexion SMTP

**Table Prisma** :
```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  key         String   @unique // WELCOME, TRIAL_ENDING, etc.
  name        String
  subject     String
  htmlBody    String   @db.Text
  textBody    String?  @db.Text
  variables   Json     // Liste des variables disponibles
  active      Boolean  @default(true)
  updatedAt   DateTime @updatedAt
}
```

**API Routes** :
- `GET /api/super-admin/email-templates` - Liste templates
- `GET /api/super-admin/email-templates/[key]` - Get template
- `PATCH /api/super-admin/email-templates/[key]` - Update template
- `POST /api/super-admin/email-templates/test` - Test envoi

---

### 7. Configuration Plateforme
**Page** : `/super-admin/settings`

**Fonctionnalités** :
- [ ] **Paramètres généraux** :
  - Nom de la plateforme
  - Logo
  - Couleurs primaires/secondaires
  - Email de support
  - URL de support

- [ ] **Paramètres techniques** :
  - Configuration SMTP
  - Clés API (Stripe, etc.)
  - Webhooks URLs
  - Maintenance mode

- [ ] **Limites globales** :
  - Limite organisations
  - Limite utilisateurs par défaut
  - Stockage par défaut

- [ ] **Sécurité** :
  - 2FA obligatoire pour super admins
  - Durée sessions
  - IP whitelist
  - Rate limiting

**Table Prisma** :
```prisma
model PlatformConfig {
  id            String   @id @default(cuid())
  key           String   @unique
  value         Json
  description   String?
  updatedAt     DateTime @updatedAt
  updatedBy     String
}
```

**API Routes** :
- `GET /api/super-admin/settings` - Get all settings
- `PATCH /api/super-admin/settings` - Update settings

---

## 🟢 PRIORITÉ BASSE - Nice to Have

### 8. Système de Support & Tickets
**Page** : `/super-admin/support`

**Fonctionnalités** :
- [ ] Liste des tickets
- [ ] Créer ticket pour une organisation
- [ ] Répondre aux tickets
- [ ] Statuts (ouvert, en cours, résolu, fermé)
- [ ] Priorité (basse, normale, haute, urgente)
- [ ] Attribution à un super admin
- [ ] Chat en temps réel
- [ ] Base de connaissances

---

### 9. Backup & Sécurité
**Page** : `/super-admin/backup`

**Fonctionnalités** :
- [ ] Sauvegardes automatiques quotidiennes
- [ ] Liste des sauvegardes
- [ ] Télécharger sauvegarde
- [ ] Restaurer depuis sauvegarde
- [ ] Backup des fichiers (images, documents)
- [ ] Configuration rétention (7j, 30j, 90j)

---

### 10. Documentation & API
**Page** : `/super-admin/documentation`

**Fonctionnalités** :
- [ ] Documentation API auto-générée
- [ ] Guides d'intégration
- [ ] Changelog
- [ ] Webhooks documentation
- [ ] Exemples de code

---

## 📦 Dépendances à Installer

```bash
# Pour les graphiques analytics
npm install recharts
npm install date-fns

# Pour l'éditeur d'emails
npm install react-email
npm install @react-email/components

# Pour les exports Excel
npm install xlsx

# Pour les graphiques avancés
npm install @tremor/react

# Pour le markdown (documentation)
npm install react-markdown

# Pour les notifications en temps réel
npm install pusher-js
npm install pusher
```

---

## 🗂️ Structure des Fichiers à Créer

```
src/
├── app/
│   ├── (site)/
│   │   └── super-admin/
│   │       ├── users/
│   │       │   └── page.tsx
│   │       ├── analytics/
│   │       │   └── page.tsx
│   │       ├── notifications/
│   │       │   └── page.tsx
│   │       ├── logs/
│   │       │   └── page.tsx
│   │       ├── billing/
│   │       │   └── page.tsx
│   │       ├── email-templates/
│   │       │   ├── page.tsx
│   │       │   └── [key]/
│   │       │       └── page.tsx
│   │       ├── settings/
│   │       │   └── page.tsx
│   │       ├── support/
│   │       │   └── page.tsx
│   │       └── backup/
│   │           └── page.tsx
│   └── api/
│       └── super-admin/
│           ├── users/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── analytics/
│           │   ├── growth/
│           │   │   └── route.ts
│           │   ├── revenue/
│           │   │   └── route.ts
│           │   └── conversion/
│           │       └── route.ts
│           ├── notifications/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           ├── logs/
│           │   └── route.ts
│           ├── billing/
│           │   ├── invoices/
│           │   │   └── route.ts
│           │   ├── plans/
│           │   │   └── route.ts
│           │   └── extend-trial/
│           │       └── route.ts
│           ├── email-templates/
│           │   ├── route.ts
│           │   └── [key]/
│           │       └── route.ts
│           └── settings/
│               └── route.ts
├── components/
│   ├── analytics/
│   │   ├── GrowthChart.tsx
│   │   ├── RevenueChart.tsx
│   │   └── ConversionChart.tsx
│   └── ImpersonationBanner.tsx (✅ FAIT)
├── lib/
│   ├── audit-logger.ts
│   ├── email-sender.ts
│   └── backup.ts
└── scripts/
    ├── check-trials.ts
    ├── check-limits.ts
    ├── send-notifications.ts
    └── backup-database.ts
```

---

## 🎯 Ordre de Réalisation Recommandé

1. **Semaine 1** : Gestion globale utilisateurs + Audit logs
2. **Semaine 2** : Analytics dashboard + Notifications
3. **Semaine 3** : Billing & Abonnements
4. **Semaine 4** : Email templates + Configuration plateforme
5. **Semaine 5** : Support & Backup (si nécessaire)

---

## 📝 Notes Importantes

- Toujours logger les actions critiques dans AuditLog
- Tester l'impersonnation avec différents rôles
- Sécuriser toutes les routes API (vérifier SUPER_ADMIN)
- Ajouter de la pagination partout (max 100 items par page)
- Implémenter le rate limiting pour éviter les abus
- Prévoir des tests unitaires pour les fonctions critiques
- Documenter chaque nouvelle fonctionnalité

---

**Date de création** : 2025-01-19
**Dernière mise à jour** : 2025-01-19
**Version** : 1.0
