import { config } from 'dotenv';
import { resolve } from 'path';
import { getPrismaClient } from './src/lib/prisma';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function listAllAdmins() {
  console.log('👥 Liste de tous les comptes...');
  console.log('');

  try {
    const prisma = await getPrismaClient();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true
      },
      orderBy: {
        role: 'asc'
      },
      take: 20
    });

    if (users.length > 0) {
      console.log('✅ Comptes trouvés:');
      console.log('');

      users.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.email}`);
        console.log(`   Nom: ${user.name}`);
        console.log(`   Rôle: ${user.role}`);
        console.log('');
      });
    } else {
      console.log('❌ Aucun compte trouvé');
    }
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

listAllAdmins();
