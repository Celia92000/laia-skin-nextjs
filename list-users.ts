import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    // Trouver l'organisation Laia Skin Institut
    const org = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: 'laia-skin-institut' },
          { subdomain: 'laia-skin-institut' }
        ]
      }
    });

    if (!org) {
      console.log('❌ Organisation Laia Skin Institut non trouvée');
      return;
    }

    console.log('✅ Organisation trouvée:', org.name);
    console.log('ID:', org.id);
    console.log('');

    // Lister tous les utilisateurs de cette organisation
    const users = await prisma.user.findMany({
      where: {
        organizationId: org.id
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    console.log(`📋 ${users.length} utilisateur(s) trouvé(s) :\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role} - ${user.name || 'Sans nom'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`);
      console.log('');
    });

    console.log('\n💡 Pour réinitialiser un mot de passe :');
    console.log('   1. Utilisez la fonction "Mot de passe oublié" sur /login');
    console.log('   2. Ou créez un nouveau mot de passe avec hashPassword()');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
