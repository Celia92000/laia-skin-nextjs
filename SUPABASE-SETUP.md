# 🚀 Configuration Supabase pour LAIA SKIN

## 📋 Étapes pour migrer vers Supabase

### 1. Créer un nouveau projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **Anon Key** : `eyJhbGc...`
   - **Database Password** : Votre mot de passe

### 2. Récupérer l'URL de connexion
Dans Supabase Dashboard :
- Settings → Database
- Connection string → URI
- Copiez l'URL qui ressemble à :
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
  ```

### 3. Configurer les variables d'environnement

Créez un fichier `.env.production` :
```env
# Database PostgreSQL Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

### 4. Modifier le schema.prisma
```prisma
datasource db {
  provider = "postgresql"  // Changer de "sqlite" à "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Ajouter cette ligne
}
```

### 5. Migrer le schéma
```bash
# Générer la migration
npx prisma migrate dev --name init_supabase

# Ou si vous voulez juste pousser le schéma
npx prisma db push
```

### 6. Importer les données
```bash
# Utiliser le script d'import
npx tsx prisma/import-to-supabase.ts
```

## 📊 Données à migrer

Votre base contient actuellement :
- **9 services** (Hydro'Naissance, Renaissance, BB Glow, etc.)
- **2 utilisateurs** (admin et client test)
- **4 articles de blog**
- **0 réservations**

## 🔐 Variables pour Vercel

Dans Vercel Dashboard → Settings → Environment Variables :

```
DATABASE_URL = postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
```

## ⚠️ Important
- Remplacez `[YOUR-PASSWORD]` par votre mot de passe Supabase
- Remplacez `xxxxx` par votre ID de projet
- Le port 6543 est pour le pooling (production)
- Le port 5432 est pour les migrations

## 🎯 Commandes utiles

```bash
# Tester la connexion
npx prisma db pull

# Voir les données
npx prisma studio

# Réinitialiser (ATTENTION : supprime tout)
npx prisma migrate reset
```