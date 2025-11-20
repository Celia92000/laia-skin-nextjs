import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Application du script SQL pour footerColor...\n');

  const sql = fs.readFileSync('add-footer-color.sql', 'utf-8');
  const statements = sql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        console.log(`Exécution: ${statement.trim().substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement.trim());
        console.log('✅ OK\n');
      } catch (error: any) {
        console.log(`⚠️  ${error.message}\n`);
      }
    }
  }

  console.log('🎉 Script appliqué avec succès !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
