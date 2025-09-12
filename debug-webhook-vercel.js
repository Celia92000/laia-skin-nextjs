// Script de debug pour comprendre pourquoi le webhook ne fonctionne pas
const https = require('https');

const URL = 'https://laia-skin-institut-as92-c1n67ymdo-celia92000s-projects.vercel.app/api/whatsapp/webhook';
const TOKEN = 'laia_skin_webhook_2025';
const CHALLENGE = 'test_challenge_123';

console.log('🔍 Debug du webhook WhatsApp sur Vercel\n');
console.log('URL:', URL);
console.log('Token:', TOKEN);
console.log('\n' + '='.repeat(60));

// Test 1: Vérifier si l'URL est accessible
console.log('\n📌 Test 1: Accessibilité de l\'URL');

const testUrl = `${URL}?hub.mode=subscribe&hub.verify_token=${TOKEN}&hub.challenge=${CHALLENGE}`;

https.get(testUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nRéponse reçue:');
    console.log(data.substring(0, 500));
    
    if (data === CHALLENGE) {
      console.log('\n✅ SUCCÈS ! Le webhook répond correctement');
      console.log('Le challenge a été retourné comme attendu');
    } else if (data.includes('Authentication Required')) {
      console.log('\n❌ ERREUR: Protection Vercel active');
      console.log('\nSOLUTION:');
      console.log('1. Allez dans Vercel Dashboard');
      console.log('2. Settings → Deployment Protection');
      console.log('3. Désactivez "Vercel Authentication"');
      console.log('4. Ou ajoutez /api/whatsapp/webhook dans "Excluded Paths"');
    } else if (data.includes('Cannot GET')) {
      console.log('\n❌ ERREUR: La route n\'existe pas');
      console.log('\nSOLUTION:');
      console.log('1. Vérifiez que le fichier src/app/api/whatsapp/webhook/route.ts existe');
      console.log('2. Redéployez sur Vercel');
    } else {
      console.log('\n❌ ERREUR: Réponse inattendue');
      console.log('La route existe mais ne retourne pas le challenge');
    }
  });
}).on('error', (err) => {
  console.log('❌ Erreur de connexion:', err.message);
});

// Test 2: Simuler exactement ce que fait Meta
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('\n📌 Test 2: Simulation de la requête Meta');
  
  const url = new URL(testUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'User-Agent': 'facebookplatform/1.0 (+http://developers.facebook.com)'
    }
  };
  
  https.get(options, (res) => {
    console.log('Status avec User-Agent Meta:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200 && data === CHALLENGE) {
        console.log('✅ Le webhook devrait fonctionner avec Meta !');
      } else {
        console.log('❌ Le webhook ne fonctionne pas comme attendu');
        console.log('Status:', res.statusCode);
        console.log('Réponse:', data.substring(0, 200));
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('\n📋 DIAGNOSTIC FINAL:');
      
      if (res.statusCode === 302 || res.statusCode === 301) {
        console.log('⚠️  Redirection détectée - Protection Vercel active');
        console.log('→ Désactivez la protection dans Vercel Settings');
      } else if (res.statusCode === 404) {
        console.log('⚠️  Route introuvable');
        console.log('→ Vérifiez le déploiement et le chemin de la route');
      } else if (res.statusCode === 200 && data !== CHALLENGE) {
        console.log('⚠️  La route répond mais ne retourne pas le challenge');
        console.log('→ Vérifiez le code du webhook');
      } else if (res.statusCode === 200 && data === CHALLENGE) {
        console.log('✅ Tout est OK !');
        console.log('→ Réessayez dans Meta, ça devrait marcher');
      }
    });
  });
}, 2000);