# ✅ WhatsApp est maintenant dans vos assets !

## 🎯 Étape finale : Générer le token avec les permissions WhatsApp

### 1. Générer un nouveau token

1. **Restez sur la page System Users → Célia IVORRA**

2. **Cliquez sur "Generate New Token"** ou "Générer un nouveau token"

3. **IMPORTANT - Cochez ces permissions** :
   - ✅ **whatsapp_business_messaging** (OBLIGATOIRE)
   - ✅ **whatsapp_business_management** (OBLIGATOIRE)
   - ✅ **business_management**
   - ✅ **pages_messaging** (pour les réponses automatiques)
   - ✅ **pages_read_engagement**

4. **Durée du token** :
   - Sélectionnez **"Never expire"** ou **"N'expire jamais"**
   - Ou au minimum 60 jours

5. **Cliquez sur "Generate Token"**

6. **COPIEZ LE TOKEN IMMÉDIATEMENT** (il ne sera plus visible après)

### 2. Tester le nouveau token

Une fois le token copié :

```bash
# 1. Mettez à jour le fichier .env.local
# Remplacez l'ancien token par le nouveau

# 2. Créez un fichier test-nouveau-token.js
```

Créez ce fichier pour tester :

```javascript
// test-nouveau-token.js
const axios = require('axios');

// COLLEZ VOTRE NOUVEAU TOKEN ICI
const TOKEN = 'VOTRE_NOUVEAU_TOKEN_ICI';
const PHONE_NUMBER_ID = '672520675954185';

async function testNouveauToken() {
  console.log('🔍 Test du nouveau token WhatsApp...\n');
  
  try {
    // Test 1: Vérifier les permissions
    const permsResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/permissions',
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      }
    );
    
    console.log('✅ Permissions obtenues:');
    permsResponse.data.data.forEach(p => {
      console.log(`   - ${p.permission}`);
    });
    
    // Test 2: Accès au compte WhatsApp
    const whatsappResponse = await axios.get(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}`,
      {
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        params: { fields: 'display_phone_number,verified_name' }
      }
    );
    
    console.log('\n✅ Accès WhatsApp réussi !');
    console.log('   Numéro:', whatsappResponse.data.display_phone_number);
    
    // Test 3: Envoi d'un message test
    const messageResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: '33683717050', // Votre numéro
        type: 'text',
        text: {
          body: '🎉 Félicitations ! WhatsApp API fonctionne parfaitement avec LAIA Skin Institut !'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Message test envoyé !');
    console.log('   ID:', messageResponse.data.messages[0].id);
    console.log('\n🎊 TOUT FONCTIONNE ! WhatsApp est prêt !');
    
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data?.error?.message || error.message);
    if (error.response?.data?.error?.type === 'OAuthException') {
      console.log('\n⚠️  Vérifiez que vous avez bien coché toutes les permissions WhatsApp');
    }
  }
}

testNouveauToken();
```

### 3. Si le test réussit

1. **Mettez à jour `.env.local`** avec le nouveau token
2. **Commitez et pushez** les changements
3. **Mettez à jour Vercel** avec le nouveau token

### 4. Configuration Vercel

Dans Vercel, mettez à jour :
```
WHATSAPP_ACCESS_TOKEN = [VOTRE_NOUVEAU_TOKEN]
```

### 5. Configuration du Webhook (dernière étape)

Une fois le token fonctionnel :

1. **Allez sur** : https://developers.facebook.com/apps/
2. **Votre App → WhatsApp → Configuration**
3. **Webhook Settings** :
   - Callback URL : `https://votre-app.vercel.app/api/whatsapp/webhook`
   - Verify Token : `laia_skin_webhook_2025`
   - Champs à souscrire : `messages`, `message_status`

## 🎯 Résultat attendu

Si tout fonctionne, vous devriez voir :
```
✅ Permissions obtenues:
   - whatsapp_business_messaging
   - whatsapp_business_management
   - business_management
   
✅ Accès WhatsApp réussi !
   Numéro: +33 6 83 71 70 50
   
✅ Message test envoyé !
   
🎊 TOUT FONCTIONNE ! WhatsApp est prêt !
```

## 💡 En cas de problème

Si vous avez toujours des erreurs après avoir généré le nouveau token :

1. **Vérifiez que vous avez bien sélectionné** :
   - Le bon WhatsApp Business Account ("Test WhatsApp Business Account")
   - Toutes les permissions WhatsApp

2. **Essayez de régénérer** le token en cochant TOUTES les permissions disponibles

3. **Alternative** : Utilisez le token temporaire de l'app pour tester