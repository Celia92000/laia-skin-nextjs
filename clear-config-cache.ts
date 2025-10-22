import { clearConfigCache } from './src/lib/config-service';

console.log('🗑️  Vidage du cache de configuration...');
clearConfigCache();
console.log('✅ Cache vidé avec succès');
