# 🚀 Guide étape par étape : Migration vers Supabase

## 📋 Ce dont vous avez besoin :
- Un compte email
- 5 minutes de votre temps
- C'est tout !

---

## 🔷 Étape 1 : Créer votre compte Supabase (2 min)

1. **Allez sur** : https://supabase.com
2. **Cliquez sur** : "Start your project" (bouton vert)
3. **Connectez-vous avec** : GitHub, Google ou Email
4. **C'est fait !** ✅

---

## 🔷 Étape 2 : Créer votre projet (2 min)

1. **Cliquez sur** : "New project"
2. **Remplissez** :
   - **Name** : `laia-skin`
   - **Database Password** : Choisissez un mot de passe fort (NOTEZ-LE !)
   - **Region** : `West EU (Paris)` pour la France
   - **Plan** : Free (0€/mois)

3. **Cliquez sur** : "Create new project"
4. **Attendez** : 1-2 minutes que le projet se crée

---

## 🔷 Étape 3 : Récupérer vos identifiants (1 min)

### Une fois le projet créé :

1. **Allez dans** : ⚙️ Settings (menu gauche)
2. **Cliquez sur** : Database
3. **Copiez** : Connection string > URI

Ça ressemble à :
```
postgresql://postgres:VotreMotDePasse@db.abcdefghijk.supabase.co:5432/postgres
```

### ⚠️ IMPORTANT : Remplacez `[YOUR-PASSWORD]` par votre vrai mot de passe !

---

## 🔷 Étape 4 : Configurer votre projet Next.js

### 1. Créez le fichier `.env.local` :
```bash
# Copiez ceci dans .env.local
DATABASE_URL="postgresql://postgres:VotreMotDePasse@db.abcdefghijk.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:VotreMotDePasse@db.abcdefghijk.supabase.co:5432/postgres"

# Gardez vos autres variables
JWT_SECRET="votre_secret_jwt_actuel"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Activez PostgreSQL dans Prisma :
```bash
# Copiez le schema PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

### 3. Créez les tables dans Supabase :
```bash
# Cette commande va créer toutes vos tables
npx prisma db push
```

### 4. (Optionnel) Ajoutez des données de test :
```bash
npm run seed
```

---

## 🔷 Étape 5 : Configurer Vercel

### Dans votre dashboard Vercel :

1. **Allez dans** : Your Project > Settings > Environment Variables
2. **Ajoutez ces variables** :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Votre URL PostgreSQL Supabase |
| `JWT_SECRET` | Un secret sécurisé (générez-en un) |
| `NEXT_PUBLIC_API_URL` | https://votre-site.vercel.app |

3. **Cliquez sur** : Save
4. **Redéployez** : Deployments > Redeploy

---

## ✅ Vérification

### Local :
```bash
# Testez la connexion
npx prisma db pull

# Si ça marche, lancez le site
npm run dev
```

### Production :
Votre site sur Vercel devrait maintenant fonctionner avec Supabase !

---

## 🆘 Problèmes courants

### "Connection refused"
→ Vérifiez le mot de passe dans DATABASE_URL

### "Database does not exist"
→ Attendez que Supabase finisse de créer le projet (2-3 min)

### "Invalid prisma schema"
→ Utilisez bien `prisma/schema.postgresql.prisma`

### Vercel ne fonctionne pas
→ Vérifiez les Environment Variables dans Vercel

---

## 📊 Bonus : Visualiser vos données

### Dans Supabase :
- **Table Editor** : Pour voir/éditer vos données
- **SQL Editor** : Pour des requêtes SQL
- **Logs** : Pour débugger

### Dans votre projet :
```bash
npx prisma studio
# Ouvre une interface web sur http://localhost:5555
```

---

## 🎉 C'est fait !

Votre site utilise maintenant PostgreSQL avec Supabase :
- ✅ Gratuit jusqu'à 500 MB
- ✅ Sauvegardes automatiques
- ✅ Compatible Vercel
- ✅ Scalable à l'infini

---

## 📞 Besoin d'aide ?

1. Documentation Supabase : https://supabase.com/docs
2. Documentation Prisma : https://www.prisma.io/docs
3. Discord Supabase : https://discord.supabase.com