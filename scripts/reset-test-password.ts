#!/usr/bin/env ts-node

/**
 * Script pour réinitialiser un mot de passe de test simple
 * Usage: npx tsx scripts/reset-test-password.ts
 */

import { getPrismaClient } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const TEST_PASSWORD = 'Test1234!'; // Mot de passe simple pour test

async function main() {
  console.log('🔐 Réinitialisation du mot de passe de test...\n');

  const prisma = await getPrismaClient();

  // Trouver le premier admin d'organisation
  const admin = await prisma.user.findFirst({
    where: {
      role: 'ORG_ADMIN',
      organizationId: { not: null }
    },
    select: {
      id: true,
      email: true,
      role: true,
      organizationId: true,
      organization: {
        select: {
          name: true,
          slug: true
        }
      }
    }
  });

  if (!admin) {
    console.error('❌ Aucun compte ORG_ADMIN trouvé');
    process.exit(1);
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  // Mettre à jour le mot de passe
  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashedPassword }
  });

  console.log('✅ Mot de passe réinitialisé avec succès !\n');
  console.log('📧 Email     :', admin.email);
  console.log('🔑 Password  :', TEST_PASSWORD);
  console.log('👤 Rôle      :', admin.role);
  console.log('🏢 Organisation :', admin.organization?.name || 'N/A');
  console.log('🔗 Slug      :', admin.organization?.slug || 'N/A');
  console.log('\n🌐 URL de connexion : http://localhost:3001/login');
  console.log('\n⚠️  Ce mot de passe est UNIQUEMENT pour le développement !');

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
