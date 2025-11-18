import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Récupérer Laia Skin Institut
  const org = await prisma.organization.findUnique({
    where: { slug: 'laia-skin' },
    include: { config: true }
  });

  if (!org) {
    console.log('❌ Organisation Laia Skin Institut introuvable');
    await prisma.$disconnect();
    return;
  }

  if (!org.config) {
    console.log('❌ Aucune configuration trouvée pour Laia Skin Institut');
    await prisma.$disconnect();
    return;
  }

  // Mettre à jour la configuration
  await prisma.organizationConfig.update({
    where: { id: org.config.id },
    data: {
      address: 'Allée Jean de la Fontaine',
      city: 'Votre Ville', // À compléter avec la vraie ville
      postalCode: '00000', // À compléter avec le vrai code postal
      founderName: null, // Pas de nom personnel dans les emails
      legalRepName: 'Célia IVORRA'
    }
  });

  console.log('✅ Configuration mise à jour pour Laia Skin Institut');
  console.log('   Adresse: Allée Jean de la Fontaine');
  console.log('   Responsable légale: Célia IVORRA');
  console.log('   Signature emails: LAIA SKIN Institut (anonyme)');
  console.log('');
  console.log('⚠️  Pensez à compléter la ville et le code postal !');

  await prisma.$disconnect();
}

main();
