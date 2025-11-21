import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getMyAccounts() {
  try {
    console.log('🔍 Recherche de tous les comptes admin de Célia...\n');

    // Récupérer tous les comptes admin
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
        organizationId: true,
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { role: 'desc' },
        { email: 'asc' },
      ],
    });

    if (admins.length === 0) {
      console.log('❌ Aucun compte trouvé');
      return;
    }

    console.log(`✅ ${admins.length} compte(s) trouvé(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. 📧 ${admin.email}`);
      console.log(`   👤 Nom: ${admin.name || 'Non défini'}`);
      console.log(`   🎭 Rôle: ${admin.role}`);
      if (admin.organization) {
        console.log(`   🏢 Organisation: ${admin.organization.name} (${admin.organization.slug})`);
      }
      console.log('');
    });

    console.log('\n📝 Note importante:');
    console.log('Pour obtenir les mots de passe, exécutez:');
    console.log('npx tsx scripts/reset-simple-passwords.ts');
    console.log('\nOu utilisez la fonction "Mot de passe oublié" sur le site.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getMyAccounts();
