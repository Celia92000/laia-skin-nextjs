import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrgName() {
  try {
    console.log('🔍 Vérification de toutes les organisations...\n');

    const orgs = await prisma.organization.findMany({
      include: {
        config: true
      }
    });

    for (const org of orgs) {
      console.log('📋 Organisation :', org.name);
      console.log('   Slug :', org.slug);
      console.log('   Subdomain :', org.subdomain);
      console.log('   siteName dans config :', org.config?.siteName || 'null');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrgName();
