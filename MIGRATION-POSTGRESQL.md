# 🚀 Migration vers PostgreSQL pour Vercel

## Étape 1 : Créer une base de données PostgreSQL gratuite

### Option A : Supabase (Recommandé)
1. Aller sur https://supabase.com
2. Créer un compte gratuit
3. Créer un nouveau projet
4. Copier l'URL de connexion depuis Settings > Database

### Option B : Neon
1. Aller sur https://neon.tech
2. Créer un compte gratuit  
3. Créer une base de données
4. Copier l'URL de connexion

## Étape 2 : Mettre à jour Prisma

```bash
# 1. Installer le driver PostgreSQL
npm install @prisma/client prisma --save-dev

# 2. Modifier prisma/schema.prisma
```

Remplacer :
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Par :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Étape 3 : Configurer les variables d'environnement

### Dans `.env.local` (développement) :
```env
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require"
```

### Dans Vercel (production) :
1. Aller dans Settings > Environment Variables
2. Ajouter `DATABASE_URL` avec l'URL de votre base PostgreSQL
3. Ajouter `JWT_SECRET` avec une clé sécurisée

## Étape 4 : Migrer les données

```bash
# 1. Générer les migrations
npx prisma migrate dev --name init

# 2. Pousser le schéma vers PostgreSQL
npx prisma db push

# 3. (Optionnel) Seed les données initiales
npm run seed
```

## Étape 5 : Déployer sur Vercel

```bash
# 1. Commit les changements
git add .
git commit -m "Migration vers PostgreSQL"

# 2. Push vers GitHub
git push origin main

# Vercel va automatiquement déployer
```

## Variables d'environnement à configurer dans Vercel :

```
DATABASE_URL=postgresql://...
JWT_SECRET=votre_secret_jwt_securise
NEXT_PUBLIC_API_URL=https://votre-domaine.vercel.app
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

## Script de migration des données SQLite vers PostgreSQL

```bash
# Si vous avez des données existantes dans SQLite :
npx prisma db pull --schema=./prisma/sqlite.schema.prisma
npx prisma db push
# Puis utiliser un outil comme pgloader pour migrer les données
```

## Commandes utiles :

```bash
# Vérifier la connexion
npx prisma db pull

# Visualiser les données
npx prisma studio

# Reset la base (attention!)
npx prisma migrate reset
```

## Support gratuit PostgreSQL :

- **Supabase** : 500 MB gratuit, inclut auth + realtime
- **Neon** : 3 GB gratuit, serverless  
- **Railway** : 500 MB gratuit, simple
- **Aiven** : 1 mois gratuit
- **ElephantSQL** : 20 MB gratuit (petit mais suffisant pour démarrer)

## Besoin d'aide ?

1. Vérifier les logs Vercel : `vercel logs`
2. Tester la connexion : `npx prisma db pull`
3. Vérifier les variables : `vercel env pull`