# 🚨 Plan de Reprise d'Activité (DRP)
## LAIA Connect - Disaster Recovery Plan

**Date de création** : 18 novembre 2025
**Version** : 1.0
**Dernière révision** : 18 novembre 2025
**Propriétaire** : LAIA Connect - Équipe Infrastructure

---

## 📋 Sommaire Exécutif

Ce document définit les procédures de reprise d'activité en cas d'incident majeur affectant la plateforme LAIA Connect. Les objectifs sont :

- **RTO (Recovery Time Objective)** : < 4 heures
- **RPO (Recovery Point Objective)** : < 1 heure
- **Disponibilité cible** : 99.9% (8.76h de downtime/an maximum)

---

## 🎯 Objectifs de Reprise

### Temps de Reprise (RTO)

| Niveau de Priorité | Service | RTO | Impact Business |
|-------------------|---------|-----|-----------------|
| **P0 - Critique** | Authentification | 1h | Blocage total |
| **P0 - Critique** | Base de données | 2h | Perte de données |
| **P0 - Critique** | API Paiements | 2h | Perte revenus |
| **P1 - Important** | Réservations | 4h | Perte clients |
| **P1 - Important** | CRM | 4h | Impact business |
| **P2 - Moyen** | Notifications | 8h | Gêne utilisateurs |
| **P3 - Faible** | Analytics | 24h | Pas d'impact direct |

### Point de Reprise (RPO)

| Type de données | RPO | Fréquence Backup |
|----------------|-----|------------------|
| Base de données | 1h | Toutes les heures (PITR) |
| Fichiers uploads | 24h | Quotidien |
| Configurations | 24h | Versioning Git |
| Logs | 7j | Archivage hebdomadaire |

---

## 🔥 Scénarios de Sinistre

### 1. Panne Base de Données (P0)

**Probabilité** : Faible
**Impact** : Critique
**Détection** : < 5 min (monitoring automatique)

#### Causes possibles
- Corruption de données
- Crash Supabase
- Saturation disque
- Attaque DDoS
- Bug application

#### Procédure de récupération

```bash
# ÉTAPE 1 : Diagnostic (5 min)
# Vérifier l'état Supabase Dashboard
https://supabase.com/dashboard/project/STATUS

# Vérifier les logs
supabase logs --tail 100

# ÉTAPE 2 : Restauration depuis backup (30 min)
# Option A : Point-in-Time Recovery (PITR)
# Via Dashboard Supabase → Database → Backups → Restore
# Sélectionner un timestamp récent (< 1h)

# Option B : Backup manuel
pg_restore -d $DATABASE_URL backup_file.sql

# ÉTAPE 3 : Validation (15 min)
# Tester les connexions
npm run test:db-connection

# Vérifier les données critiques
- Nombre de users
- Dernières réservations
- Transactions récentes

# ÉTAPE 4 : Redémarrage services (10 min)
# Redéployer sur Vercel
vercel --prod

# Vérifier le health check
curl https://laiaconnect.fr/api/health
```

**Temps total estimé** : 1h

---

### 2. Indisponibilité Vercel (P0)

**Probabilité** : Très faible
**Impact** : Critique
**Détection** : < 2 min (monitoring externe)

#### Causes possibles
- Panne datacenter Vercel
- Problème de déploiement
- Quota dépassé
- Attaque DDoS

#### Procédure de récupération

```bash
# ÉTAPE 1 : Vérification Status (5 min)
# Consulter https://www.vercel-status.com/
# Vérifier les logs Vercel Dashboard

# ÉTAPE 2 : Rollback au dernier déploiement stable (10 min)
# Via Vercel Dashboard
# Deployments → [dernier déploiement stable] → Promote to Production

# OU via CLI
vercel rollback

# ÉTAPE 3 : Si Vercel totalement indisponible (Failover)
# Déployer sur plateforme backup (Netlify/Railway)
# Prérequis : Avoir un projet configuré en standby

# Mettre à jour DNS pour pointer vers backup
# Via registrar de domaine (OVH, Cloudflare, etc.)

# ÉTAPE 4 : Communication (15 min)
# Activer la page de statut
# Notifier les clients via email/SMS
# Poster sur réseaux sociaux
```

**Temps total estimé** : 2h (avec failover)

---

### 3. Corruption/Suppression de Données (P0)

