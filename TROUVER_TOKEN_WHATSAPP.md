# 🔑 COMMENT TROUVER LE TOKEN WHATSAPP

## MÉTHODE 1 : Via System Users (Recommandé)

1. Allez sur : https://business.facebook.com/settings/system-users/?business_id=2020641678472536

2. Cliquez sur **"Add"** (Ajouter un utilisateur système)

3. Donnez un nom : "LAIA SKIN API"

4. Cliquez sur **"Add Assets"** → Sélectionnez votre WhatsApp

5. Cliquez sur **"Generate New Token"**

6. IMPORTANT : Cochez ces permissions :
   - whatsapp_business_messaging
   - whatsapp_business_management

7. Cliquez "Generate Token"

8. COPIEZ IMMÉDIATEMENT le token (il commence par EAA...)

## MÉTHODE 2 : Via Facebook Developers

1. Allez sur : https://developers.facebook.com

2. Cliquez sur "My Apps"

3. Sélectionnez votre app WhatsApp (ou créez-en une)

4. Dans le menu : "WhatsApp" → "Getting Started"

5. Section "Temporary access token" → Cliquez "Generate"

## MÉTHODE 3 : Token Temporaire (Plus simple pour tester)

Dans WhatsApp Manager :
1. Cherchez "API Setup" ou "Configuration"
2. Section "Temporary access token"
3. Cliquez "Generate"
4. Ce token dure 24h (parfait pour tester)

## ⚠️ LE TOKEN RESSEMBLE À ÇA :

```
EAAGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

C'est TRÈS LONG (200+ caractères) !

## 📱 UNE FOIS QUE VOUS L'AVEZ :

Remplacez dans .env.local :
```
WHATSAPP_ACCESS_TOKEN=COLLEZ_LE_TOKEN_ICI
```

Puis redémarrez le serveur.