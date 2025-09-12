# 🔧 Solution: Affecter les éléments WhatsApp au System User

## 📌 Méthode 1: Via WhatsApp Business Settings (Plus simple)

1. **Allez directement sur WhatsApp Business Settings**:
   - URL: https://business.facebook.com/settings/whatsapp-business-accounts
   - Ou: Business Suite → Paramètres → WhatsApp Business Accounts

2. **Sélectionnez votre compte WhatsApp**:
   - Cliquez sur le compte qui contient le numéro +33 6 83 71 70 50

3. **Onglet "Users"**:
   - Cliquez sur "Add People" ou "Ajouter des personnes"
   - Cherchez "Célia IVORRA" (votre System User)
   - Donnez le rôle "Full control" ou "Contrôle total"
   - Cliquez sur "Add"

## 📌 Méthode 2: Via System User Settings

1. **Allez sur System Users**:
   - URL: https://business.facebook.com/settings/system-users
   - Sélectionnez "Célia IVORRA"

2. **Onglet "Add Assets" ou "Ajouter des actifs"**:
   - Cliquez sur "Add Assets"
   - Sélectionnez "WhatsApp Accounts"
   - Cherchez votre compte WhatsApp
   - Cochez "Full Control"
   - Cliquez sur "Save Changes"

## 📌 Méthode 3: Via l'App directement

1. **Allez sur votre App Facebook**:
   - URL: https://developers.facebook.com/apps/
   - Sélectionnez votre app "LAIA Skin Institut"

2. **WhatsApp → Configuration**:
   - Dans le menu gauche: WhatsApp → Configuration
   - Vérifiez que le numéro est bien lié à l'app

3. **Add Phone Number**:
   - Si le numéro n'est pas là, cliquez "Add phone number"
   - Suivez les étapes pour lier le numéro

## 🚨 Si rien ne fonctionne: Solution Alternative

### Créer un nouveau token via l'App directement:

1. **Dans votre App Facebook**:
   ```
   https://developers.facebook.com/apps/[VOTRE_APP_ID]/whatsapp-business/wa-dev-console/
   ```

2. **Temporary access token**:
   - Cliquez sur "Generate temporary access token"
   - Ce token durera 24h mais vous permettra de tester

3. **Pour un token permanent via l'App**:
   - WhatsApp → API Setup
   - System User token → Generate new token
   - L'App devrait automatiquement avoir les bonnes permissions

## 🔍 Vérification des permissions

Pour vérifier que tout est bien configuré:

1. **Testez avec ce script simple**:

```javascript
// test-simple.js
const axios = require('axios');

// Mettez votre nouveau token ici
const TOKEN = 'VOTRE_NOUVEAU_TOKEN';

async function testSimple() {
  try {
    // Test simple pour voir les permissions
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/me/permissions',
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    console.log('Permissions du token:');
    response.data.data.forEach(perm => {
      console.log(`- ${perm.permission}: ${perm.status}`);
    });
  } catch (error) {
    console.log('Erreur:', error.response?.data || error.message);
  }
}

testSimple();
```

## 💡 Solution rapide si bloqué

Si vous êtes complètement bloqué avec les permissions:

1. **Utilisez l'Access Token Tool pour un test rapide**:
   - https://developers.facebook.com/tools/accesstoken/
   - Générez un User Access Token (pas System User)
   - Avec les permissions WhatsApp
   - Testez avec ce token temporaire

2. **Une fois que ça marche avec le token temporaire**:
   - Recréez un nouveau System User
   - Nom: "WhatsApp Bot"
   - Refaites l'association depuis zéro

## 📱 Configuration minimale requise

Pour que WhatsApp fonctionne, vous avez besoin:

1. **Un WhatsApp Business Account** ✓ (Vous l'avez)
2. **Un numéro de téléphone vérifié** ✓ (Vous l'avez)
3. **Une App Facebook** ✓ (Vous l'avez)
4. **Un token avec permissions WhatsApp** ❌ (À configurer)

## 🆘 Besoin d'aide supplémentaire?

Si vous ne voyez pas les options mentionnées:

1. Vérifiez que vous êtes Admin du Business Manager
2. Vérifiez que l'App a le produit WhatsApp activé
3. Essayez de vous déconnecter/reconnecter à Business Manager
4. Utilisez un navigateur différent ou mode incognito

## 📞 Option de dernier recours

Créez un ticket support Meta:
- https://business.facebook.com/business/help
- Catégorie: WhatsApp Business API
- Problème: "Cannot assign WhatsApp assets to System User"