import { config } from 'dotenv';
import { resolve } from 'path';
import { getPrismaClient } from './src/lib/prisma';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

async function listAllAdmins() {
  console.log('👥 Liste de tous les comptes admin...\n');

  try {
    const prisma = await getPrismaClient();

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true
      },
      orderBy: {
        role: 'asc'
      }
    });

    if (admins.length > 0) {
      console.log(`✅ ${admins.length} compte(s) admin trouvé(s):\n`);

      admins.forEach((admin, idx) => {
        console.log(`${idx + 1}. ${admin.email}`);
        console.log(`   Nom: ${admin.name}`);
        console.log(`   Rôle: ${admin.role}`);
        console.log(`   Organization ID: ${admin.organizationId || 'N/A'}`);
        console.log('');
      });

      console.log('📝 Quel est le bon email admin que vous utilisez ?');
    } else {
      console.log('❌ Aucun compte admin trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

listAllAdmins();
