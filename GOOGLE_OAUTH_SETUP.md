# Configuration Google OAuth pour LAIA Connect

## ✅ Statut de l'implémentation

**Déjà fait** :
- ✅ NextAuth.js installé (v4.24.13)
- ✅ @next-auth/prisma-adapter installé (v1.0.7)
- ✅ Schema Prisma mis à jour avec les tables NextAuth (Account, Session, VerificationToken)
- ✅ API route `/api/auth/[...nextauth]/route.ts` créée
- ✅ Configuration NextAuth dans `/lib/nextauth.ts`
- ✅ Types TypeScript étendus pour NextAuth
- ✅ Bouton Google Sign-In fonctionnel dans `/onboarding-shopify`

**À faire** :
1. Créer un projet Google Cloud et configurer OAuth
2. Ajouter les credentials dans `.env.local`
3. Exécuter `npx prisma db push` pour créer les tables en BDD
4. Tester la connexion Google

---

## 📋 Prérequis

- Compte Google Cloud Console
- Accès à la base de données Supabase

---

## 1️⃣ Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet **"LAIA Connect"**
3. Activez **Google+ API**

---

## 2️⃣ Configurer OAuth Consent Screen

1. Dans le menu, allez à **APIs & Services** → **OAuth consent screen**
2. Choisissez **External** (pour permettre aux utilisateurs externes de se connecter)
3. Remplissez :
   - **App name** : LAIA Connect
   - **User support email** : contact@laiaconnect.fr
   - **Logo** : (optionnel)
   - **App domain** : laiaconnect.fr
   - **Authorized domains** : laiaconnect.fr
   - **Developer contact** : contact@laiaconnect.fr
4. **Scopes** : Ajoutez les scopes suivants :
   - `email`
   - `profile`
   - `openid`
5. Cliquez sur **Save and Continue**

---

## 3️⃣ Créer les credentials OAuth

1. Allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choisissez **Web application**
4. Configurez :

   **Name** : LAIA Connect Web Client

   **Authorized JavaScript origins** :
   ```
   http://localhost:3001
   https://laiaconnect.fr
   https://www.laiaconnect.fr
   ```

   **Authorized redirect URIs** :
   ```
   http://localhost:3001/api/auth/callback/google
   https://laiaconnect.fr/api/auth/callback/google
   https://www.laiaconnect.fr/api/auth/callback/google
   ```

5. Cliquez sur **CREATE**
6. **Copiez CLIENT ID et CLIENT SECRET** ⚠️ Ne les partagez JAMAIS !

---

## 4️⃣ Ajouter les variables d'environnement

Ajoutez dans `.env.local` :

```bash
# Google OAuth
GOOGLE_CLIENT_ID=votre_client_id_ici.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret_ici

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<générez_avec_openssl_rand_base64_32>
```

Pour générer `NEXTAUTH_SECRET` :
```bash
openssl rand -base64 32
```

---

## 5️⃣ Mettre à jour la base de données

**IMPORTANT** : Avant de pouvoir tester, vous devez créer les tables NextAuth en base de données.

```bash
npx prisma db push
```

Cette commande va créer les tables suivantes :
- `Account` (pour stocker les tokens Google OAuth)
- `Session` (pour les sessions NextAuth)
- `VerificationToken` (pour la vérification d'email)

Elle va également mettre à jour le modèle `User` avec les champs :
- `emailVerified` (DateTime nullable)
- `image` (String nullable)
- `password` (maintenant nullable pour les connexions OAuth)

---

## 6️⃣ Tester

1. Lancez le serveur : `npm run dev`
2. Allez sur `/onboarding-shopify`
3. Cliquez sur **"Continuer avec Google"**
4. Autorisez LAIA Connect
5. Vous serez redirigé vers l'étape 2 de l'onboarding avec votre compte Google créé
6. Complétez les informations restantes (nom de l'institut, ville, etc.)
7. Choisissez votre plan et finalisez l'inscription

---

## ✅ Checklist finale

- [ ] Projet Google Cloud créé
- [ ] OAuth Consent Screen configuré
- [ ] Credentials OAuth créés
- [ ] Variables d'environnement ajoutées dans `.env.local`
- [x] API route NextAuth créée ✅
- [x] Prisma Adapter installé ✅
- [x] Schema Prisma mis à jour ✅
- [ ] Migration BDD effectuée (`npx prisma db push`)
- [x] Bouton Google mis à jour ✅
- [x] Types TypeScript étendus ✅
- [ ] Test réussi

---

## 🚀 En production

**Avant de déployer** :

1. Publiez l'app OAuth (Google Cloud Console → OAuth consent screen → Publish App)
2. Ajoutez les URLs de production dans **Authorized redirect URIs**
3. Mettez à jour `NEXTAUTH_URL` avec l'URL de production
4. **IMPORTANT** : Ne commitez JAMAIS `.env.local` dans Git !

---

## 📚 Documentation

- [NextAuth.js Docs](https://next-auth.js.org/)
- [Google OAuth Setup](https://next-auth.js.org/providers/google)
- [Prisma Adapter](https://next-auth.js.org/adapters/prisma)
