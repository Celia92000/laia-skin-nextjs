# Système de Ticketing Bidirectionnel - LAIA Connect

Documentation complète du système de support client avec synchronisation email Gandi Mail.

---

## 🎯 Vue d'ensemble

Le système permet de gérer les demandes de support des clients avec **3 modes de communication** :

1. **Depuis l'espace Admin** (client) → Formulaire de création de ticket
2. **Depuis le Super-Admin** (vous) → Interface de gestion complète
3. **Depuis Gandi Mail** (vous) → Réponse directe aux emails

**Avantage** : Vous pouvez répondre depuis votre boîte mail Gandi habituelle, et les réponses sont automatiquement ajoutées aux tickets !

---

## 📧 Comment ça fonctionne ?

### 🔄 **Flux complet** :

```
1. CLIENT crée un ticket
   ↓
2. Ticket enregistré dans la base de données
   ↓
3. Email de confirmation → Client (via Brevo)
4. Email de notification → Vous (contact@laiaconnect.fr)
   ↓
5. VOUS recevez l'email dans Gandi Mail
   ↓
6. OPTION A : Répondre depuis le super-admin
   OU
   OPTION B : Répondre depuis Gandi Mail
   ↓
7. Si réponse depuis Gandi Mail :
   - Script IMAP récupère l'email (toutes les 2 minutes)
   - Détecte le numéro de ticket dans le sujet
   - Ajoute automatiquement la réponse au ticket
   - Met à jour le statut si nécessaire
   ↓
8. Client reçoit un email de notification
9. Client voit la réponse dans son espace admin
```

---

## 🛠️ Configuration

### 1. **Variables d'environnement**

Ajoutez dans `.env.local` (déjà fait) :

```bash
# Synchronisation IMAP (Gandi) - LAIA Connect
GANDI_EMAIL="contact@laiaconnect.fr"
GANDI_EMAIL_PASSWORD="VOTRE_MOT_DE_PASSE"  # ⚠️ À configurer
```

**⚠️ IMPORTANT** : Remplacez `VOTRE_MOT_DE_PASSE` par le vrai mot de passe de contact@laiaconnect.fr

### 2. **Déploiement sur Vercel**

Ajoutez ces variables dans Vercel :
1. Allez sur https://vercel.com/votre-projet/settings/environment-variables
2. Ajoutez :
   - `GANDI_EMAIL` = `contact@laiaconnect.fr`
   - `GANDI_EMAIL_PASSWORD` = `votre_mot_de_passe`

### 3. **Cron Job Vercel** (déjà configuré)

Le cron job s'exécute **automatiquement toutes les 2 minutes** pour récupérer les nouveaux emails.

Configuration dans `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-emails?secret=$CRON_SECRET",
      "schedule": "*/2 * * * *"
    }
  ]
}
```

---

## 🧪 Test manuel

### **Tester la synchronisation email manuellement** :

