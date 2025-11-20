import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Mise à jour des couleurs LAIA Skin Institut...\n');

  // Trouver l'organisation Laia Skin Institut
  const org = await prisma.organization.findFirst({
    where: { slug: 'laia-skin-institut' },
    include: { config: true }
  });

  if (!org) {
    console.error('❌ Organisation Laia Skin Institut non trouvée');
    return;
  }

  console.log(`✅ Organisation trouvée: ${org.name} (${org.id})\n`);

  // Couleurs LAIA Skin Institut
  const colors = {
    primaryColor: '#d4b5a0',     // Or rosé
    secondaryColor: '#c9a084',   // Or plus foncé
    accentColor: '#2c3e50',      // Bleu foncé
    footerColor: '#2c3e50'       // Bleu foncé (même que accent)
  };

  console.log('📝 Nouvelles couleurs:');
  console.log(`  Primary   : ${colors.primaryColor}`);
  console.log(`  Secondary : ${colors.secondaryColor}`);
  console.log(`  Accent    : ${colors.accentColor}`);
  console.log(`  Footer    : ${colors.footerColor}\n`);

  // Mettre à jour ou créer la config
  if (org.config) {
    await prisma.organizationConfig.update({
      where: { id: org.config.id },
      data: colors
    });
    console.log('✅ Configuration mise à jour !');
  } else {
    await prisma.organizationConfig.create({
      data: {
        organizationId: org.id,
        ...colors,
        siteName: org.name,
        siteTagline: 'Une peau respectée, une beauté révélée'
      }
    });
    console.log('✅ Configuration créée !');
  }

  console.log('\n🎉 Couleurs LAIA Skin Institut mises à jour avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
