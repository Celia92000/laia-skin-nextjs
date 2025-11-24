import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'laia-skin-institut' },
    include: {
      config: true
    }
  });

  if (org) {
    console.log('📋 Organisation:', org.name);
    console.log('🎨 Template actuel:', org.config?.websiteTemplate || org.config?.homeTemplate || 'Non défini');
    console.log('🎨 Home template:', org.config?.homeTemplate || 'Non défini');
    console.log('🎨 Website template:', org.config?.websiteTemplate || 'Non défini');
  } else {
    console.log('❌ Organisation non trouvée');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
