import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPasswords() {
  try {
    console.log('=== Réinitialisation des mots de passe ===\n');

    // Nouveaux mots de passe
    const superAdminPassword = 'SuperAdmin2024!';
    const orgAdminPassword = 'Admin2024!';

    // Hasher les mots de passe
    const hashedSuperAdmin = await bcrypt.hash(superAdminPassword, 10);
    const hashedOrgAdmin = await bcrypt.hash(orgAdminPassword, 10);

    // Réinitialiser le super-admin principal
    const superAdmin = await prisma.user.updateMany({
      where: {
        email: 'celia.ivorra95@hotmail.fr',
        role: 'SUPER_ADMIN'
      },
      data: {
        password: hashedSuperAdmin
      }
    });

    console.log('✅ Super-Admin mis à jour');
    console.log('   Email: celia.ivorra95@hotmail.fr');
    console.log('   Mot de passe:', superAdminPassword);
    console.log('   URL: http://localhost:3001/super-admin\n');

    // Réinitialiser l'admin Laia Skin
    const orgAdmin = await prisma.user.updateMany({
      where: {
        email: 'celia@laiaskin.com',
        role: 'ORG_ADMIN'
      },
      data: {
        password: hashedOrgAdmin
      }
    });

    console.log('✅ Admin Laia Skin mis à jour');
    console.log('   Email: celia@laiaskin.com');
    console.log('   Mot de passe:', orgAdminPassword);
    console.log('   URL: http://localhost:3001/admin\n');

    console.log('📝 Récapitulatif:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔴 SUPER ADMIN:');
    console.log('   Email: celia.ivorra95@hotmail.fr');
    console.log('   Mot de passe:', superAdminPassword);
    console.log('   URL: http://localhost:3001/super-admin');
    console.log('');
    console.log('🟢 ADMIN LAIA SKIN:');
    console.log('   Email: celia@laiaskin.com');
    console.log('   Mot de passe:', orgAdminPassword);
    console.log('   URL: http://localhost:3001/admin');
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPasswords();
