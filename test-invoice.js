const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [
          { name: { contains: 'celia', mode: 'insensitive' } },
          { name: { contains: 'TEST', mode: 'insensitive' } }
        ]
      }
    });

    if (!org) {
      console.error('❌ Organisation introuvable');
      process.exit(1);
    }

    console.log(`✅ Organisation trouvée: ${org.name} (${org.id})`);
    console.log(`\nPour générer la facture, ouvre cette URL dans ton navigateur:\n`);
    console.log(`http://localhost:3001/api/test/generate-invoice?organizationId=${org.id}`);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
