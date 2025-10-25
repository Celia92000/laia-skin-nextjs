import { storeApiToken } from './src/lib/api-token-manager';

async function updateToken() {
  const newToken = 'IGAALKjpMIVwlBZAFFwTS1RcVd4Smd6SjQ1WkxSSHI4NDlEalF5THpkTUVKZAUlkWVZAHTXFjcVhjU2NHT0Fzd1FoWGVhZAzlmbFpVOU5qY0kwbklfbnNsRkNZASTlrdUJ5cjZA4V18xaTRzdVFTTVM0eTAzZAFl1RjhpSVFFY0I2R0loOAZDZD';

  console.log('🔐 Mise à jour du token Instagram...\n');
  console.log(`Token length: ${newToken.length} caractères`);
  console.log(`Commence par: ${newToken.substring(0, 20)}...`);

  try {
    await storeApiToken({
      organizationId: '9739c909-c945-4548-bf53-4d226457f630',
      service: 'INSTAGRAM',
      name: 'access_token',
      token: newToken,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
      metadata: {
        accountId: '785663654385417',
        updatedAt: new Date().toISOString(),
        updatedBy: 'manual-update'
      }
    });

    console.log('\n✅ Token Instagram mis à jour avec succès!');
    console.log('📅 Expire le:', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString());
    console.log('🎯 Account ID: 785663654385417');
    console.log('\n🔄 Vous pouvez maintenant tester l\'analyse du feed dans l\'interface admin.');

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    throw error;
  }
}

updateToken();
