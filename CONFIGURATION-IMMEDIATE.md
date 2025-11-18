# ⚡ Configuration immédiate

## 1️⃣ Remplacez votre mot de passe dans ce texte :

```bash
# Copiez tout ce bloc dans .env.local
# REMPLACEZ [VOTRE-MOT-DE-PASSE] par votre vrai mot de passe Supabase

DATABASE_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.zsxweurvtsrdgehtadwa.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.zsxweurvtsrdgehtadwa.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://zsxweurvtsrdgehtadwa.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeHdldXJ2dHNyZGdlaHRhZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mzg0MjMsImV4cCI6MjA3MzIxNDQyM30.u-k1rK9n-ld0VIDVaSB8OnnvCMxTQVMzUNbrJFqcqrg"

# Gardez vos autres variables existantes ci-dessous
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret_key_here_change_in_production
# ... etc
```

## 2️⃣ Exécutez ces commandes :

```bash
# 1. Activer PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# 2. Créer les tables dans Supabase
npx prisma db push

# 3. (Optionnel) Ajouter des données de test
npm run seed

# 4. Relancer le serveur
npm run dev
```

## 3️⃣ Vérification :

Si tout fonctionne, vous verrez :
```
✓ Your database is now in sync with your Prisma schema
```

## ❌ Si erreur "password authentication failed" :

→ Le mot de passe est incorrect. Dans Supabase :
1. Settings > Database
2. Reset database password
3. Utilisez le nouveau mot de passe

## ✅ Une fois que ça marche localement :

### Pour Vercel :
1. Allez dans votre projet Vercel
2. Settings > Environment Variables
3. Ajoutez :
   - `DATABASE_URL` = votre URL complète avec mot de passe
   - `JWT_SECRET` = générez un secret sécurisé
   - `NEXT_PUBLIC_SUPABASE_URL` = https://zsxweurvtsrdgehtadwa.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clé ci-dessus

4. Redéployez