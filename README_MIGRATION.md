# Guide de Migration vers Next.js + Supabase

## 🚀 État de la migration

### ✅ Complété
- Initialisation du projet Next.js avec TypeScript
- Configuration de Tailwind CSS avec thème personnalisé
- Installation des dépendances Supabase
- Structure de base (Header, Footer, Layout)
- Page d'accueil migrée
- Page des prestations migrée
- Configuration des polices (Playfair Display + Inter)
- Styles et couleurs de la marque

### 📝 À faire
1. **Configuration Supabase**
   - Créer un compte sur https://supabase.com
   - Créer un nouveau projet
   - Récupérer les clés API
   - Mettre à jour `.env.local`

2. **Pages à migrer**
   - `/reservation` - Système de réservation
   - `/login` - Connexion client
   - `/admin` - Dashboard administrateur
   - `/client` - Espace client
   - `/contact` - Page contact

3. **Base de données Supabase**
   - Créer les tables (users, appointments, services, availability)
   - Migrer les données depuis MongoDB
   - Configurer l'authentification
   - Mettre en place les RLS (Row Level Security)

4. **Fonctionnalités à implémenter**
   - Système d'authentification avec Supabase Auth
   - Gestion des réservations en temps réel
   - Dashboard admin avec statistiques
   - Système de fidélité
   - Envoi d'emails de confirmation

## 🔧 Configuration Supabase

### Étape 1: Créer un projet Supabase
1. Aller sur https://supabase.com
2. Créer un compte gratuit
3. Créer un nouveau projet "laia-skin-institut"
4. Noter l'URL et la clé anon

### Étape 2: Configuration des tables
```sql
-- Table des services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration INTEGER, -- en minutes
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des utilisateurs (extension de auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  phone TEXT,
  points_fidelite INTEGER DEFAULT 0,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réservations
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id),
  service_id UUID REFERENCES services(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'confirme',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des disponibilités
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slots JSONB,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Étape 3: Mettre à jour .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🚀 Lancement du projet

```bash
cd laia-skin-nextjs
npm run dev
```

Ouvrir http://localhost:3000

## 📦 Déploiement sur Vercel

1. Push le code sur GitHub
2. Connecter le repo à Vercel
3. Configurer les variables d'environnement
4. Déployer

## 🎨 Structure du projet

```
laia-skin-nextjs/
├── src/
│   ├── app/           # Pages Next.js (App Router)
│   ├── components/    # Composants réutilisables
│   ├── lib/          # Utilitaires et config
│   └── styles/       # Styles globaux
├── public/           # Assets statiques
└── .env.local       # Variables d'environnement
```

## 📚 Ressources utiles
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)