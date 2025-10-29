import { config } from 'dotenv';
import { resolve } from 'path';
import { getPrismaClient } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function fixAdminRole() {
  console.log('🔍 Vérification et correction du rôle admin...\n');

  try {
    const prisma = await getPrismaClient();

    // Chercher l'utilisateur admin@laiaskin.com
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@laiaskin.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true
      }
    });

    if (admin) {
      console.log('✅ Utilisateur trouvé:');
      console.log('   Email:', admin.email);
      console.log('   Nom:', admin.name);
      console.log('   Rôle actuel:', admin.role);
      console.log('   Organization ID:', admin.organizationId);

      if (admin.role !== 'ORG_ADMIN') {
        console.log('\n🔧 Correction du rôle vers ORG_ADMIN...');

        // Réinitialiser le mot de passe aussi
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await prisma.user.update({
          where: { id: admin.id },
          data: {
            role: 'ORG_ADMIN',
            password: hashedPassword
          }
        });

        console.log('✅ Rôle corrigé vers ORG_ADMIN');
        console.log('✅ Mot de passe réinitialisé: admin123');
      } else {
        console.log('✅ Le rôle est déjà ORG_ADMIN');
      }

      console.log('\n📝 Identifiants de connexion:');
      console.log('   📧 Email: admin@laiaskin.com');
      console.log('   🔑 Mot de passe: admin123');
      console.log('   🌐 URL: http://localhost:3001/login');
      console.log('   ➡️  Redirection: /admin');

    } else {
      console.log('❌ Utilisateur admin@laiaskin.com non trouvé');
      console.log('\n💡 Vous devez créer un compte admin avec le rôle ORG_ADMIN');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixAdminRole();