**Probabilité** : Faible
**Impact** : Critique
**Détection** : Variable (immédiat si détecté, sinon lors des backups)

#### Causes possibles
- Bug applicatif
- Erreur humaine
- Attaque malveillante
- Migration ratée

#### Procédure de récupération

```bash
# ÉTAPE 1 : Isolation immédiate (5 min)
# Mettre l'app en mode maintenance
vercel env add MAINTENANCE_MODE=true

# Bloquer les écritures en base
# Via Supabase Dashboard → Database → Row Level Security

# ÉTAPE 2 : Évaluation des dégâts (15 min)
# Identifier les tables affectées
SELECT table_name, last_modified FROM information_schema.tables;

# Quantifier les données perdues
# Comparer avec dernier backup

# ÉTAPE 3 : Restauration sélective (45 min)
# Créer une base de données temporaire
# Restaurer le backup dans la DB temp
# Extraire les données manquantes
# Réinjecter dans la DB prod

# Script de restauration partielle
node scripts/restore-partial-data.js --table=users --from=backup_20251118.sql

# ÉTAPE 4 : Vérification (30 min)
# Tests fonctionnels
# Validation par échantillonnage
# Notification aux utilisateurs affectés

# ÉTAPE 5 : Post-mortem (2h)
# Identifier la cause racine
# Corriger le bug
# Renforcer les validations
```

**Temps total estimé** : 2-3h

---

### 4. Attaque de Sécurité / Violation de Données (P0)

**Probabilité** : Moyenne
**Impact** : Critique
**Détection** : < 30 min (monitoring sécurité)

#### Types d'attaques
- Injection SQL
- XSS (Cross-Site Scripting)
- Ransomware
- Phishing
- Brute force login

#### Procédure de réponse

```bash
# ÉTAPE 1 : CONTENIR L'ATTAQUE (Immédiat)
# Bloquer l'IP de l'attaquant
# Via Upstash Redis
redis-cli SET "block:ip:X.X.X.X" "true" EX 86400

# Révoquer tous les tokens actifs
node scripts/revoke-all-tokens.js

# Forcer reconnexion de tous les users
# Invalider toutes les sessions JWT

# ÉTAPE 2 : PRÉSERVER LES PREUVES (15 min)
# Capturer les logs
vercel logs --since=1h > incident_logs.txt

# Sauvegarder l'état actuel
pg_dump $DATABASE_URL > incident_state.sql

# Prendre des screenshots
# Documenter l'incident

# ÉTAPE 3 : ÉVALUATION (30 min)
# Identifier les données compromises
# Évaluer l'impact
# Déterminer la gravité

# ÉTAPE 4 : NOTIFICATION (24h)
# Notifier la CNIL (dans les 72h si violation RGPD)
# Email : donnees-personnelles@cnil.fr
# Formulaire : https://notifications.cnil.fr/

# Informer les utilisateurs affectés
# Email personnalisé avec détails

# ÉTAPE 5 : REMÉDIATION (Variable)
# Corriger la vulnérabilité
# Renforcer la sécurité
# Audit complet
# Tests de pénétration

# ÉTAPE 6 : POST-MORTEM (1 semaine)
# Rapport détaillé de l'incident
# Actions préventives
# Formation équipe
```

**Temps total estimé** : 4h-48h selon gravité

---

### 5. Perte Totale de l'Infrastructure (P0+)

**Probabilité** : Très faible
**Impact** : Catastrophique
**Détection** : Immédiat

#### Causes possibles
- Catastrophe naturelle
- Faillite fournisseur
- Cyber-attaque majeure
- Guerre / Terrorisme

#### Procédure de récupération

```bash
# ÉTAPE 1 : ACTIVATION DU PLAN DE CRISE (1h)
# Réunion d'urgence équipe
# Évaluation de la situation
# Décision : Reconstruction ou Failover

# ÉTAPE 2 : RÉCUPÉRATION DES BACKUPS (2h)
# Télécharger le dernier backup Supabase
# Via Dashboard ou API
curl -X GET "https://api.supabase.com/v1/projects/{ref}/database/backups" \
  -H "Authorization: Bearer $SUPABASE_API_KEY"

# Récupérer les fichiers Git
git clone https://github.com/Celia92000/laia-connect.git

# Télécharger les uploads depuis Supabase Storage
# Via CLI ou API

# ÉTAPE 3 : RECONSTRUCTION (8h)
# Créer nouveau projet Supabase
# Restaurer la base de données
# Créer nouveau projet Vercel
# Redéployer l'application
# Reconfigurer DNS
# Tester intensivement

# ÉTAPE 4 : COMMUNICATION CLIENTS (Continu)
# Page de statut externe (status.laiaconnect.fr)
# Updates régulières
# Estimation du délai
# Support prioritaire

# ÉTAPE 5 : RETOUR À LA NORMALE (Variable)
# Migration progressive
# Tests fonctionnels complets
# Audit de sécurité
# Documentation incident
```

