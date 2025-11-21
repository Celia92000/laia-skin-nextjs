const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteOrg() {
  const orgId = process.argv[2];

  if (!orgId) {
    console.error('❌ Veuillez fournir un ID d\'organisation');
    process.exit(1);
  }

  try {
    // Supprimer l'organisation et toutes ses dépendances en cascade
    await prisma.organization.delete({
      where: { id: orgId }
    });

    console.log(`✅ Organisation ${orgId} supprimée`);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOrg();
