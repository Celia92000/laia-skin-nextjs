import { storeApiToken, getApiTokenWithMetadata } from './src/lib/api-token-manager';

async function fixInstagramAccountId() {
  console.log('🔧 Correction de l\'Instagram Account ID\n');

  const organizationId = '9739c909-c945-4548-bf53-4d226457f630';

  // Récupérer le token actuel
  const tokenData = await getApiTokenWithMetadata('INSTAGRAM', 'access_token', organizationId);

  if (!tokenData) {
    console.log('❌ Aucun token Instagram trouvé');
    return;
  }

  const { token } = tokenData;

  console.log('📊 Token actuel trouvé');
  console.log(`   Ancien Account ID: 785663654385417`);
  console.log(`   Nouveau Account ID: 17841465917006851 (@laia.skin)\n`);

  // Mettre à jour avec le bon accountId
  await storeApiToken({
    organizationId,
    service: 'INSTAGRAM',
    name: 'access_token',
    token: token, // Garder le même token
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
    metadata: {
      accountId: '17841465917006851', // ✅ BON ID
      accountName: '@laia.skin',
      updatedAt: new Date().toISOString(),
      updatedBy: 'account-id-fix'
    }
  });

  console.log('✅ Account ID mis à jour avec succès!\n');
  console.log('🧪 Test de l\'API avec le bon ID...\n');

  // Tester immédiatement
  const testUrl = `https://graph.facebook.com/v18.0/17841465917006851/media?fields=caption,like_count,comments_count,media_type,timestamp&limit=3&access_token=${token}`;

  try {
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! L\'API Instagram fonctionne maintenant!\n');
      console.log(`📸 ${data.data?.length || 0} posts récupérés avec succès`);

      if (data.data && data.data.length > 0) {
        console.log('\n📝 Aperçu des posts:');
        data.data.forEach((post: any, idx: number) => {
          console.log(`\n${idx + 1}. ${post.caption?.substring(0, 50) || 'Sans légende'}...`);
          console.log(`   ❤️  ${post.like_count || 0} likes | 💬 ${post.comments_count || 0} comments`);
        });
      }

      console.log('\n\n🎉 Tout fonctionne! Vous pouvez maintenant utiliser l\'analyse IA dans l\'interface admin.');
    } else {
      console.log('❌ Erreur API:');
      console.log(JSON.stringify(data, null, 2));

      if (data.error?.code === 190) {
        console.log('\n⚠️  Le token est invalide ou expiré');
        console.log('📝 Vous devez générer un nouveau token depuis Meta Business Suite');
      }
    }
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

fixInstagramAccountId();