**Temps total estimé** : 12-24h

---

## 📦 Stratégie de Backup

### Backups Automatiques

#### Base de données (Supabase)
- **Fréquence** : Toutes les heures (PITR)
- **Rétention** : 30 jours
- **Stockage** : Multi-région EU
- **Test de restauration** : Mensuel

#### Fichiers Uploads (Supabase Storage)
- **Fréquence** : Quotidien (3h du matin)
- **Rétention** : 90 jours
- **Stockage** : S3-compatible
- **Test de restauration** : Trimestriel

#### Code Source (GitHub)
- **Fréquence** : À chaque commit
- **Rétention** : Illimitée
- **Stockage** : GitHub (3 régions)
- **Branches protégées** : main, production

#### Configurations (Variables d'environnement)
- **Fréquence** : À chaque modification
- **Rétention** : Illimitée (versioning Vercel)
- **Stockage** : Vercel + Backup manuel chiffré
- **Documentation** : `.env.example` à jour

### Backups Manuels

```bash
# Backup complet mensuel
./scripts/backup-database.sh

# Sauvegarde à conserver hors-site
# Stockage : Google Drive / Dropbox / AWS S3
# Chiffrement : GPG avec clé forte

# Exemple avec GPG
gpg --symmetric --cipher-algo AES256 backup_file.sql
# Upload vers cloud storage
```

---

## 🔔 Monitoring et Alertes

### Outils de Monitoring

#### Uptime Monitoring
- **Outil** : UptimeRobot / Vercel Analytics
- **Fréquence** : Toutes les 60 secondes
- **Endpoints** :
  - `https://laiaconnect.fr`
  - `https://laiaconnect.fr/api/health`
  - `https://laiaconnect.fr/platform`

#### Monitoring Base de Données
- **Outil** : Supabase Dashboard
- **Métriques** :
  - Connexions actives
  - Temps de réponse
  - Taux d'erreur
  - Utilisation disque

#### Monitoring Erreurs
- **Outil** : Sentry
- **Configuration** : Toutes les erreurs en production
- **Alertes** : Email + Slack

#### Monitoring Sécurité
- **Outil** : Upstash Redis + Custom logs
- **Métriques** :
  - Tentatives de login échouées
  - Rate limit dépassé
  - Requêtes suspectes

### Canaux d'Alerte

1. **Email** : security@laiaconnect.fr (P0, P1)
2. **SMS** : +33 X XX XX XX XX (P0 uniquement)
3. **Slack** : #alerts-production (Tous)
4. **Page de statut** : status.laiaconnect.fr (Public)

---

## 👥 Rôles et Responsabilités

### Équipe de Crise

| Rôle | Nom | Contact | Responsabilités |
|------|-----|---------|----------------|
| **Incident Commander** | Célia (CEO) | contact@laiaconnect.fr | Décisions finales, communication |
| **Tech Lead** | Célia (CEO) | contact@laiaconnect.fr | Diagnostic technique, restauration |
| **DevOps** | Célia (CEO) | contact@laiaconnect.fr | Infrastructure, déploiements |
| **DPO** | Célia (CEO) | contact@laiaconnect.fr | RGPD, notifications légales |
| **Support Client** | Célia (CEO) | support@laiaconnect.fr | Communication clients |

### Escalade

```
Niveau 1: Détection automatique → Alerte Slack
   ↓ (si non résolu en 15 min)
Niveau 2: Alerte Tech Lead → Investigation
   ↓ (si P0 ou non résolu en 30 min)
Niveau 3: Incident Commander → Décision
   ↓ (si critique)
Niveau 4: CEO + Tous les stakeholders
```

---

## 📞 Contacts d'Urgence

### Fournisseurs Critiques