1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:3001/api/cron/sync-emails?secret=VOTRE_CRON_SECRET`
3. Vous devriez voir :
```json
{
  "success": true,
  "message": "Synchronisation réussie",
  "processed": 1,
  "errors": 0,
  "timestamp": "2025-11-19T..."
}
```

---

## 📝 Scénario de test complet

### **Test End-to-End** :

1. **Créer un ticket** :
   - Connectez-vous en tant qu'admin classique : http://localhost:3001/admin
   - Allez sur "Support" : http://localhost:3001/admin/support
   - Créez un ticket avec :
     - Sujet : "Test de synchronisation email"
     - Description : "Ceci est un test"
     - Catégorie : QUESTION
     - Priorité : MEDIUM

2. **Vérifier la notification** :
   - Vous devriez recevoir un email sur contact@laiaconnect.fr
   - Sujet : `[Nouveau ticket] TICKET-2025-XXX - Test de synchronisation email`

3. **Répondre depuis Gandi Mail** :
   - Ouvrez Gandi Mail (https://webmail.gandi.net)
   - Répondez à l'email reçu
   - **IMPORTANT** : Ne modifiez PAS le sujet (le numéro de ticket doit rester dans le sujet)
   - Écrivez votre réponse : "Bonjour, j'ai bien reçu votre demande..."

4. **Déclencher la synchronisation** :
   - Attendez 2 minutes (cron automatique)
   - OU appelez manuellement : http://localhost:3001/api/cron/sync-emails?secret=VOTRE_CRON_SECRET

5. **Vérifier dans le super-admin** :
   - Allez sur http://localhost:3001/super-admin/tickets
   - Ouvrez le ticket TICKET-2025-XXX
   - Vous devriez voir votre réponse ajoutée automatiquement ! ✅

6. **Vérifier côté client** :
   - Le client reçoit un email de notification
   - Le client voit la réponse dans son espace admin

---

## 📋 Interfaces disponibles

### **Espace Admin** (Client)
URL : http://localhost:3001/admin/support

**Fonctionnalités** :
- ✅ Créer un nouveau ticket
- ✅ Voir tous ses tickets
- ✅ Répondre aux tickets
- ✅ Filtrer par statut
- ✅ Statistiques personnelles

### **Super-Admin** (Vous)
URL : http://localhost:3001/super-admin/tickets

**Fonctionnalités** :
- ✅ Voir tous les tickets de tous les clients
- ✅ Répondre aux tickets
- ✅ Changer le statut (OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED)
- ✅ Changer la priorité
- ✅ Ajouter des notes internes
- ✅ Statistiques globales
- ✅ Filtres avancés

---

## 🔐 Sécurité

### **Protection de l'endpoint cron** :

L'endpoint `/api/cron/sync-emails` est protégé par un secret :
```
GET /api/cron/sync-emails?secret=VOTRE_CRON_SECRET
```

**Sans le secret**, l'accès est refusé (401 Unauthorized).

### **Validation des emails** :

Le système vérifie que :
- L'email contient un numéro de ticket valide
- Le ticket existe dans la base de données
- L'email provient bien du créateur du ticket (pas de spoofing)
- Le contenu n'est pas vide ou trop court

---

## 📊 Logs et monitoring

### **Logs dans l'application** :

Tous les événements sont loggés avec le préfixe `[Email Sync]` :

```
[Email Sync] Connexion IMAP établie
[Email Sync] INBOX ouverte (152 messages)
[Email Sync] 3 nouveaux emails trouvés
[Email Sync] Email #1 - De: client@example.com - Sujet: Re: TICKET-2025-001
[Email Sync] Ticket trouvé: TICKET-2025-001
[Email Sync] ✅ Réponse ajoutée au ticket TICKET-2025-001
[Email Sync] Synchronisation terminée - 1 traités, 0 erreurs
```

### **Consulter les logs Vercel** :

1. Allez sur https://vercel.com/votre-projet
2. Cliquez sur "Logs"
3. Filtrez par `/api/cron/sync-emails`

---

## 🚨 Dépannage

### **Problème : Les emails ne sont pas synchronisés**

**Solution 1** : Vérifier que GANDI_EMAIL_PASSWORD est configuré
```bash
# Dans .env.local
GANDI_EMAIL_PASSWORD="votre_mot_de_passe_ici"
```

**Solution 2** : Tester la connexion IMAP manuellement
```bash
# Appelez l'endpoint manuellement
curl "http://localhost:3001/api/cron/sync-emails?secret=VOTRE_CRON_SECRET"
```

**Solution 3** : Vérifier les logs
```
[Email Sync] GANDI_EMAIL_PASSWORD non configuré - synchronisation ignorée
```

### **Problème : Le numéro de ticket n'est pas détecté**

**Cause** : Le sujet de l'email a été modifié et ne contient plus le numéro de ticket

**Solution** : Toujours répondre directement à l'email sans modifier le sujet

**Exemples de sujets valides** :
- ✅ `Re: TICKET-2025-001 - Problème de connexion`
- ✅ `Re: Ticket TICKET-2025-001`
- ✅ `TICKET-2025-001`

**Exemples de sujets invalides** :
- ❌ `Re: Problème de connexion` (pas de numéro)
- ❌ `Nouveau message` (pas de numéro)

### **Problème : Email détecté mais pas ajouté au ticket**

**Cause possible 1** : L'email ne provient pas du créateur du ticket

**Solution** : Vérifiez que l'email vient bien de l'adresse email du client qui a créé le ticket

**Cause possible 2** : Le contenu de l'email est trop court

**Solution** : Le message doit faire au moins 10 caractères

---

## 📈 Statistiques

Le système de tickets enregistre automatiquement :
- Nombre total de tickets
- Tickets ouverts
- Tickets en cours
- Tickets urgents
- Tickets résolus
- Temps de première réponse (SLA)
- Temps de résolution

---

## 🔄 Workflow recommandé

### **Méthode 1 : Super-Admin uniquement**
1. Vous recevez une notification par email
2. Vous allez dans le super-admin
3. Vous répondez directement depuis l'interface
4. Le client reçoit un email

**Avantages** :
- Interface professionnelle
- Changement de statut facile
- Historique complet visible
- Notes internes possibles

### **Méthode 2 : Email uniquement** (NOUVEAU ! 🎉)
1. Vous recevez une notification par email
2. Vous répondez directement depuis Gandi Mail
3. La synchronisation ajoute automatiquement votre réponse
4. Le client reçoit un email

**Avantages** :
- Rapide et pratique
- Pas besoin de se connecter au super-admin
- Réponse depuis mobile/tablette
- Historique email classique

### **Méthode 3 : Hybride** (RECOMMANDÉE)
1. Réponses rapides → Gandi Mail
2. Cas complexes → Super-Admin
3. Changement de statut → Super-Admin

---

## 🎓 Bonnes pratiques

### **Format des sujets d'emails** :
Brevo envoie automatiquement les emails avec le format :
- Nouveau ticket : `[Nouveau ticket] TICKET-2025-XXX - Sujet`
- Réponse super-admin : `Re: Sujet [TICKET-2025-XXX]`
- Changement de statut : `Ticket TICKET-2025-XXX - Mise à jour du statut`

**Ne modifiez JAMAIS le numéro de ticket dans le sujet !**

### **Nettoyage des citations** :
Le système retire automatiquement les citations des emails précédents :
- Lignes commençant par `>`
- Signature `Le ... a écrit:`
- Signature `On ... wrote:`
- En-têtes `From: ... Sent: ...`

### **Statuts des tickets** :
- `OPEN` : Nouveau ticket non traité
- `IN_PROGRESS` : Ticket en cours de traitement
- `WAITING_CUSTOMER` : En attente d'une réponse du client
- `RESOLVED` : Problème résolu
- `CLOSED` : Ticket fermé

**Astuce** : Quand vous répondez depuis Gandi Mail à un ticket en statut `WAITING_CUSTOMER`, le système le repasse automatiquement en `IN_PROGRESS`.

---

## ⚙️ Architecture technique

### **Technologies utilisées** :
- **IMAP** : Protocole de récupération d'emails (Gandi Mail)
- **Node.js** : Runtime pour le script de synchronisation
- **Prisma** : ORM pour l'accès à la base de données
- **Brevo** : Service d'envoi d'emails transactionnels
- **Vercel Cron** : Planificateur de tâches automatiques

### **Fichiers clés** :
- `/src/lib/email-sync.ts` : Script de synchronisation IMAP
- `/src/app/api/cron/sync-emails/route.ts` : Endpoint cron
- `/src/app/api/admin/support/tickets/route.ts` : API tickets clients
- `/src/app/api/super-admin/tickets/[id]/route.ts` : API tickets super-admin
- `/src/app/(super-admin)/super-admin/tickets/page.tsx` : Interface super-admin
- `/src/app/admin/support/page.tsx` : Interface client

---

## 📞 Support

Si vous rencontrez un problème :
1. Consultez les logs Vercel
2. Testez manuellement l'endpoint cron
3. Vérifiez que GANDI_EMAIL_PASSWORD est correct
4. Vérifiez que le cron job est activé dans Vercel

---

## ✅ Checklist de déploiement

- [ ] `GANDI_EMAIL_PASSWORD` configuré dans `.env.local`
- [ ] `GANDI_EMAIL_PASSWORD` ajouté dans Vercel
- [ ] `CRON_SECRET` configuré dans Vercel
- [ ] Cron job activé dans Vercel
- [ ] Test manuel réussi
- [ ] Test end-to-end réussi

---

**Système créé le 19 novembre 2025**
**Dernière mise à jour : 19 novembre 2025**
