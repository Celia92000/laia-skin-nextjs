# 📋 TODO - Multi-Tenant & Plateforme SaaS

**Date de création** : 2025-10-19
**Dernière mise à jour** : 2025-10-19
**Statut** : En cours de développement

---

## 🔴 PRIORITÉ 1 - À finir en urgence

### 1. Finir intégration Stripe Billing complète
**Objectif** : Mettre en place le système de paiement pour les abonnements organisations

**Tâches** :
- [ ] Créer compte Stripe Connect pour la plateforme
- [ ] Configurer les produits Stripe (SOLO, DUO, TEAM, PREMIUM)
- [ ] Implémenter le flux de paiement lors de l'inscription
- [ ] Gérer les upgrades/downgrades de plan
- [ ] Tester le flux complet de bout en bout

**Fichiers concernés** :
- `src/app/api/super-admin/billing/`
- `src/lib/stripe-service.ts` (à créer)

---

### 2. Créer système de webhooks Stripe pour sync abonnements
**Objectif** : Synchroniser automatiquement les événements Stripe avec la base de données

**Événements à gérer** :
- [ ] `checkout.session.completed` - Nouvelle souscription
- [ ] `invoice.payment_succeeded` - Paiement réussi
- [ ] `invoice.payment_failed` - Paiement échoué
- [ ] `customer.subscription.updated` - Changement de plan
- [ ] `customer.subscription.deleted` - Annulation abonnement

