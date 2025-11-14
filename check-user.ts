import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: 'superadmin@laiaskin.com'
      },
      include: {
        organization: true
      }
    });

    if (user) {
      console.log('✅ Utilisateur trouvé:');
      console.log('Email:', user.email);
      console.log('Nom:', user.name);
      console.log('Rôle:', user.role);
      console.log('Organisation:', user.organization.name);
      console.log('ID:', user.id);
    } else {
      console.log('❌ Utilisateur superadmin@laiaskin.com NON trouvé');
      console.log('');
      console.log('Voulez-vous créer ce compte ?');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
