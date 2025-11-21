import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'laia-skin-institut' },
    include: { config: true }
  });

  if (!org || !org.config) {
    console.log('Organisation ou config introuvable');
    return;
  }

  await prisma.organizationConfig.update({
    where: { id: org.config.id },
    data: {
      siteName: 'Laia Skin Institut'
    }
  });

  console.log('✅ siteName mis à jour : Laia Skin Institut');
}

main().then(() => process.exit(0)).catch(console.error);