**Fichiers à créer** :
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/stripe-webhook-handler.ts`

---

### 3. Implémenter gestion des factures (Invoice model + routes)
**Objectif** : Système complet de facturation pour les organisations

**Modèles Prisma à ajouter** :
```prisma
model Invoice {
  id              String   @id @default(cuid())
  organizationId  String
  amount          Float
  currency        String   @default("EUR")
  status          String   // PAID, PENDING, FAILED, REFUNDED
  stripeInvoiceId String?
  paidAt          DateTime?
  dueDate         DateTime
  createdAt       DateTime @default(now())

  organization    Organization @relation(fields: [organizationId], references: [id])
}
```

**API Routes à créer** :
- [ ] `GET /api/super-admin/billing/invoices` - Liste factures
- [ ] `GET /api/super-admin/billing/invoices/[id]` - Détail facture
- [ ] `POST /api/super-admin/billing/invoices` - Créer facture manuelle
- [ ] `POST /api/super-admin/billing/invoices/[id]/refund` - Rembourser

---

### 4. Terminer page /super-admin/billing (historique paiements, factures)
**Objectif** : Interface complète de gestion de la facturation

**Sections à implémenter** :
- [ ] **Dashboard facturation** :
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - Taux de churn
  - Revenu par plan

- [ ] **Liste des factures** :
  - Tableau avec filtres (statut, date, organisation)
  - Export CSV/Excel
  - Détails facture avec téléchargement PDF

- [ ] **Gestion des essais** :
  - Liste des organisations en essai
  - Prolonger/Réduire période d'essai
  - Convertir en payant

- [ ] **Configuration des plans** :
  - Modifier prix des plans
  - Modifier limites des plans
  - Historique des changements

**Fichier** : `src/app/(site)/super-admin/billing/page.tsx`

---

## 🟡 PRIORITÉ 2 - Important

### 5. Améliorer Templates d'Emails plateforme
**Objectif** : Templates professionnels pour communication plateforme

**Templates à créer** :
- [ ] Email bienvenue nouvelle organisation
- [ ] Email essai expire dans 7 jours
- [ ] Email essai expire dans 3 jours
- [ ] Email essai expiré
- [ ] Email paiement réussi (avec facture)
- [ ] Email paiement échoué
- [ ] Email limite atteinte (80%, 100%)
- [ ] Email newsletter plateforme

**Table Prisma** :
```prisma
model EmailTemplate {
  id          String   @id @default(cuid())
  key         String   @unique // WELCOME, TRIAL_ENDING_7D, etc.
  name        String
  subject     String
  htmlBody    String   @db.Text
  textBody    String?  @db.Text
  variables   Json     // Liste des variables disponibles
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

### 6. Créer éditeur WYSIWYG pour templates emails
**Objectif** : Interface d'édition visuelle des templates

**Fonctionnalités** :
- [ ] Éditeur riche (gras, italique, couleurs, liens)
- [ ] Variables dynamiques avec sélection ({{org_name}}, {{trial_end}}, {{plan_name}})
- [ ] Aperçu en temps réel avec données de test
- [ ] Bouton "Envoyer un test" à une adresse email
- [ ] Historique des versions

**Librairies à installer** :
```bash
npm install @tiptap/react @tiptap/starter-kit
npm install react-email @react-email/components
```

**Fichier** : `src/app/(site)/super-admin/email-templates/page.tsx`

---

### 7. Finaliser page /super-admin/settings (config plateforme)
**Objectif** : Configuration centralisée de la plateforme

**Sections** :
- [ ] **Paramètres généraux** :
  - Nom de la plateforme
  - Logo et favicon
  - Couleurs primaires/secondaires
  - Email et URL de support

- [ ] **Paramètres techniques** :
  - Configuration SMTP
  - Clés API (Stripe, etc.)
  - URLs des webhooks
  - Mode maintenance (ON/OFF)

- [ ] **Limites globales** :
  - Nombre max d'organisations
  - Stockage total disponible
  - Limites par défaut des plans

- [ ] **Sécurité** :
  - 2FA obligatoire pour super admins
  - Durée des sessions
  - IP whitelist
  - Rate limiting global

**Table Prisma** :
```prisma
model PlatformConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json
  description String?
  updatedAt   DateTime @updatedAt
  updatedBy   String
}
```

---

### 8. Ajouter graphiques interactifs dans Analytics
**Objectif** : Visualisation des données avec graphiques professionnels

**Graphiques à créer** :
- [ ] Croissance organisations (ligne)
- [ ] Croissance utilisateurs (ligne)
- [ ] Répartition par plan (camembert)
- [ ] Revenus mensuels (barres)
- [ ] Taux de conversion (jauge)
- [ ] Churn rate (ligne)

**Librairie** :
```bash
npm install recharts date-fns
```

**Fichier** : `src/app/(site)/super-admin/analytics/page.tsx`

---

### 9. Créer scripts cron pour alertes automatiques
**Objectif** : Surveillance automatique de la plateforme

**Scripts à créer** :
- [ ] **check-trials.ts** : Vérifier les essais qui expirent
  - Créer notification 7 jours avant
  - Créer notification 3 jours avant
  - Créer notification le jour même
  - Envoyer emails automatiques

- [ ] **check-limits.ts** : Vérifier les limites atteintes
  - Alerter à 80% des limites
  - Alerter à 100% des limites
  - Bloquer si dépassement

- [ ] **check-payments.ts** : Vérifier les paiements échoués
  - Détecter les factures impayées
  - Relancer automatiquement
  - Suspendre après 3 échecs

**Dossier** : `scripts/cron/`

**Configuration Vercel Cron** :
```json
{
  "crons": [
    {
      "path": "/api/cron/check-trials",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/check-limits",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/check-payments",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

### 10. Intégrer audit logging dans toutes les routes super-admin
**Objectif** : Traçabilité complète de toutes les actions

**Routes à logger** :
- [x] Organisations (CREATE, UPDATE, DELETE) ✅ Déjà fait
- [x] Utilisateurs (CREATE, UPDATE, DELETE) ✅ Déjà fait
- [x] Impersonnation (START, END) ✅ Déjà fait
- [ ] Billing (CREATE_INVOICE, REFUND, EXTEND_TRIAL)
- [ ] Settings (UPDATE_CONFIG)
- [ ] Email templates (UPDATE_TEMPLATE)
- [ ] Notifications (DISMISS, DELETE)

**Fonction helper** : `src/lib/audit-logger.ts` ✅ Déjà créée

**Utilisation** :
```typescript
await createAuditLog({
  userId: session.user.id,
  action: 'CREATE_INVOICE',
  targetType: 'INVOICE',
  targetId: invoice.id,
  organizationId: invoice.organizationId,
  after: invoice,
  metadata: { amount: invoice.amount },
  req
});
```

---

## 🟢 PRIORITÉ 3 - Nice to have

### 11. Améliorer système de tickets support
**État actuel** : Système de base existe
**Améliorations** :
- [ ] Chat en temps réel (Pusher/WebSocket)
- [ ] Base de connaissances (FAQ)
- [ ] Pièces jointes dans les tickets
- [ ] Système de tags pour tickets
- [ ] Templates de réponses rapides
- [ ] SLA et temps de réponse moyen

---

### 12. Créer système de backup automatique
**Objectif** : Sauvegardes quotidiennes de la base de données

**Fonctionnalités** :
- [ ] Backup quotidien automatique (PostgreSQL dump)
- [ ] Stockage sur S3/Backblaze B2
- [ ] Rétention : 7 jours, 30 jours, 90 jours
- [ ] Interface de restauration
- [ ] Backup des fichiers uploadés (images, documents)
- [ ] Tests de restauration automatiques

**Script** : `scripts/backup-database.ts`

---

### 13. Générer documentation API auto
**Objectif** : Documentation OpenAPI/Swagger

**Outils** :
```bash
npm install swagger-jsdoc swagger-ui-react
```

**Fonctionnalités** :
- [ ] Documentation auto-générée depuis les routes
- [ ] Interface Swagger UI interactive
- [ ] Exemples de requêtes/réponses
- [ ] Authentification dans Swagger
- [ ] Export OpenAPI 3.0 JSON

**Route** : `/super-admin/documentation`

---

### 14. Ajouter 2FA pour comptes super admin
**Objectif** : Sécurité renforcée pour les super admins

**Implémentation** :
- [ ] Utiliser TOTP (Google Authenticator, Authy)
- [ ] QR Code pour configuration
- [ ] Codes de récupération (10 codes)
- [ ] Forcer 2FA pour tous les super admins
- [ ] Logs des connexions 2FA

**Librairie** :
```bash
npm install speakeasy qrcode
```

---

## 🔧 TECHNIQUE - Maintenance & qualité

### 15. Tester migration complète vers multi-tenant
**Objectif** : Valider que la migration fonctionne parfaitement

**Tests à effectuer** :
- [ ] Migration du schema Prisma (npx prisma migrate)
- [ ] Exécution script migrate-to-multi-tenant.ts
- [ ] Vérification intégrité données (migration-check.ts)
- [ ] Test avec données de production (copie)
- [ ] Rollback et re-migration
- [ ] Performance des requêtes après migration

---

### 16. Optimiser requêtes Prisma
**Objectif** : Performance optimale de la base de données

**Optimisations** :
- [ ] Ajouter indexes manquants
- [ ] Utiliser `include` vs `select` de manière optimale
- [ ] Implémenter pagination partout
- [ ] Utiliser `findUniqueOrThrow` pour erreurs claires
- [ ] Ajouter `connection pooling`
- [ ] Monitoring des slow queries

**Indexes à vérifier** :
```prisma
@@index([organizationId])
@@index([status])
@@index([createdAt])
@@index([email, organizationId])
```

---

### 17. Ajouter tests unitaires
**Objectif** : Qualité et stabilité du code

**Tests critiques** :
- [ ] `lib/permissions.ts` - Vérifier permissions par rôle
- [ ] `lib/tenant-service.ts` - Isolation des organisations
- [ ] `lib/audit-logger.ts` - Création logs
- [ ] `middleware.ts` - Routage et sécurité
- [ ] API routes super-admin - Tous les endpoints

**Framework** :
```bash
npm install --save-dev vitest @testing-library/react
```

---

### 18. Configurer rate limiting
**Objectif** : Protection contre les abus

**Limites par endpoint** :
- [ ] `/api/auth/login` : 5 tentatives / 15min
- [ ] `/api/super-admin/*` : 100 req / min
- [ ] `/api/platform/register` : 3 créations / heure
- [ ] Routes publiques : 60 req / min

**Librairie** :
```bash
npm install @upstash/ratelimit @upstash/redis
```

---

## 📱 CLIENT - Fonctionnalités admin institut

### 19. Notifications temps réel
**Objectif** : Alertes instantanées pour nouveaux messages

**Implémentation** :
- [ ] Intégration Pusher ou Socket.io
- [ ] Badge de notifications non lues
- [ ] Sons de notification (optionnel)
- [ ] Notifications navigateur (Web Push API)
- [ ] Préférences de notifications par utilisateur

---

### 20. Intégration Google Calendar
**Objectif** : Synchronisation bidirectionnelle des RDV

**Fonctionnalités** :
- [ ] OAuth2 Google pour connexion
- [ ] Sync réservations → Google Calendar
- [ ] Sync Google Calendar → réservations
- [ ] Gestion des conflits
- [ ] Choix du calendrier de destination

---

### 21. Améliorer export PDF des statistiques
**Objectif** : Rapports professionnels imprimables

**Améliorations** :
- [ ] Logo de l'organisation
- [ ] Graphiques dans le PDF
- [ ] Mise en page professionnelle
- [ ] Export multi-pages si nécessaire
- [ ] Envoi par email du PDF

**Librairie** :
```bash
npm install jspdf jspdf-autotable
```

---

### 22. Créer mode sombre
**Objectif** : Thème sombre pour interface admin

**Implémentation** :
- [ ] Système de thème avec Tailwind (dark:)
- [ ] Toggle dans le header
- [ ] Sauvegarde préférence utilisateur
- [ ] Transition fluide entre thèmes
- [ ] Support du thème système (auto)

---

## 📦 Dépendances à installer

```bash
# Graphiques
npm install recharts date-fns

# Emails
npm install react-email @react-email/components
npm install @tiptap/react @tiptap/starter-kit

# Exports
npm install xlsx jspdf jspdf-autotable

# Notifications temps réel
npm install pusher-js pusher

# Paiements
npm install stripe @stripe/stripe-js

# Sécurité
npm install speakeasy qrcode
npm install @upstash/ratelimit @upstash/redis

# Tests
npm install --save-dev vitest @testing-library/react

# Documentation
npm install swagger-jsdoc swagger-ui-react

# Markdown
npm install react-markdown
```

---

## 🎯 Plan de réalisation recommandé

### Semaine 1 (Priorité 1)
- [ ] Stripe Billing complet
- [ ] Webhooks Stripe
- [ ] Gestion factures
- [ ] Page billing terminée

### Semaine 2 (Priorité 2 partie 1)
- [ ] Templates emails plateforme
- [ ] Éditeur WYSIWYG
- [ ] Page settings terminée

### Semaine 3 (Priorité 2 partie 2)
- [ ] Graphiques Analytics
- [ ] Scripts cron alertes
- [ ] Audit logging complet

### Semaine 4 (Priorité 3)
- [ ] Améliorer support tickets
- [ ] Système backup
- [ ] Documentation API
- [ ] 2FA super admin

### Semaine 5 (Technique)
- [ ] Tests migration
- [ ] Optimisations Prisma
- [ ] Tests unitaires
- [ ] Rate limiting

### Semaine 6 (Client)
- [ ] Notifications temps réel
- [ ] Google Calendar
- [ ] Export PDF amélioré
- [ ] Mode sombre

---

## ✅ Ce qui est déjà fait

### Architecture multi-tenant ✅
- [x] Modèles Prisma (Organization, Location, OrganizationConfig)
- [x] Système de rôles (UserRole enum)
- [x] Services (tenant-service, config-service, permissions)
- [x] Middleware multi-tenant

### Super Admin ✅
- [x] Dashboard avec statistiques
- [x] Gestion organisations (CRUD complet)
- [x] Gestion utilisateurs globale
- [x] Analytics de base
- [x] Notifications système
- [x] Audit Logs
- [x] Impersonnation

### API Routes ✅
- [x] /api/super-admin/organizations
- [x] /api/super-admin/all-users
- [x] /api/super-admin/analytics
- [x] /api/super-admin/notifications
- [x] /api/super-admin/logs
- [x] /api/super-admin/impersonate

### Scripts ✅
- [x] migrate-to-multi-tenant.ts
- [x] create-super-admin.ts
- [x] init-site-config.ts
- [x] migration-check.ts

---

## 📝 Notes importantes

- **Sécurité** : Toujours vérifier le rôle SUPER_ADMIN avant actions sensibles
- **Performance** : Ajouter pagination sur toutes les listes (max 100 items)
- **Logs** : Logger toutes les actions critiques dans AuditLog
- **Tests** : Tester l'impersonnation avec différents rôles
- **Documentation** : Documenter chaque nouvelle fonctionnalité
- **Backup** : Toujours sauvegarder avant migration ou changement majeur

---

**Prochaine session** : Commencer par la priorité 1 (Stripe Billing)
