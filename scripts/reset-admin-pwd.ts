import { config } from 'dotenv';
import { resolve } from 'path';
import { getPrismaClient } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function resetAdminPassword() {
  console.log('🔐 Réinitialisation du mot de passe admin@laiaskin.com...');
  console.log('');

  try {
    const prisma = await getPrismaClient();

    const admin = await prisma.user.findFirst({
      where: { email: 'admin@laiaskin.com' }
    });

    if (admin) {
      const newPassword = '6SPnYd6hQn0TI5oP';
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: admin.id },
        data: { password: hashedPassword }
      });

      console.log('✅ Mot de passe réinitialisé avec succès\!');
      console.log('');
      console.log('📝 Vos identifiants:');
      console.log('   📧 Email: admin@laiaskin.com');
      console.log('   🔑 Mot de passe: 6SPnYd6hQn0TI5oP');
      console.log('   🌐 URL: http://localhost:3001/login');
      console.log('');
      console.log('🔒 IMPORTANT: Conservez ce mot de passe dans un endroit sûr !');
      console.log('   Ce mot de passe sécurisé remplace l\'ancien mot de passe faible.');
    } else {
      console.log('❌ Compte non trouvé');
    }
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

resetAdminPassword();
