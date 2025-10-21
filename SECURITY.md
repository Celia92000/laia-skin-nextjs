# 🔐 Guide de Sécurité - LAIA Platform

**Dernière mise à jour** : ${new Date().toLocaleDateString('fr-FR')}
**Version** : 1.0

---

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Avant la mise en production](#avant-la-mise-en-production)
3. [Sécurisation automatique](#sécurisation-automatique)
4. [Chiffrement des données bancaires](#chiffrement-des-données-bancaires)
5. [Gestion des mots de passe](#gestion-des-mots-de-passe)
6. [Configuration production](#configuration-production)
7. [Maintenance](#maintenance)
8. [En cas de problème](#en-cas-de-problème)

---

## 🎯 Introduction

Ce guide décrit les mesures de sécurité mises en place pour protéger la plateforme LAIA et les données de vos clients.

### Principes de sécurité

- **Chiffrement fort** : AES-256-GCM pour les données bancaires
- **Mots de passe sécurisés** : Minimum 16 caractères avec complexité élevée
- **Secrets uniques** : JWT_SECRET et ENCRYPTION_KEY générés aléatoirement
- **Audit complet** : Tous les changements sont tracés
- **Isolation** : Multi-tenant avec séparation stricte des données

---

## ⚠️ Avant la mise en production

### Checklist de sécurité critique

- [ ] **Sauvegarder la base de données**
  ```bash
  # Via Supabase Dashboard ou pg_dump
  ```

- [ ] **Exécuter le script de sécurisation**
  ```bash
  npx tsx scripts/security/secure-production.ts
  ```

- [ ] **Chiffrer les données bancaires**
  ```bash
  npx tsx --env-file=.env.local scripts/security/encrypt-banking-data.ts
  ```

- [ ] **Vérifier les variables d'environnement**
  - JWT_SECRET unique
  - ENCRYPTION_KEY sauvegardée dans un coffre-fort
  - Clés Stripe en mode PRODUCTION (sk_live_)
  - Domaine email vérifié

- [ ] **Changer tous les mots de passe par défaut**
  - Le script de sécurisation le fait automatiquement
  - Distribuer les nouveaux mots de passe de manière sécurisée

---

## 🚀 Sécurisation automatique

### Script principal : `secure-production.ts`

Ce script automatise la sécurisation complète de l'application.

```bash
# Exécution
cd /home/celia/laia-github-temp/laia-skin-nextjs
npx tsx scripts/security/secure-production.ts
```

### Ce que fait le script

1. **Génère des secrets sécurisés**
   - `JWT_SECRET` : 64 caractères aléatoires (base64)
   - `ENCRYPTION_KEY` : 32 bytes (64 caractères hex)
   - `CRON_SECRET` : 32 caractères aléatoires

2. **Crée `.env.production.example`**
   - Template complet avec tous les paramètres
   - Documentation intégrée
   - Checklist de déploiement

3. **Change les mots de passe faibles**
   - Détecte : admin123, test123, client123, etc.
   - Génère : Mots de passe de 16 caractères complexes
   - Sauvegarde : Dans `scripts/security/NEW_PASSWORDS.txt`

4. **Génère un rapport**
   - `scripts/security/SECURITY_REPORT.md`
   - Statistiques complètes
   - Actions post-déploiement

### Fichiers générés

```
.env.production.example          # Template de configuration
scripts/security/
  ├── NEW_PASSWORDS.txt          # ⚠️ Supprimer après distribution
  ├── SECURITY_REPORT.md         # Rapport détaillé
  ├── README.md                  # Documentation
  └── secure-production.ts       # Script source
```

### Actions requises après exécution

1. **Lire le rapport**
   ```bash
   cat scripts/security/SECURITY_REPORT.md
   ```

2. **Distribuer les nouveaux mots de passe**
   - Email chiffré (ProtonMail)
   - Gestionnaire de mots de passe (1Password, Bitwarden)
   - **JAMAIS** par email non chiffré

3. **SUPPRIMER le fichier des mots de passe**
   ```bash
   rm scripts/security/NEW_PASSWORDS.txt
   ```

4. **Configurer l'environnement de production**
   ```bash
   cp .env.production.example .env.production
   # Éditer et compléter toutes les valeurs
   ```

---

## 🔐 Chiffrement des données bancaires

### Service de chiffrement

Le service `/src/lib/encryption-service.ts` utilise **AES-256-GCM** pour un chiffrement fort et authentifié.

### Caractéristiques

- **Algorithme** : AES-256-GCM (Galois/Counter Mode)
- **Dérivation de clé** : PBKDF2 avec 100 000 itérations
- **Salt** : 64 bytes aléatoires par chiffrement
- **IV** : 16 bytes aléatoires par chiffrement
- **Tag d'authentification** : 16 bytes (garantit l'intégrité)

### Chiffrement des IBAN/BIC existants

```bash
# Test du service de chiffrement
npx tsx --env-file=.env.local scripts/security/encrypt-banking-data.ts --test

# Chiffrement réel des données
npx tsx --env-file=.env.local scripts/security/encrypt-banking-data.ts
```

### Ce que fait le script

1. Vérifie que `ENCRYPTION_KEY` est configurée
2. Scan toutes les organisations avec IBAN/BIC
3. Vérifie si déjà chiffré (évite double chiffrement)
4. Valide les IBAN/BIC avant chiffrement
5. Chiffre et teste le déchiffrement
6. Met à jour la base de données
7. Génère un rapport détaillé

### Utilisation dans le code

```typescript
import { encrypt, decrypt, maskIban, validateIban } from '@/lib/encryption-service'

// Chiffrer avant stockage
const encryptedIban = encrypt('FR7630006000011234567890189')
await prisma.organization.update({
  data: { iban: encryptedIban }
})

// Déchiffrer après récupération
const org = await prisma.organization.findUnique(...)
const plainIban = decrypt(org.iban)

// Masquer pour l'affichage
const maskedIban = maskIban(plainIban) // FR76 **** **** **** 0189
```

### ⚠️ Avertissements critiques

- **ENCRYPTION_KEY perdue = Données perdues définitivement**
- Sauvegarder `ENCRYPTION_KEY` dans :
  - Coffre-fort (1Password, LastPass)
  - Variables d'environnement Vercel/hébergeur
  - Document papier dans un coffre physique
- **JAMAIS** committer dans Git
- **JAMAIS** partager par email non chiffré

---

## 🔑 Gestion des mots de passe

### Mots de passe par défaut détectés et changés

Le script de sécurisation détecte et change automatiquement :

- `admin123`
- `SuperAdmin123!` / `SuperAdmin2024!`
- `client123`
- `test123`
- `password123`
- `compta123` / `compta2024`
- `employe123`

### Génération de mots de passe sécurisés

Tous les nouveaux mots de passe sont générés avec :

- **Longueur** : 16 caractères
- **Complexité** :
  - Au moins 1 majuscule
  - Au moins 1 minuscule
  - Au moins 1 chiffre
  - Au moins 1 symbole spécial
- **Aléatoire** : crypto.randomBytes() (cryptographiquement sûr)

### Distribution des mots de passe

**Bonnes pratiques** :

✅ **À FAIRE** :
- Email chiffré (ProtonMail, Tutanota)
- Gestionnaire de mots de passe partagé (1Password Teams)
- Message sécurisé (Signal, WhatsApp avec vérification)
- En personne si possible

❌ **À NE PAS FAIRE** :
- Email non chiffré
- SMS
- Chat non chiffré (Slack, Teams)
- Post-it / document Word
- Committer dans Git

### Changement de mot de passe forcé (TODO)

Pour une sécurité maximale, implémenter :

```typescript
// Dans le modèle User
model User {
  // ...
  mustChangePassword Boolean @default(false)
  passwordChangedAt DateTime?
}

// Dans l'API auth
if (user.mustChangePassword) {
  return { redirect: '/change-password', requireChange: true }
}
```

---

## ⚙️ Configuration production

### Variables d'environnement critiques

```bash
# Sécurité
JWT_SECRET="[64 caractères aléatoires]"
ENCRYPTION_KEY="[64 caractères hex]"
CRON_SECRET="[32 caractères aléatoires]"

# Base de données
DATABASE_URL="postgresql://... (pooled connection)"
DIRECT_URL="postgresql://... (direct connection)"

# Stripe PRODUCTION
STRIPE_SECRET_KEY="sk_live_..."  # ⚠️ PAS sk_test_
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="no-reply@votre-domaine.com"

# WhatsApp & Social Media
WHATSAPP_ACCESS_TOKEN="[Token renouvelé]"
FACEBOOK_PAGE_ACCESS_TOKEN="[Token longue durée]"
INSTAGRAM_ACCESS_TOKEN="[Token longue durée]"
```

### Configuration Vercel

1. **Variables d'environnement**
   - Ajouter toutes les variables dans le dashboard Vercel
   - Utiliser des environnements séparés (Production, Preview, Development)

2. **Webhooks**
   - Configurer les URLs de production :
     - Stripe : `https://votre-domaine.com/api/webhooks/stripe`
     - Resend : `https://votre-domaine.com/api/webhooks/resend`
     - WhatsApp : `https://votre-domaine.com/api/webhooks/whatsapp`

3. **Domaine**
   - Configurer le domaine personnalisé
   - Activer HTTPS automatique
   - Vérifier le domaine email (SPF, DKIM, DMARC)

---

## 🔄 Maintenance

### Rotation des secrets

| Secret | Fréquence | Procédure |
|--------|-----------|-----------|
| `JWT_SECRET` | Annuel ou après incident | Régénérer et redéployer |
| `ENCRYPTION_KEY` | ⚠️ JAMAIS | Perte = données perdues |
| Tokens API (WhatsApp, Facebook) | 30-60 jours | Renouveler dans Meta Dashboard |
| Mots de passe admins | 90 jours | Via interface admin |

### Sauvegardes

**Quotidien** :
```bash
# Base de données (via Supabase ou script)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Hebdomadaire** :
- Vérifier l'intégrité des sauvegardes
- Tester une restauration

**Mensuel** :
- Audit des logs de sécurité
- Vérification des accès
- Mise à jour des dépendances

### Monitoring

**Sentry** :
- Tracking des erreurs en temps réel
- Alertes pour erreurs critiques

**Vercel** :
- Monitoring des performances
- Alertes de disponibilité

**Audit Logs** :
- Révision mensuelle des actions super admin
- Détection d'anomalies

---

## 🚨 En cas de problème

### Mot de passe super admin oublié

```bash
# Réinitialiser avec un nouveau mot de passe sécurisé
npx tsx scripts/security/reset-superadmin-password.ts
```

### ENCRYPTION_KEY perdue

❌ **Impossible de récupérer les données chiffrées**

**Actions** :
1. Vérifier les sauvegardes de `.env.production`
2. Vérifier Vercel / hébergeur
3. Vérifier le coffre-fort (1Password, LastPass)
4. En dernier recours : Demander aux clients de re-saisir leurs IBAN/BIC

**Prévention** :
- Sauvegarder `ENCRYPTION_KEY` dans 3 endroits minimum
- Utiliser un gestionnaire de secrets d'entreprise

### Données bancaires compromises

1. **Révoquer immédiatement les accès**
2. **Changer `ENCRYPTION_KEY`**
   - ⚠️ Sauvegarder l'ancienne clé
   - Déchiffrer avec ancienne clé
   - Chiffrer avec nouvelle clé
3. **Notifier les autorités (CNIL si UE)**
4. **Informer les clients concernés** (RGPD)
5. **Audit complet de sécurité**

### Fuite de `JWT_SECRET`

1. **Générer un nouveau secret**
   ```bash
   openssl rand -base64 64
   ```
2. **Mettre à jour `.env.production`**
3. **Redéployer l'application**
4. **Déconnecter tous les utilisateurs** (tokens invalides)
5. **Audit des connexions récentes**

---

## 📞 Support & Contact

**En cas de problème de sécurité critique** :
- Email : security@laia.com
- Téléphone : [À configurer]
- Discord sécurisé : [À configurer]

**Documentation** :
- README : `/docs/README.md`
- Scripts de sécurité : `/scripts/security/README.md`
- Rapport de sécurité : `/scripts/security/SECURITY_REPORT.md`

---

## 📚 Ressources

**Bonnes pratiques** :
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Guide ANSSI](https://www.ssi.gouv.fr/)
- [RGPD](https://www.cnil.fr/fr/rgpd-de-quoi-parle-t-on)

**Outils recommandés** :
- 1Password / Bitwarden (gestionnaire mots de passe)
- Sentry (monitoring erreurs)
- Upstash Redis (rate limiting)
- ProtonMail (emails chiffrés)

---

**Ce document doit être mis à jour régulièrement**
**Dernière révision** : ${new Date().toLocaleDateString('fr-FR')}
**Prochaine révision** : Mensuelle

---

✅ **Votre application est maintenant sécurisée pour la production !**
