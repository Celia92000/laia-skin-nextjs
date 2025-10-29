import Redis from 'ioredis';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function resetRateLimit() {
  console.log('🔧 Réinitialisation du rate limiting...\n');

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('⚠️  Pas de REDIS_URL configuré - rate limiting désactivé');
    console.log('✅ Vous pouvez vous connecter sans problème');
    return;
  }

  try {
    const redis = new Redis(redisUrl);
    
    // Effacer toutes les clés de rate limiting pour login
    const keys = await redis.keys('login:*');
    
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`✅ ${keys.length} limite(s) de rate supprimée(s)`);
    } else {
      console.log('✅ Aucune limite de rate à supprimer');
    }
    
    await redis.quit();
  } catch (error) {
    console.log('⚠️  Erreur Redis (probablement désactivé):', error.message);
    console.log('✅ Rate limiting non actif - pas de blocage');
  }
  
  console.log('\n📝 Essayez maintenant de vous connecter:');
  console.log('   Email: admin@laiaskin.com');
  console.log('   Mot de passe: admin123');
  console.log('\n💡 Si ça ne marche toujours pas:');
  console.log('   1. Ouvrez la console (F12)');
  console.log('   2. localStorage.clear()');
  console.log('   3. Rechargez (Ctrl+Shift+R)');
}

resetRateLimit();
