# 📱 Guide de Configuration WhatsApp Business - Permissions du Token

## 🔴 IMPORTANT: Votre token n'a pas les bonnes permissions

Votre token actuel ne peut pas accéder au numéro WhatsApp. Voici comment corriger cela:

## 📋 Étape 1: Vérifier l'association du numéro WhatsApp

1. Allez sur [Meta Business Suite](https://business.facebook.com/settings/whatsapp-business-accounts)
2. Sélectionnez votre compte WhatsApp Business
3. Vérifiez que le numéro **+33 6 83 71 70 50** est bien listé
4. Notez l'ID du numéro (devrait être `672520675954185`)

## 🔑 Étape 2: Générer un nouveau token avec les bonnes permissions

### Option A: Via System User (Recommandé pour token permanent)

1. Allez sur [Business Settings > System Users](https://business.facebook.com/settings/system-users)
2. Sélectionnez votre System User **Célia IVORRA**
3. Cliquez sur **"Generate Token"**
4. **IMPORTANT**: Sélectionnez ces permissions:
   - ✅ **whatsapp_business_messaging** (OBLIGATOIRE)
   - ✅ **whatsapp_business_management** (OBLIGATOIRE)
   - ✅ **business_management**
   - ✅ **pages_messaging**

5. **Assets à associer**:
   - Sélectionnez votre **WhatsApp Business Account**
   - Sélectionnez votre **numéro WhatsApp** spécifiquement

### Option B: Via Access Token Tool (Pour test rapide)

1. Allez sur [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Sélectionnez votre App
3. Permissions à cocher:
   - ✅ whatsapp_business_messaging
   - ✅ whatsapp_business_management
   - ✅ business_management
4. Générez le token

## 🔍 Étape 3: Vérifier les associations

Assurez-vous que votre System User a accès à:

1. **WhatsApp Business Account** (ID: 1741901383229296)
2. **Numéro WhatsApp** (ID: 672520675954185)
3. **App Facebook** (LAIA Skin Institut App)

### Comment vérifier:

1. Business Settings > System Users > Célia IVORRA
2. Onglet "Assets" 
3. Vérifiez que vous voyez:
   - WhatsApp Accounts > Votre compte
   - Apps > LAIA Skin Institut App

## 🚀 Étape 4: Tester le nouveau token

Une fois le nouveau token généré:

```bash
# Mettez à jour le fichier .env.local avec le nouveau token
# Puis testez:
node test-whatsapp-complete.js
```

## ⚠️ Problèmes courants

### "Object with ID does not exist"
- Le numéro WhatsApp n'est pas associé au token
- Solution: Réassociez le numéro dans Business Settings

### "You do not have permission"
- Permissions manquantes sur le token
- Solution: Régénérez avec toutes les permissions listées

### "Token expired"
- Token temporaire expiré
- Solution: Utilisez un System User pour un token permanent

## 📱 Configuration correcte attendue

Quand tout est bien configuré, le test devrait afficher:
- ✅ Token valide et permanent
- ✅ Accès au Business Account
- ✅ Liste des numéros WhatsApp visible
- ✅ Envoi de message réussi

## 💡 Conseil

Si vous avez des difficultés, créez un nouveau System User dédié à WhatsApp:
1. Nom: "WhatsApp API Bot"
2. Rôle: Admin
3. Associez UNIQUEMENT les assets WhatsApp
4. Générez un token avec les permissions WhatsApp uniquement

## 🔗 Liens utiles

- [Business Settings](https://business.facebook.com/settings)
- [WhatsApp Business Accounts](https://business.facebook.com/settings/whatsapp-business-accounts)
- [System Users](https://business.facebook.com/settings/system-users)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)