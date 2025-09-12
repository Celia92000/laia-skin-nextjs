// Test simple des permissions du token
const axios = require('axios');

// Remplacez par votre token
const TOKEN = 'EAFWQV0qPjVQBPVAwK2f2zaLeCx36pZCVWlp8Ds0Xb7Vvj2cyjGW8FCKFGYA4uaJOkQZBYZA8balWgZC81gvPVgdLy6wrwxNXPbjgS4u04ZBkn9UBakZBDSfZC1V8GktwQhAbBUFXQhFNG9TDKQOfhHgmm3KVE0ir6RhmxrnUv0nUFwa8LCntZBcakZC1QY3ZBnYVLDkAZDZD';

async function testPermissions() {
  console.log('🔍 Test des permissions du token...\n');
  
  // Test 1: Informations de base
  console.log('📌 Test 1: Informations du token');
  try {
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/me',
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    console.log('✅ Token valide pour:', response.data.name || response.data.id);
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data?.error?.message || error.message);
  }
  
  // Test 2: Permissions disponibles
  console.log('\n📌 Test 2: Permissions disponibles');
  try {
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/me/permissions',
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('Permissions actives:');
      response.data.data.forEach(perm => {
        const status = perm.status === 'granted' ? '✅' : '❌';
        console.log(`  ${status} ${perm.permission}`);
      });
    } else {
      console.log('Aucune permission trouvée');
    }
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data?.error?.message || error.message);
  }
  
  // Test 3: Accès aux comptes
  console.log('\n📌 Test 3: Comptes accessibles');
  try {
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }
    );
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('Comptes/Pages accessibles:');
      response.data.data.forEach(account => {
        console.log(`  - ${account.name} (${account.category})`);
      });
    } else {
      console.log('Aucun compte accessible');
    }
  } catch (error) {
    console.log('❌ Pas d\'accès aux comptes:', error.response?.data?.error?.message || 'Non autorisé');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('💡 Conseil:');
  console.log('Si vous ne voyez pas de permissions WhatsApp:');
  console.log('1. Le token n\'a pas été généré avec les bonnes permissions');
  console.log('2. Suivez le guide SOLUTION-AFFECTATION-WHATSAPP.md');
  console.log('3. Générez un nouveau token avec les permissions WhatsApp');
}

testPermissions();