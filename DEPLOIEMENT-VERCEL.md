# 🚀 Guide de Déploiement sur Vercel

## Option 1: Via l'interface web Vercel (Recommandé)

1. **Aller sur** : https://vercel.com
2. **Se connecter** avec votre compte GitHub
3. **Importer le projet** depuis GitHub
4. **Configurer les variables d'environnement** dans Vercel :

### Variables à ajouter dans Vercel Dashboard:

```
# Base de données PostgreSQL Supabase
DATABASE_URL=postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.zsxweurvtsrdgehtadwa:%23SBxrx8kVc857Ed@aws-1-eu-west-3.pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zsxweurvtsrdgehtadwa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeHdldXJ2dHNyZGdlaHRhZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mzg0MjMsImV4cCI6MjA3MzIxNDQyM30.u-k1rK9n-ld0VIDVaSB8OnnvCMxTQVMzUNbrJFqcqrg

# WhatsApp Business
WHATSAPP_ACCESS_TOKEN=EAFWQV0qPjVQBPVbuyZAUDXzNy4nbeugYZBGrukyblA0AuA5L3zw5yGULmGJtbZCiRxI4a58h09M1IcbfyJ456TljbhpeTZBYAPdEv9o0ZAr4ZCr3fZC6pUf6e3ZAZC2FZCfgLBlvOJRtMdcFazy0UPZBHhIUlOOC1Md0CZCMAn81uhLMRi7tQYmgibBcfnUxyZA1n6O9xXQZDZD
WHATSAPP_PHONE_NUMBER_ID=672520675954185
WHATSAPP_BUSINESS_ACCOUNT_ID=1741901383229296
WHATSAPP_API_VERSION=v18.0

# WhatsApp (public pour le numéro)
NEXT_PUBLIC_WHATSAPP_NUMBER=+33683717050

# Email (Resend)
RESEND_API_KEY=re_V6LwqpBo_9JHBZkgq6vuvGVT12hk9C2aY
EMAIL_FROM=contact@laiaskin.fr

# Sécurité
JWT_SECRET=your_jwt_secret_key_here_change_in_production
CRON_SECRET=laia_skin_cron_secret_2025

# Analytics (optionnel)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=YOUR_PIXEL_ID
```

5. **Cliquer sur Deploy**

## Option 2: Via CLI (si vous préférez)

```bash
# Se connecter à Vercel
npx vercel login

# Déployer
npx vercel

# Suivre les instructions:
# - Link to existing project? No
# - What's your project name? laia-skin-nextjs
# - In which directory is your code? ./
# - Want to override the settings? No
```

## ✅ Après le déploiement

### 1. Vérifier les CRON jobs
- Aller dans le dashboard Vercel
- Projet > Settings > Functions > Cron Jobs
- Vous devriez voir les 4 CRON jobs configurés

### 2. URLs importantes
- **Site**: https://laia-skin-nextjs.vercel.app
- **Admin**: https://laia-skin-nextjs.vercel.app/admin
- **Prisma Studio**: Utiliser localement avec `npx prisma studio`

### 3. Tester les CRON manuellement
```bash
# Remplacer YOUR-DOMAIN par votre domaine Vercel
curl https://YOUR-DOMAIN.vercel.app/api/cron/send-whatsapp-reminders?secret=laia_skin_cron_secret_2025
```

### 4. Horaires des CRON jobs
- **9h00** : Messages d'anniversaire (Email + WhatsApp)
- **10h00** : Demandes d'avis 3j après (Email + WhatsApp)  
- **18h00** : Rappels pour RDV du lendemain (WhatsApp)

## 🔍 Monitoring

### Logs Vercel
- Dashboard Vercel > Functions > Logs
- Voir les exécutions des CRON jobs
- Vérifier les erreurs éventuelles

### Test local des CRON
```bash
npm run dev
# Puis dans un autre terminal:
npx tsx test-cron-whatsapp.ts
```

## ⚠️ Important

1. **Les CRON jobs** ne fonctionnent QUE sur Vercel (pas en local)
2. **WhatsApp Business API** : Les destinataires doivent avoir initié une conversation dans les 24h OU vous devez utiliser des templates approuvés
3. **Limites Vercel gratuit** : 100GB bandwidth, suffisant pour commencer

## 📞 Support

Si problème avec WhatsApp Business API:
1. Vérifier le token dans Meta Business Suite
2. Vérifier que le numéro est bien configuré
3. Tester avec `npx tsx test-whatsapp-direct.ts`