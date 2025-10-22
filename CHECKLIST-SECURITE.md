# ✅ Checklist Sécurité - LAIA

## 🎯 Avant de déployer en PRODUCTION

### Authentification & Mots de passe
- [x] JWT_SECRET renouvelé (64 bytes minimum)
- [x] Mot de passe Super Admin changé
- [x] Mot de passe Admin changé
- [x] Validation de mots de passe forts activée
- [x] Vérification email implémentée
- [ ] Champ `emailVerified` ajouté au schema Prisma
- [ ] Connexion bloquée si email non vérifié
- [ ] Rate limiting sur login (5 tentatives / 15 min)
- [ ] 2FA activé pour Super Admin

### Paiements
- [ ] ⚠️ **CRITIQUE** : Stripe en mode PRODUCTION (sk_live_)
- [ ] Webhooks Stripe configurés
- [ ] Tests de paiement réels effectués
- [ ] Gestion des remboursements testée
- [ ] 3D Secure activé

### Intégrations externes
- [ ] ⚠️ Token WhatsApp renouvelé
- [ ] ⚠️ Token Instagram renouvelé (expire 16/12/2025)
- [ ] ⚠️ Token Facebook renouvelé (expire 11/12/2025)
- [ ] Auto-renewal des tokens configuré
- [ ] Webhooks WhatsApp sécurisés

### Email
- [x] Resend API Key configurée
- [ ] Domaine vérifié dans Resend
- [ ] Templates emails testés
- [ ] Webhooks delivery status configurés

### Monitoring & Logs
- [ ] Sentry DSN configuré
- [ ] Sentry Auth Token configuré
- [ ] Logs d'audit activés
- [ ] Alertes erreurs critiques configurées
- [ ] Uptime monitoring actif

### Fichiers & Configuration
- [x] `.env.local` dans `.gitignore`
- [ ] `.env.production` créé et sécurisé
- [ ] Aucun secret dans le code
- [ ] Variables d'environnement Vercel configurées
- [ ] Backup de `.env` dans gestionnaire de mots de passe

### Base de données
- [ ] Backups automatiques configurés
- [ ] Chiffrement at-rest activé
- [ ] Accès limité par IP si possible
- [ ] Index de performance créés
- [ ] Plan de restore testé

### Tests de sécurité
- [ ] Audit de sécurité complet effectué (`npx tsx scripts/security-check.ts`)
- [ ] Tests de pénétration effectués
- [ ] Scan de vulnérabilités (npm audit)
- [ ] Review du code sensible
- [ ] Test de récupération après incident

---

## 🚨 Checklist déploiement IMMÉDIAT

### Avant de lancer le site :

1. **Stripe Production**
   ```bash
   # Vérifier .env.local
   grep "STRIPE_SECRET_KEY" .env.local
   # Doit commencer par sk_live_ et NON sk_test_
   ```

2. **Tokens Meta renouvelés**
   ```bash
   # Vérifier tokens
   grep "WHATSAPP_ACCESS_TOKEN" .env.local
   grep "INSTAGRAM_ACCESS_TOKEN" .env.local
   grep "FACEBOOK_PAGE_ACCESS_TOKEN" .env.local
   # Tous doivent être récents et valides
   ```

3. **Email verification obligatoire**
   ```typescript
   // Dans /api/auth/login/route.ts
   if (!user.emailVerified) {
     return NextResponse.json({ error: 'Email non vérifié' }, { status: 403 });
   }
   ```

4. **Audit final**
   ```bash
   npx tsx scripts/security-check.ts
   # Doit afficher 0 problème CRITIQUE et 0 problème HAUTE priorité
   ```

5. **Tests de connexion**
   - [ ] Super Admin peut se connecter
   - [ ] Admin peut se connecter
   - [ ] Client ne peut pas se connecter sans email vérifié
   - [ ] Email de vérification est bien reçu
   - [ ] Lien de vérification fonctionne

6. **Tests de paiement**
   - [ ] Paiement carte bancaire fonctionne
   - [ ] SEPA fonctionne
   - [ ] Webhooks Stripe reçus
   - [ ] Remboursement possible
   - [ ] Facture générée

---

## 🔄 Checklist maintenance MENSUELLE

- [ ] Vérifier expiration tokens Meta
- [ ] Renouveler tokens si < 15 jours
- [ ] Changer les mots de passe sensibles
- [ ] Exécuter audit de sécurité
- [ ] Vérifier logs d'audit
- [ ] Analyser tentatives de connexion échouées
- [ ] Mettre à jour dépendances npm
- [ ] Scanner vulnérabilités (`npm audit`)
- [ ] Vérifier backups base de données
- [ ] Tester plan de récupération

---

## 📊 Score de sécurité cible

### Minimum pour production : 80/100

**Répartition** :
- Authentication (20/20) - ✅ Fait
- Authorization (15/15) - ✅ Fait
- Data Protection (15/15) - ⚠️ Partiel (12/15)
- Monitoring (10/10) - ⚠️ Partiel (5/10)
- API Security (15/15) - ✅ Fait
- Infrastructure (15/15) - ⚠️ Partiel (10/15)
- Compliance (10/10) - ⚠️ Partiel (6/10)

**Score actuel estimé** : 70/100
**Actions prioritaires pour atteindre 80** :
1. Stripe production (+ 5 points)
2. Rate limiting (+ 3 points)
3. Sentry configuré (+ 2 points)

---

## 🎓 Formation équipe

Avant le lancement, s'assurer que :

- [ ] Toute l'équipe connaît les nouveaux mots de passe
- [ ] Procédure de reset password documentée
- [ ] Procédure en cas d'incident définie
- [ ] Contacts support disponibles
- [ ] Documentation mise à jour

---

## 📝 Notes importantes

⚠️ **Ne JAMAIS** :
- Commit `.env.local` dans Git
- Partager mots de passe par email/Slack
- Utiliser production pour tester
- Ignorer les alertes Sentry
- Déployer sans backup

✅ **TOUJOURS** :
- Tester en local d'abord
- Faire un backup avant changement
- Documenter les modifications
- Vérifier les logs après déploiement
- Avoir un plan de rollback

---

**Validé par** : _______________
**Date** : _______________
**Prêt pour production** : ⬜ OUI  ⬜ NON

**Problèmes bloquants restants** :
1. _______________________________
2. _______________________________
3. _______________________________
