import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAdminAccounts() {
  try {
    console.log('=== Comptes administrateurs ===\n');

    // Récupérer les comptes SUPER_ADMIN
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        email: true,
        name: true,
        role: true
      },
      orderBy: { email: 'asc' }
    });

    console.log('🔴 SUPER ADMIN (pour /super-admin):');
    if (superAdmins.length > 0) {
      superAdmins.forEach(admin => {
        console.log(`  - Email: ${admin.email}`);
        console.log(`    Nom: ${admin.name}`);
        console.log('');
      });
    } else {
      console.log('  Aucun super-admin trouvé\n');
    }

    // Récupérer les comptes ORG_ADMIN de Laia Skin Institut
    const orgAdmins = await prisma.user.findMany({
      where: {
        role: 'ORG_ADMIN',
        Organization: {
          slug: 'laia-skin-institut'
        }
      },
      select: {
        email: true,
        name: true,
        role: true,
        Organization: {
          select: {
            name: true
          }
        }
      },
      orderBy: { email: 'asc' }
    });

    console.log('🟢 ORG ADMIN de Laia Skin Institut (pour /admin):');
    if (orgAdmins.length > 0) {
      orgAdmins.forEach(admin => {
        console.log(`  - Email: ${admin.email}`);
        console.log(`    Nom: ${admin.name}`);
        console.log(`    Organisation: ${admin.Organization?.name}`);
        console.log('');
      });
    } else {
      console.log('  Aucun admin Laia Skin Institut trouvé\n');
    }

    console.log('\n📝 URLs d\'accès:');
    console.log('  Super Admin: http://localhost:3001/super-admin');
    console.log('  Admin Laia Skin: http://localhost:3001/admin');
    console.log('  Login: http://localhost:3001/login');

    console.log('\n⚠️  Les mots de passe ne sont jamais affichés pour des raisons de sécurité.');
    console.log('    Si vous avez oublié un mot de passe, utilisez la fonction "Mot de passe oublié".');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAdminAccounts();