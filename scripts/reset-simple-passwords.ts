import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetSimplePasswords() {
  console.log('🔐 Réinitialisation des mots de passe pour tous les comptes admin\n');

  // Mots de passe simples pour le développement
  const SUPER_ADMIN_PASSWORD = 'SuperAdmin2024!';
  const ORG_ADMIN_PASSWORD = 'Admin2024!';

  try {
    // Récupérer tous les comptes admin de Célia
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' },
          { role: 'ORG_ADMIN' },
        ],
        email: {
          contains: 'celia',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (admins.length === 0) {
      console.log('❌ Aucun compte admin trouvé');
      return;
    }

    console.log(`🔍 ${admins.length} compte(s) trouvé(s)\n`);

    // Réinitialiser les mots de passe
    for (const admin of admins) {
      const password = admin.role === 'SUPER_ADMIN' ? SUPER_ADMIN_PASSWORD : ORG_ADMIN_PASSWORD;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Utiliser une requête SQL brute pour éviter les problèmes de schéma
      await prisma.$executeRaw`
        UPDATE "User"
        SET password = ${hashedPassword}
        WHERE id = ${admin.id}
      `;

      console.log(`✅ ${admin.email}`);
      console.log(`   🎭 Rôle: ${admin.role}`);
      if (admin.organization) {
        console.log(`   🏢 Organisation: ${admin.organization.name}`);
      }
      console.log(`   🔑 Mot de passe: ${password}`);
      console.log('');
    }

    console.log('\n📝 Récapitulatif des mots de passe :');
    console.log(`   SUPER_ADMIN : ${SUPER_ADMIN_PASSWORD}`);
    console.log(`   ORG_ADMIN   : ${ORG_ADMIN_PASSWORD}`);

    console.log('\n🌐 URLs d\'accès :');
    console.log('   Super Admin : http://localhost:3001/super-admin');
    console.log('   Admin       : http://localhost:3001/admin');
    console.log('   Login       : http://localhost:3001/login');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSimplePasswords().catch(console.error);