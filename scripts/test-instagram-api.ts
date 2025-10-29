import { getApiTokenWithMetadata } from './src/lib/api-token-manager';

async function testInstagramAPI() {
  console.log('🔍 Test de l\'API Instagram avec votre token actuel...\n');

  // Récupérer le token depuis la base de données
  const tokenData = await getApiTokenWithMetadata(
    'INSTAGRAM',
    'access_token',
    '9739c909-c945-4548-bf53-4d226457f630'
  );

  if (!tokenData) {
    console.log('❌ Aucun token Instagram trouvé dans la base de données');
    return;
  }

  const { token, metadata } = tokenData;
  const accountId = metadata?.accountId || metadata?.account_id;

  console.log('📊 Token trouvé:');
  console.log(`   Longueur: ${token.length} caractères`);
  console.log(`   Commence par: ${token.substring(0, 20)}...`);
  console.log(`   Account ID: ${accountId}\n`);

  // Tester l'API Instagram Graph
  console.log('🌐 Appel à l\'API Instagram Graph...\n');

  try {
    const url = `https://graph.facebook.com/v18.0/${accountId}/media?fields=caption,like_count,comments_count,media_type,timestamp&limit=5&access_token=${token}`;

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! L\'API Instagram fonctionne!\n');
      console.log(`📸 ${data.data?.length || 0} posts récupérés:`);

      if (data.data && data.data.length > 0) {
        data.data.forEach((post: any, idx: number) => {
          console.log(`\n${idx + 1}. ${post.caption?.substring(0, 60)}...`);
          console.log(`   ❤️  ${post.like_count} likes | 💬 ${post.comments_count} comments`);
        });
      }

      console.log('\n✨ Votre token Instagram est VALIDE et les vraies APIs fonctionnent!');
      console.log('🎯 Vous pouvez maintenant utiliser l\'analyse IA dans l\'interface admin.');

    } else {
      console.log('❌ ERREUR API Instagram:\n');
      console.log(JSON.stringify(data, null, 2));

      if (data.error?.code === 190) {
        console.log('\n🔴 Token invalide ou expiré');
        console.log('📝 Vous devez générer un nouveau token depuis Meta Business Suite');
      } else if (data.error?.code === 200 || data.error?.code === 10) {
        console.log('\n🔴 Vérification Meta Business requise');
        console.log('📝 Votre application doit être vérifiée sur developers.facebook.com');
      }
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'appel API:', error.message);
  }
}

testInstagramAPI();
