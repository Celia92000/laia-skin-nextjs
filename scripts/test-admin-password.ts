import { config } from 'dotenv';
import { resolve } from 'path';
import { getPrismaClient } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function testAdminPassword() {
  console.log('🔍 Vérification du mot de passe admin...\n');

  try {
    const prisma = await getPrismaClient();

    const admin = await prisma.user.findFirst({
      where: { email: 'admin@laiaskin.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });

    if (admin) {
      console.log('✅ Utilisateur trouvé:');
      console.log('   Email:', admin.email);
      console.log('   Nom:', admin.name);
      console.log('   Rôle:', admin.role);
      console.log('   Hash password (premiers 20 chars):', admin.password.substring(0, 20) + '...');

      // Tester si "admin123" correspond
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, admin.password);

      console.log('\n🧪 Test du mot de passe "admin123":', isValid ? '✅ VALIDE' : '❌ INVALIDE');

      if (!isValid) {
        console.log('\n🔧 Réinitialisation du mot de passe...');
        const newHash = await bcrypt.hash('admin123', 10);
        
        await prisma.user.update({
          where: { id: admin.id },
          data: { password: newHash }
        });

        console.log('✅ Mot de passe réinitialisé');
        console.log('   Nouveau hash (premiers 20 chars):', newHash.substring(0, 20) + '...');

        // Re-tester
        const retest = await bcrypt.compare('admin123', newHash);
        console.log('   Re-test:', retest ? '✅ VALIDE' : '❌ TOUJOURS INVALIDE');
      }

      console.log('\n📝 Essayez maintenant:');
      console.log('   Email: admin@laiaskin.com');
      console.log('   Mot de passe: admin123');

    } else {
      console.log('❌ Utilisateur admin@laiaskin.com non trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testAdminPassword();
