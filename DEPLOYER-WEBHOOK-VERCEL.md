# 🚀 Déployer le Webhook WhatsApp sur Vercel

## ❌ Erreur: "Impossible de valider l'URL de rappel"

Cette erreur se produit car Meta ne peut pas accéder à votre webhook local. **La solution: déployer sur Vercel**.

## ✅ Étapes pour déployer et configurer le webhook

### 1. Commit et Push des derniers changements

```bash
git add -A
git commit -m "Fix webhook verification token"
git push origin main
```

### 2. Déployer sur Vercel

#### Option A: Via le Dashboard Vercel (Si déjà connecté)
1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Votre projet devrait se déployer automatiquement après le push

#### Option B: Première fois sur Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Importez votre projet `laia-skin-nextjs`
4. **IMPORTANT**: Ajoutez les variables d'environnement

### 3. Variables d'environnement sur Vercel

Dans Vercel Dashboard → Votre Projet → Settings → Environment Variables

Ajoutez TOUTES ces variables:

```
DATABASE_URL = postgresql://postgres:%23SBxrx8kVc857Ed@db.zsxweurvtsrdgehtadwa.supabase.co:5432/postgres

DIRECT_URL = postgresql://postgres:%23SBxrx8kVc857Ed@db.zsxweurvtsrdgehtadwa.supabase.co:5432/postgres

NEXT_PUBLIC_SUPABASE_URL = https://zsxweurvtsrdgehtadwa.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzeHdldXJ2dHNyZGdlaHRhZHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mzg0MjMsImV4cCI6MjA3MzIxNDQyM30.u-k1rK9n-ld0VIDVaSB8OnnvCMxTQVMzUNbrJFqcqrg

NEXT_PUBLIC_WHATSAPP_NUMBER = +33683717050

WHATSAPP_ACCESS_TOKEN = EAFWQV0qPjVQBPVbuyZAUDXzNy4nbeugYZBGrukyblA0AuA5L3zw5yGULmGJtbZCiRxI4a58h09M1IcbfyJ456TljbhpeTZBYAPdEv9o0ZAr4ZCr3fZC6pUf6e3ZAZC2FZCfgLBlvOJRtMdcFazy0UPZBHhIUlOOC1Md0CZCMAn81uhLMRi7tQYmgibBcfnUxyZA1n6O9xXQZDZD

WHATSAPP_PHONE_NUMBER_ID = 672520675954185

WHATSAPP_BUSINESS_ACCOUNT_ID = 1741901383229296

WHATSAPP_WEBHOOK_VERIFY_TOKEN = laia_skin_webhook_2025

WHATSAPP_API_VERSION = v18.0

JWT_SECRET = laia_skin_jwt_secret_production_2025_secure_key

NEXT_PUBLIC_API_URL = https://[VOTRE-APP].vercel.app

CRON_SECRET = laia_skin_cron_secret_2025
```

### 4. Récupérer l'URL de votre déploiement

Après le déploiement, Vercel vous donnera une URL comme:
- `https://laia-skin-nextjs.vercel.app`
- ou `https://laia-skin-nextjs-[votre-username].vercel.app`

### 5. Tester le webhook déployé

Une fois déployé, testez avec curl:

```bash
curl "https://[VOTRE-APP].vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=laia_skin_webhook_2025&hub.challenge=test123"
```

Vous devriez recevoir: `test123`

### 6. Configurer le webhook sur Meta

1. Allez sur [Meta for Developers](https://developers.facebook.com/apps/)
2. Votre App → WhatsApp → Configuration
3. **Webhook Settings**:
   - **Callback URL**: `https://[VOTRE-APP].vercel.app/api/whatsapp/webhook`
   - **Verify Token**: `laia_skin_webhook_2025`
4. Cliquez **Verify and Save**

### 7. S'abonner aux événements

Après la vérification réussie:
1. Dans la même page, section **Webhook Fields**
2. Cochez:
   - ✅ `messages` (pour recevoir les messages)
   - ✅ `message_status` (pour les statuts de livraison)
3. Cliquez **Subscribe**

## 🔍 Dépannage

### Si "Impossible de valider" persiste:

1. **Vérifiez l'URL exacte** de votre déploiement Vercel
2. **Vérifiez les logs** sur Vercel Dashboard → Functions → Logs
3. **Testez manuellement**:
   ```bash
   curl -v "https://votre-app.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=laia_skin_webhook_2025&hub.challenge=test"
   ```

### Erreurs communes:

| Erreur | Solution |
|--------|----------|
| "Cannot GET /api/whatsapp/webhook" | Redéployez après avoir pushé les changements |
| "Token invalide" | Vérifiez que `WHATSAPP_WEBHOOK_VERIFY_TOKEN` est bien configuré sur Vercel |
| "500 Internal Server Error" | Vérifiez les logs Vercel pour voir l'erreur exacte |

## ✅ Succès attendu

Quand tout fonctionne:
1. Meta affiche "Webhook verified" ✅
2. Vous pouvez recevoir des messages WhatsApp
3. Les logs Vercel montrent les webhooks reçus

## 💡 Alternative rapide

Si vous voulez tester rapidement sans Vercel:
1. Utilisez [ngrok](https://ngrok.com) pour exposer votre localhost
2. `ngrok http 5555`
3. Utilisez l'URL ngrok comme webhook temporaire

Mais pour la production, **Vercel est la solution recommandée**.