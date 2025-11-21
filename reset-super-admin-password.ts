import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'celia.ivorra95@hotmail.fr';
  const newPassword = 'Admin@2025!';

  try {
    // Trouver le premier compte avec cet email et le rôle SUPER_ADMIN
    const user = await prisma.user.findFirst({
      where: {
        email,
        role: 'SUPER_ADMIN'
      }
    });

    if (!user) {
      console.log(`❌ Aucun super admin trouvé avec l'email: ${email}`);
      return;
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log('\n✅ Mot de passe réinitialisé avec succès !');
    console.log('\n=== IDENTIFIANTS SUPER ADMIN ===');
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: ${newPassword}`);
    console.log('\n🔗 URL: http://localhost:3002/connexion');
    console.log('\n⚠️  Changez ce mot de passe après connexion !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
