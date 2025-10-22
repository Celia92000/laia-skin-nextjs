# 🔐 Sécurité - Authentification

## ✅ Implémentations terminées

### 1. JWT Secret renouvelé
- **Ancien** : `k7FwPXgH9Zv3mN2qR5tU8yB4xC1aD6eJ0fL9sW2kH7g=` (32 bytes)
- **Nouveau** : `C3pDpi7Z8YPGH5iBPoT10GnxsBKaC8mIzxJ+10g/1q2NwBLk7YSR2JXPfoIVDLtBvzsPZjw/NDlFVev8oH3kiA==` (64 bytes)
- **Fichier** : `.env.local` (ligne 27)

⚠️ **IMPORTANT** : Ne jamais commit ce secret dans Git !

---

### 2. Mots de passe par défaut changés

#### Nouveaux identifiants (NOTEZ-LES MAINTENANT !) :

**Super Admin** :
- Email : `superadmin@laiaskin.com`
- Mot de passe : `E=cEYmqzEntyXJc3se&J`
- URL : http://localhost:3001/super-admin

**Admin** (à créer manuellement si besoin) :
- Email : `admin@laiaskin.com`
- Mot de passe : `A9v*hVrWSG9KeqRA`
- URL : http://localhost:3001/admin

**Clients** :
- 46 clients doivent changer leur mot de passe à la prochaine connexion

#### Script utilisé :
- Fichier : `scripts/update-default-passwords.ts`
- Commande : `npx tsx scripts/update-default-passwords.ts`

⚠️ **IMPORTANT** : Supprimez ce script après utilisation pour des raisons de sécurité

---

### 3. Validation de mots de passe forts

#### Politique de sécurité stricte :
- **Minimum 12 caractères**
- Au moins 1 majuscule (A-Z)
- Au moins 1 minuscule (a-z)
- Au moins 1 chiffre (0-9)
- Au moins 1 caractère spécial (!@#$%&*...)
- Interdiction des mots de passe courants (password123, admin, etc.)
- Interdiction d'utiliser nom ou email
- Détection des patterns répétitifs (aaa, 123)

#### Fichiers modifiés :
- `src/lib/password-validation.ts` (nouveau) - Utilitaire de validation
- `src/app/api/auth/register/route.ts` - Inscription
- `src/app/api/user/change-password/route.ts` - Changement utilisateur
- `src/app/api/admin/change-password/route.ts` - Changement admin

#### Fonctionnalités :
- Score de force (0-100)
- Messages d'erreur détaillés
- Suggestions d'amélioration
- Estimation du temps de crack
- Validation en temps réel

---

### 4. Vérification email obligatoire

#### Implémentation :
- Email automatique envoyé à l'inscription
- Token JWT de vérification (valide 24h)
- Page de vérification dédiée
- Possibilité de renvoyer l'email

#### Fichiers créés :
- `src/lib/email-verification.ts` - Service de vérification
- `src/app/api/auth/verify-email/route.ts` - API
- `src/app/(site)/auth/verify-email/page.tsx` - Page de vérification

#### Fonctionnalités :
- Email HTML professionnel avec le branding LAIA
- Lien de vérification unique par utilisateur
- Expiration automatique après 24h
- Protection contre les tokens réutilisés
- Redirection automatique après vérification

---

## 📋 Prochaines étapes recommandées

### Priorité HAUTE :
1. **Ajouter le champ `emailVerified` au schema Prisma**
   ```prisma
   model User {
     // ... autres champs
     emailVerified  Boolean   @default(false)
     emailVerifiedAt DateTime?
   }
   ```

2. **Bloquer la connexion si email non vérifié**
   - Modifier `/api/auth/login/route.ts`
   - Vérifier `user.emailVerified === true`

3. **Renouveler les tokens API externes**
   - WhatsApp : EXPIRÉ
   - Instagram : Expire le 16 décembre 2025
   - Facebook : Expire le 11 décembre 2025

4. **Passer Stripe en mode PRODUCTION**
   - Remplacer `sk_test_*` par `sk_live_*`
   - Remplacer `pk_test_*` par `pk_live_*`
   - Configurer les webhooks en production

### Priorité MOYENNE :
5. **Implémenter le rate limiting**
   - Protection contre les attaques par force brute
   - Limiter les tentatives de connexion (5 max / 15 min)
   - Utiliser Upstash Redis (déjà configuré)

6. **Authentification à deux facteurs (2FA)**
   - Via SMS ou app authenticator
   - Obligatoire pour super-admin
   - Optionnel pour admin

7. **Logs d'audit de sécurité**
   - Tracer toutes les connexions
   - Détecter les connexions suspectes
   - Alertes en temps réel

### Priorité BASSE :
8. **Session management avancé**
   - Déconnexion de tous les appareils
   - Liste des sessions actives
   - Blocage d'appareils suspects

9. **Password breach detection**
   - Vérifier contre Have I Been Pwned
   - Forcer changement si compromis

10. **Captcha sur inscription/connexion**
    - Protection contre les bots
    - hCaptcha ou reCAPTCHA v3

---

## 🧪 Tests à effectuer

### Tests manuels :
- [ ] S'inscrire avec un mot de passe faible → doit être refusé
- [ ] S'inscrire avec un mot de passe fort → doit fonctionner
- [ ] Vérifier réception de l'email de vérification
- [ ] Cliquer sur le lien de vérification → doit réussir
- [ ] Tenter de se connecter avec ancien mot de passe admin → doit échouer
- [ ] Se connecter avec nouveau mot de passe super-admin → doit fonctionner
- [ ] Changer de mot de passe avec un faible → doit être refusé
- [ ] Changer de mot de passe avec un fort → doit fonctionner

### Tests de sécurité :
- [ ] Token de vérification expiré → doit être refusé
- [ ] Token manipulé → doit être refusé
- [ ] Double utilisation du même token → doit être refusé
- [ ] Tentative de vérification d'un autre utilisateur → doit échouer

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `console.log` dans les routes API
2. Vérifier les emails dans Resend dashboard
3. Tester les tokens JWT sur https://jwt.io
4. Vérifier la base de données avec Prisma Studio : `npx prisma studio`

---

## 🔒 Bonnes pratiques

### À FAIRE :
✅ Utiliser un gestionnaire de mots de passe (1Password, Bitwarden, etc.)
✅ Changer les mots de passe tous les 3-6 mois
✅ Utiliser des mots de passe différents pour chaque service
✅ Activer 2FA partout où c'est possible
✅ Ne jamais partager vos identifiants

### À NE PAS FAIRE :
❌ Commit des mots de passe dans Git
❌ Stocker des mots de passe en clair
❌ Réutiliser le même mot de passe
❌ Noter les mots de passe sur papier/post-it
❌ Envoyer des mots de passe par email/SMS

---

---

## 🔍 AUDIT AUTOMATIQUE

Un script de vérification automatique est disponible :

```bash
npx tsx scripts/security-check.ts
```

Ce script vérifie :
- JWT_SECRET
- Tokens API (WhatsApp, Instagram, Facebook)
- Mode Stripe (test/production)
- Configuration Sentry
- Fichiers de sécurité
- .gitignore

**Score actuel** : 56/100 ⚠️

**Points critiques identifiés** :
- ❌ WhatsApp Token EXPIRÉ
- ⚠️  Stripe en mode TEST
- ⚠️  Sentry non configuré

---

**Date de mise à jour** : 22 octobre 2025
**Effectué par** : Claude Code
**Statut** : ✅ BASE SÉCURISÉE - Améliorations nécessaires
**Prochain audit** : Après renouvellement tokens API