| Service | Contact | SLA | Escalade |
|---------|---------|-----|----------|
| **Vercel** | support@vercel.com | 1h (Pro) | Status page |
| **Supabase** | support@supabase.io | 4h (Pro) | Dashboard |
| **Stripe** | support@stripe.com | 24h | Dashboard |
| **Twilio** | help@twilio.com | 24h | Console |
| **Resend** | support@resend.com | 48h | Dashboard |

### Contacts Légaux

- **Avocat** : À contacter si nécessaire (cabinet spécialisé RGPD/Tech)
- **Assurance Cyber** : À souscrire (recommandé : Hiscox, AXA Cyber)
- **CNIL** : donnees-personnelles@cnil.fr

---

## 📊 Tests et Exercices

### Tests de Restauration

- **Backup BDD** : Mensuel (1er de chaque mois)
- **Failover Vercel** : Trimestriel
- **Restauration complète** : Annuel
- **Tabletop exercise** : Semestriel

### Documentation des Tests

```markdown
# Test de Restauration - [Date]

**Type** : [Backup BDD / Failover / etc.]
**Durée** : [HH:MM]
**Résultat** : [✅ Succès / ❌ Échec]

## Procédure suivie
1. ...
2. ...

## Problèmes rencontrés
- ...

## Actions correctives
- ...

## Leçons apprises
- ...
```

---

## 📈 Amélioration Continue

### Après chaque incident

1. **Post-Mortem** (dans les 48h)
   - Chronologie détaillée
   - Cause racine
   - Impact business
   - Actions préventives

2. **Mise à jour du DRP** (dans la semaine)
   - Intégrer les leçons apprises
   - Améliorer les procédures
   - Mettre à jour les contacts

3. **Formation** (dans le mois)
   - Partager le retour d'expérience
   - Former sur les nouvelles procédures
   - Simuler des scénarios similaires

### Révision du Plan

- **Fréquence** : Trimestrielle
- **Responsable** : Tech Lead
- **Processus** :
  1. Review des incidents récents
  2. Mise à jour des contacts
  3. Test des procédures
  4. Validation par l'équipe

---

## ✅ Checklist Pré-Incident

### Préparation (À faire maintenant)

- [x] Backups automatiques configurés
- [x] Monitoring actif (uptime, erreurs)
- [x] Sentry activé en production
- [ ] Page de statut publique créée (optionnel)
- [x] Contacts d'urgence à jour
- [x] Équipe de crise définie
- [ ] Tests de restauration documentés (mensuel)
- [x] Documentation DRP à jour
- [ ] Assurance cyber souscrite (recommandé)
- [ ] Failover Vercel configuré (optionnel)

### Vérification Mensuelle

- [ ] Tester restauration backup BDD
- [ ] Vérifier les alertes fonctionnent
- [ ] Mettre à jour les contacts
- [ ] Revoir les procédures
- [ ] Vérifier l'espace de stockage backups

---

## 📝 Template de Rapport d'Incident

```markdown
# Rapport d'Incident - [ID]

**Date** : [JJ/MM/AAAA HH:MM]
**Gravité** : [P0 / P1 / P2 / P3]
**Durée** : [HH:MM]
**Impact** : [X utilisateurs / Y€ de CA]
**Statut** : [Résolu / En cours / Monitoring]

## Chronologie

- **[HH:MM]** : Détection de l'incident
- **[HH:MM]** : Investigation démarrée
- **[HH:MM]** : Cause identifiée
- **[HH:MM]** : Correctif appliqué
- **[HH:MM]** : Service restauré

## Description

[Description détaillée de l'incident]

## Cause Racine

[Analyse approfondie de la cause]

## Impact

- **Utilisateurs affectés** : [Nombre/Pourcentage]
- **Données perdues** : [Oui/Non - Détails]
- **Revenu perdu** : [Montant estimé]
- **Durée d'indisponibilité** : [HH:MM]

## Actions Prises

1. ...
2. ...

## Actions Préventives

1. ...
2. ...

## Leçons Apprises

- ...

## Suivi

- [ ] Corriger le bug (Deadline: ...)
- [ ] Améliorer le monitoring (Deadline: ...)
- [ ] Former l'équipe (Deadline: ...)
```

---

**FIN DU DOCUMENT**

**Prochaine révision** : 28 février 2026
**Propriétaire** : Célia - CEO LAIA Connect
**Approbation** : Célia - CEO LAIA Connect
**Dernière mise à jour** : 29 novembre 2025
