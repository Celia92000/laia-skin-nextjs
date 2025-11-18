# 🔐 Scripts de Sécurité - LAIA Platform

Ce dossier contient les scripts nécessaires pour sécuriser votre application avant la mise en production.

## 📋 Table des matières

- [Script de sécurisation automatique](#script-de-sécurisation-automatique)
- [Utilisation](#utilisation)
- [Ce que fait le script](#ce-que-fait-le-script)
- [Après l'exécution](#après-lexécution)
- [Checklist de sécurité](#checklist-de-sécurité)

---

## 🚀 Script de sécurisation automatique

### Utilisation

```bash
# 1. Se placer à la racine du projet
cd /home/celia/laia-github-temp/laia-skin-nextjs

# 2. Exécuter le script
npx tsx scripts/security/secure-production.ts
```

### Ce que fait le script

1. **Génère des secrets sécurisés**
   - `JWT_SECRET` : Secret de 64 caractères pour les tokens d'authentification
   - `ENCRYPTION_KEY` : Clé de 64 caractères hex pour chiffrer les données sensibles (IBAN, BIC)
   - `CRON_SECRET` : Secret pour sécuriser les tâches automatiques

2. **Crée le fichier `.env.production.example`**
   - Template complet avec tous les paramètres
   - Commentaires et instructions pour chaque variable
   - Checklist de déploiement intégrée

3. **Détecte et change les mots de passe faibles**
   - Scan de la base de données pour détecter :
     - `admin123`
     - `SuperAdmin123!` / `SuperAdmin2024!`
     - `client123`, `test123`, `password123`
     - `compta123`, `compta2024`
     - `employe123`
   - Génère automatiquement des mots de passe forts (16 caractères)
   - Sauvegarde les nouveaux mots de passe dans `NEW_PASSWORDS.txt`

4. **Génère un rapport de sécurité complet**
   - Actions effectuées
   - Checklist avant production
   - Actions critiques post-déploiement
   - Planning de maintenance

---

## 📁 Fichiers générés

Après l'exécution du script, vous trouverez :

### 1. `.env.production.example` (racine du projet)
Template de configuration pour la production.

**Actions requises :**
```bash
# Copier le template
cp .env.production.example .env.production

# Éditer et remplir toutes les valeurs
nano .env.production  # ou vim, code, etc.
```

### 2. `NEW_PASSWORDS.txt` (si des mots de passe faibles ont été détectés)
Liste des nouveaux mots de passe générés.

**⚠️ IMPORTANT :**
- Distribuez ces mots de passe de manière SÉCURISÉE (email chiffré, gestionnaire de mots de passe, etc.)
- **SUPPRIMEZ ce fichier immédiatement après distribution**
- Les utilisateurs doivent changer leur mot de passe au premier login

```bash
# Après distribution, SUPPRIMER le fichier
rm scripts/security/NEW_PASSWORDS.txt
```

### 3. `SECURITY_REPORT.md`
Rapport complet de sécurité avec checklist.

---

## 🔒 Après l'exécution

### Étape 1 : Configurer l'environnement de production

```bash
# 1. Copier le template
cp .env.production.example .env.production

# 2. Compléter toutes les valeurs
nano .env.production
```

**Variables critiques à configurer :**
- `DATABASE_URL` et `DIRECT_URL` : Base de données de production
- `STRIPE_SECRET_KEY` : Clé Stripe en mode **LIVE** (sk_live_...)
- `STRIPE_WEBHOOK_SECRET` : Secret webhook de production
- `RESEND_API_KEY` : Clé API Resend de production
- `WHATSAPP_ACCESS_TOKEN` : Token WhatsApp renouvelé

### Étape 2 : Distribuer les nouveaux mots de passe

Si le fichier `NEW_PASSWORDS.txt` a été généré :

1. **Lire le fichier de manière sécurisée**
   ```bash
   cat scripts/security/NEW_PASSWORDS.txt
   ```

2. **Communiquer les mots de passe via un canal sécurisé**
   - Email chiffré (ProtonMail, etc.)
   - Gestionnaire de mots de passe partagé (1Password, Bitwarden)
   - Message sécurisé (Signal, WhatsApp)
   - **JAMAIS par email non chiffré ou SMS**

3. **Supprimer le fichier**
   ```bash
   rm scripts/security/NEW_PASSWORDS.txt
   ```

### Étape 3 : Suivre la checklist

Ouvrir et suivre la checklist dans `SECURITY_REPORT.md` :

```bash
cat scripts/security/SECURITY_REPORT.md
```

---

## ✅ Checklist de sécurité (résumé)

### Avant le déploiement

- [ ] `.env.production` créé et complété
- [ ] `JWT_SECRET` unique et sécurisé configuré
- [ ] `ENCRYPTION_KEY` sauvegardé dans un coffre-fort
- [ ] Tous les mots de passe par défaut changés
- [ ] Clés Stripe en mode PRODUCTION (sk_live_)
- [ ] Domaine email vérifié dans Resend
- [ ] Webhooks configurés avec l'URL de production
- [ ] Base de données de production avec sauvegardes
- [ ] Sentry configuré pour le monitoring
- [ ] Rate limiting activé (Upstash Redis)

### Après le déploiement

- [ ] Tester un flux complet (inscription, paiement, email)
- [ ] Vérifier que tous les services fonctionnent
- [ ] Surveiller les logs d'erreurs (Sentry)
- [ ] Former les utilisateurs aux nouveaux mots de passe
- [ ] Configurer les alertes (Vercel, Stripe, Sentry)

### Maintenance mensuelle

- [ ] Renouveler les tokens API avant expiration
- [ ] Vérifier les sauvegardes
- [ ] Auditer les logs de sécurité
- [ ] Tester la restauration depuis sauvegarde

---

## 🆘 En cas de problème

### Mot de passe oublié

Utiliser le script de réinitialisation :
```bash
npx tsx scripts/reset-password.ts EMAIL_UTILISATEUR NOUVEAU_MOT_DE_PASSE
```

### Secret perdu

Si vous avez perdu `ENCRYPTION_KEY` ou `JWT_SECRET` :
1. **NE PAS** générer un nouveau sans réfléchir
2. Vérifier les sauvegardes de `.env.production`
3. Vérifier votre gestionnaire de secrets (Vercel, etc.)
4. En dernier recours, contacter le support

### Données chiffrées inaccessibles

Si `ENCRYPTION_KEY` est perdu, les IBAN/BIC chiffrés seront **définitivement perdus**.
**Solution** : Toujours sauvegarder `ENCRYPTION_KEY` dans un coffre-fort sécurisé.

---

## 📚 Documentation supplémentaire

- [Guide de sécurité LAIA](../../docs/security.md)
- [Configuration Stripe](../../docs/stripe-setup.md)
- [Configuration Email](../../docs/email-setup.md)
- [Chiffrement des données](../../docs/encryption.md)

---

## 🔐 Bonnes pratiques

1. **Jamais committer de secrets**
   - `.env.production` est dans `.gitignore`
   - Utiliser des variables d'environnement sur Vercel

2. **Rotation des secrets**
   - JWT_SECRET : Annuel ou après incident
   - Tokens API : Avant expiration (30-60 jours)
   - Mots de passe : Tous les 90 jours pour les admins

3. **2FA obligatoire**
   - Activer 2FA pour tous les super admins
   - Utiliser Google Authenticator ou Authy

4. **Monitoring**
   - Configurer des alertes Sentry
   - Surveiller les logs d'audit quotidiennement
   - Backup automatique quotidien

---

**Généré par le script de sécurisation LAIA**
**Version 1.0 - ${new Date().toLocaleDateString('fr-FR')}**
