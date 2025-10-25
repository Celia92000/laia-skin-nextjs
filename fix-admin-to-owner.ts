import { config } from 'dotenv';
import { resolve } from 'path';
import { getPrismaClient } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function fixAdminToOwner() {
  console.log('🔧 Restauration du rôle ORG_OWNER...\n');

  try {
    const prisma = await getPrismaClient();

    const admin = await prisma.user.findFirst({
      where: { email: 'admin@laiaskin.com' }
    });

    if (admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await prisma.user.update({
        where: { id: admin.id },
        data: {
          role: 'ORG_OWNER',
          password: hashedPassword
        }
      });

      console.log('✅ Rôle restauré à ORG_OWNER');
      console.log('✅ Mot de passe: admin123');
      console.log('\n📝 IMPORTANT: Videz le cache de votre navigateur et déconnectez-vous:');
      console.log('   1. Ouvrez la console du navigateur (F12)');
      console.log('   2. Tapez: localStorage.clear()');
      console.log('   3. Rechargez la page (Ctrl+Shift+R ou Cmd+Shift+R)');
      console.log('   4. Reconnectez-vous avec admin@laiaskin.com / admin123');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixAdminToOwner();
