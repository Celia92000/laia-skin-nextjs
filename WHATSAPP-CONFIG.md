# Configuration WhatsApp Business - LAIA SKIN INSTITUT

## ✅ Ce qui a été fait (12/01/2025)

### 1. Token WhatsApp Permanent
- **Token actif** : `EAFWQV0qPjVQBPVbuyZAUDXzNy4nbeugYZBGrukyblA0AuA5L3zw5yGULmGJtbZCiRxI4a58h09M1IcbfyJ456TljbhpeTZBYAPdEv9o0ZAr4ZCr3fZC6pUf6e3ZAZC2FZCfgLBlvOJRtMdcFazy0UPZBHhIUlOOC1Md0CZCMAn81uhLMRi7tQYmgibBcfnUxyZA1n6O9xXQZDZD`
- **Configuré dans** : `.env.local` et Vercel
- **System User** : Célia IVORRA
- **Permissions** : WhatsApp Business Management, WhatsApp Business Messaging

### 2. Corrections TypeScript
- ✅ Toutes les erreurs TypeScript corrigées
- ✅ Build compile sans erreurs
- ✅ Dernier commit poussé : f2dd62e

### 3. Modifications du schéma Prisma
- Ajout du champ `services` dans le modèle `Reservation`
- **IMPORTANT** : Migration à appliquer après déploiement

## ❌ À faire demain

### 1. Corriger l'erreur de build Vercel
**Problème** : Les pages essaient de se connecter à la base de données pendant le build statique

**Solution** : Rendre les pages dynamiques
```typescript
// Ajouter dans les pages qui utilisent Prisma :
export const dynamic = 'force-dynamic'
```

Pages à modifier :
- `/blog/page.tsx`
- `/prestations/page.tsx`
- Toutes les pages qui font des requêtes Prisma

### 2. Appliquer la migration Prisma
```bash
npx prisma db push
```

### 3. Configurer le webhook WhatsApp dans Meta
- **URL** : `https://laia-skin-institut-as92.vercel.app/api/whatsapp/webhook`
- **Token de vérification** : `laia_skin_webhook_2025`
- **Aller dans** : Meta for Developers > LAIA SKIN INSTITUT > WhatsApp > Configuration > Webhook

### 4. Tester l'intégration WhatsApp
- Envoyer un message test
- Vérifier la réception du webhook
- Tester les réponses automatiques

## 📝 Notes importantes

### Erreur actuelle du build
```
Can't reach database server at `db.zsxweurvtsrdgehtadwa.supabase.co:5432`
```
- Le build TypeScript passe ✅
- L'erreur arrive pendant la génération des pages statiques
- Solution : forcer le rendu dynamique pour les pages avec Prisma

### Champs manquants dans le schéma Prisma
À ajouter plus tard si nécessaire :
- `User.totalSessions`
- `User.totalPackages`
- `User.lastMessage`
- `User.lastMessageTime`
- `User.unreadCount`
- Modèle `Reminder`
- Modèle `SentReminder`

### URLs importantes
- **Vercel** : https://vercel.com/celias-projects-d0c20d14/laia-skin-institut-as92
- **GitHub** : https://github.com/Celia92000/laia-skin-nextjs
- **Meta Business** : https://business.facebook.com/settings/system-users
- **Meta for Developers** : https://developers.facebook.com/apps/

## 🚀 Commandes utiles

```bash
# Tester le build localement
npm run build

# Appliquer les migrations Prisma
npx prisma db push

# Voir les logs Vercel
vercel logs

# Tester l'envoi WhatsApp
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"to": "33612345678", "message": "Test"}'
```

## 📅 Historique des commits importants
- `f2dd62e` : Dernières corrections TypeScript complètes
- `d6903fb` : Corrections pour le build TypeScript
- `3e73ae0` : Corrections finales TypeScript
- `c622537` : Corrections majeures pour le build
- `98eea2b` : Unification de l'interface Client

---
*Document créé le 12/01/2025 pour la reprise demain*