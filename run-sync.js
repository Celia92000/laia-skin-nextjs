const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runSync() {
  const sql = fs.readFileSync('sync-database-simple.sql', 'utf8');

  // Diviser le script en commandes individuelles
  const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);

  console.log(`Exécution de ${commands.length} commandes SQL...`);

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i].trim();
    if (!cmd) continue;

    console.log(`\n[${i + 1}/${commands.length}] Exécution...`);

    try {
      await prisma.$executeRawUnsafe(cmd);
      console.log(`✓ Succès`);
    } catch (error) {
      console.error(`✗ Erreur:`, error.message);
    }
  }

  console.log('\n✅ Synchronisation terminée !');
}

runSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
