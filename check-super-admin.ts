import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    // Chercher tous les super admins
    const superAdmins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\n=== SUPER ADMINS TROUVÉS ===\n');
    if (superAdmins.length === 0) {
      console.log('❌ Aucun compte SUPER_ADMIN trouvé dans la base de données');
    } else {
      superAdmins.forEach((admin, i) => {
        console.log(`${i + 1}. ${admin.name} (${admin.email})`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Créé: ${admin.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();
