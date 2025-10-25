import { getApiTokenWithMetadata } from './src/lib/api-token-manager';

async function testTokenMetadata() {
  const organizationId = '9739c909-c945-4548-bf53-4d226457f630';

  console.log('🔍 Test de récupération du token Instagram avec metadata...\n');

  const tokenData = await getApiTokenWithMetadata('INSTAGRAM', 'access_token', organizationId);

  if (tokenData) {
    console.log('✅ Token trouvé!');
    console.log('Token:', tokenData.token.substring(0, 20) + '...');
    console.log('Metadata:', JSON.stringify(tokenData.metadata, null, 2));
    console.log('\nType de metadata:', typeof tokenData.metadata);
    console.log('accountId (camelCase):', tokenData.metadata?.accountId);
    console.log('account_id (snake_case):', tokenData.metadata?.account_id);
  } else {
    console.log('❌ Token non trouvé');
  }
}

testTokenMetadata();
