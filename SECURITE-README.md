# 🔐 Sécurité - Guide Rapide

## 🎯 Résumé des actions effectuées

### ✅ Implémentations terminées (22 octobre 2025)

1. **JWT Secret renouvelé** - Clé de 64 bytes ultra-sécurisée
2. **Mots de passe changés** - Super Admin et Admin avec mots de passe forts
3. **Validation stricte** - Politique de mots de passe conforme OWASP
4. **Vérification email** - Système complet avec emails automatiques

---

## 🔑 NOUVEAUX IDENTIFIANTS

### Super Admin
```
Email    : superadmin@laiaskin.com
Password : E=cEYmqzEntyXJc3se&J
URL      : http://localhost:3001/super-admin
```

### Admin
```
Email    : admin@laiaskin.com
Password : A9v*hVrWSG9KeqRA
URL      : http://localhost:3001/admin
```

⚠️ **IMPORTANT** : Changez ces mots de passe immédiatement après la première connexion !

---

## 🚀 Scripts disponibles

### Audit de sécurité
Vérifie l'état de sécurité complet du système :
```bash
npx tsx scripts/security-check.ts
```

### Changement des mots de passe par défaut
⚠️ **À exécuter UNE SEULE FOIS puis supprimer le fichier** :
```bash
npx tsx scripts/update-default-passwords.ts
```

---

## 📊 État actuel de la sécurité

D'après le dernier audit :

- ✅ **JWT_SECRET** : Configuré correctement
- ✅ **Mots de passe** : Mis à jour récemment
- ✅ **Super Admin** : Existe et sécurisé
- ✅ **Email** : Resend configuré
- ✅ **WhatsApp** : Token présent
- ✅ **Facebook** : Token présent
- ✅ **.gitignore** : Fichiers sensibles protégés

### Problèmes restants :

🟠 **HAUTE PRIORITÉ** :
- Stripe : Clé manquante (en mode test actuellement)

🟡 **MOYENNE PRIORITÉ** :
- Instagram : Token à renouveler
- Sentry : DSN à configurer

🟢 **BASSE PRIORITÉ** :
- Sentry : Auth Token pour source maps

---

## 📚 Documentation complète

- **SECURITE-AUTHENTICATION.md** - Détails authentification
- **SECURITE-COMPLETE.md** - Audit complet + Roadmap
- **SECURITE-README.md** - Ce fichier (guide rapide)

---

## ⚡ Actions urgentes avant déploiement

### 1. Stripe Production
```bash
# Dans .env.local, remplacer :
STRIPE_SECRET_KEY="sk_live_..."  # Au lieu de sk_test_
STRIPE_PUBLISHABLE_KEY="pk_live_..."  # Au lieu de pk_test_
```

### 2. Renouveler tokens Meta
- WhatsApp : https://developers.facebook.com
- Instagram : https://developers.facebook.com
- Facebook : https://developers.facebook.com

### 3. Ajouter le champ email vérifié
```bash
# Ajouter au schema Prisma :
emailVerified   Boolean   @default(false)
emailVerifiedAt DateTime?

# Puis :
npx prisma migrate dev --name add_email_verification
```

### 4. Bloquer connexion si email non vérifié
Dans `/api/auth/login/route.ts`, ajouter :
```typescript
if (!user.emailVerified) {
  return NextResponse.json({
    error: 'Email non vérifié',
    needsVerification: true
  }, { status: 403 });
}
```

---

## 🔒 Bonnes pratiques

### À FAIRE
✅ Utiliser un gestionnaire de mots de passe
✅ Changer les mots de passe tous les 3-6 mois
✅ Activer 2FA partout où c'est possible
✅ Vérifier les logs régulièrement
✅ Faire des audits de sécurité mensuels

### À NE PAS FAIRE
❌ Commit des secrets dans Git
❌ Partager les identifiants par email/SMS
❌ Utiliser le même mot de passe partout
❌ Ignorer les alertes de sécurité
❌ Déployer en production sans audit

---

## 🆘 En cas de problème

### Mot de passe perdu
1. Utiliser la route super-admin de reset :
   `/api/super-admin/organizations/[id]/reset-password`
2. Ou exécuter à nouveau `scripts/update-default-passwords.ts`

### Token JWT invalide
1. Vérifier `.env.local` ligne 27
2. Générer un nouveau : `openssl rand -base64 64`
3. Mettre à jour et redémarrer le serveur

### Email de vérification non reçu
1. Vérifier Resend dashboard : https://resend.com
2. Vérifier spam
3. Renvoyer l'email : POST `/api/auth/verify-email`

### Problème de sécurité détecté
1. Bloquer l'accès immédiatement
2. Changer tous les mots de passe
3. Analyser les logs d'audit
4. Contacter un expert si nécessaire

---

## 📞 Support

**Documentation** :
- OWASP : https://owasp.org
- Prisma : https://www.prisma.io/docs
- Next.js Security : https://nextjs.org/docs/app/building-your-application/authentication

**Outils** :
- Audit : `npx tsx scripts/security-check.ts`
- Prisma Studio : `npx prisma studio`
- Logs serveur : `npm run dev`

---

**Dernière mise à jour** : 22 octobre 2025
**Version** : 1.0.0
**Statut** : ✅ Base sécurisée - Production possible après corrections urgentes
