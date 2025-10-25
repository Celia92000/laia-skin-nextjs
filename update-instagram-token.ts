import { storeApiToken } from './src/lib/api-token-manager';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateInstagramToken() {
  console.log('🔐 Mise à jour du token Instagram\n');
  console.log('Organisation ID: 9739c909-c945-4548-bf53-4d226457f630');
  console.log('Account ID actuel: 785663654385417\n');

  // Demander le nouveau token
  const newToken = await question('📝 Collez votre nouveau token Instagram: ');

  if (!newToken || newToken.trim().length < 50) {
    console.log('\n❌ Token invalide (trop court). Un token Instagram fait généralement 150-250 caractères.');
    rl.close();
    return;
  }

  console.log('\n🔍 Validation du token...');
  console.log(`   Longueur: ${newToken.trim().length} caractères`);
  console.log(`   Commence par: ${newToken.trim().substring(0, 10)}...`);

  const confirm = await question('\n✅ Voulez-vous enregistrer ce token ? (oui/non): ');

  if (confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('\n❌ Opération annulée.');
    rl.close();
    return;
  }

  try {
    // Mettre à jour le token
    await storeApiToken({
      organizationId: '9739c909-c945-4548-bf53-4d226457f630',
      service: 'INSTAGRAM',
      name: 'access_token',
      token: newToken.trim(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 jours
      metadata: {
        accountId: '785663654385417',
        updatedAt: new Date().toISOString(),
        updatedBy: 'manual-script'
      }
    });

    console.log('\n✅ Token Instagram mis à jour avec succès!');
    console.log('📅 Expire dans 60 jours');
    console.log('\n🔄 Vous pouvez maintenant tester l\'analyse du feed dans l\'interface admin.');

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la mise à jour:', error.message);
  } finally {
    rl.close();
  }
}

updateInstagramToken();
