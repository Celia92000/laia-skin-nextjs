// Test simple et direct du webhook
const https = require('https');

console.log('🔍 Test direct du webhook WhatsApp\n');

// Test avec le slash à la fin (comme Vercel le veut)
const url = 'https://laia-skin-institut-as92-c1n67ymdo-celia92000s-projects.vercel.app/api/whatsapp/webhook/?hub.mode=subscribe&hub.verify_token=laia_skin_webhook_2025&hub.challenge=TEST123';

console.log('URL testée:', url);
console.log('\nEnvoi de la requête...\n');

https.get(url, (res) => {
  console.log('📊 Résultat:');
  console.log('Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Réponse:', data.substring(0, 200));
    
    if (data === 'TEST123') {
      console.log('\n✅ SUCCÈS ! Le webhook fonctionne !');
      console.log('\nDans Meta, utilisez cette URL EXACTE:');
      console.log('https://laia-skin-institut-as92-c1n67ymdo-celia92000s-projects.vercel.app/api/whatsapp/webhook/');
      console.log('\nNotez le slash "/" à la fin !');
    } else if (data.includes('Authentication')) {
      console.log('\n❌ Protection Vercel toujours active');
      console.log('Allez dans Vercel Settings → Deployment Protection → OFF');
    } else {
      console.log('\n❌ Le webhook ne répond pas correctement');
      
      // Test sans le slash aussi
      console.log('\n🔄 Test sans le slash final...');
      const urlNoSlash = 'https://laia-skin-institut-as92-c1n67ymdo-celia92000s-projects.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=laia_skin_webhook_2025&hub.challenge=TEST123';
      
      https.get(urlNoSlash, (res2) => {
        let data2 = '';
        res2.on('data', (chunk) => {
          data2 += chunk;
        });
        res2.on('end', () => {
          if (data2 === 'TEST123') {
            console.log('\n✅ Ça marche sans le slash !');
            console.log('Utilisez cette URL dans Meta:');
            console.log('https://laia-skin-institut-as92-c1n67ymdo-celia92000s-projects.vercel.app/api/whatsapp/webhook');
          } else {
            console.log('Status sans slash:', res2.statusCode);
            console.log('Réponse sans slash:', data2.substring(0, 200));
          }
        });
      });
    }
  });
}).on('error', (err) => {
  console.log('❌ Erreur:', err.message);
});