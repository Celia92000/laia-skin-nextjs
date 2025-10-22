import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateDefaultPasswords() {
  console.log('🔐 Mise à jour des mots de passe par défaut...\n');

  try {
    // Générer des mots de passe sécurisés
    const securePasswords = {
      superAdmin: generateSecurePassword(20),
      admin: generateSecurePassword(16),
    };

    console.log('📝 NOUVEAUX MOTS DE PASSE GÉNÉRÉS :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Super Admin: ${securePasswords.superAdmin}`);
    console.log(`Admin:       ${securePasswords.admin}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  COPIEZ CES MOTS DE PASSE MAINTENANT ! Ils ne seront plus affichés.\n');

    // Hash des nouveaux mots de passe
    const hashedSuperAdmin = await bcrypt.hash(securePasswords.superAdmin, 10);
    const hashedAdmin = await bcrypt.hash(securePasswords.admin, 10);

    // Mise à jour du Super Admin
    const superAdminUpdated = await prisma.user.updateMany({
      where: {
        email: 'superadmin@laiaskin.com',
        role: 'SUPER_ADMIN',
      },
      data: {
        password: hashedSuperAdmin,
      },
    });

    console.log(`✅ Super Admin mis à jour: ${superAdminUpdated.count} utilisateur(s)`);

    // Mise à jour de l'Admin
    const adminUpdated = await prisma.user.updateMany({
      where: {
        email: 'admin@laiaskin.com',
        role: { in: ['ORG_ADMIN', 'ORG_OWNER'] },
      },
      data: {
        password: hashedAdmin,
      },
    });

    console.log(`✅ Admin mis à jour: ${adminUpdated.count} utilisateur(s)`);

    // Mise à jour des clients avec mot de passe par défaut (si existants)
    const clientsUpdated = await prisma.user.updateMany({
      where: {
        role: 'CLIENT',
        // Ajouter ici une condition pour identifier les comptes avec mots de passe faibles
        // Par exemple : createdAt avant une certaine date, ou un flag spécifique
      },
      data: {
        // Force password change on next login
        resetToken: 'FORCE_PASSWORD_CHANGE',
      },
    });

    if (clientsUpdated.count > 0) {
      console.log(`⚠️  ${clientsUpdated.count} client(s) devront changer leur mot de passe à la prochaine connexion`);
    }

    console.log('\n✅ Mise à jour terminée avec succès !');
    console.log('\n📋 PROCHAINES ÉTAPES :');
    console.log('1. Notez les nouveaux mots de passe en lieu sûr (gestionnaire de mots de passe)');
    console.log('2. Testez la connexion avec les nouveaux identifiants');
    console.log('3. Supprimez ce fichier script pour des raisons de sécurité');
    console.log('4. Ne commitez JAMAIS les mots de passe dans Git\n');

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateSecurePassword(length: number): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sans I, O
  const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // Sans l, o
  const numbers = '23456789'; // Sans 0, 1
  const symbols = '@#$%&*+=!?';
  const all = uppercase + lowercase + numbers + symbols;

  let password = '';

  // Assurer au moins 1 de chaque type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Compléter avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Exécuter le script
updateDefaultPasswords()
  .catch(console.error);
