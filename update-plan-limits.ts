import { PrismaClient } from '@prisma/client';
import { PLAN_LIMITS } from './src/lib/plan-limits';

const prisma = new PrismaClient();

async function updatePlanLimits() {
  console.log('🔄 Mise à jour des limites par plan...\n');

  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      plan: true,
      maxUsers: true,
      _count: {
        select: {
          users: true
        }
      }
    }
  });

  for (const org of organizations) {
    const limits = PLAN_LIMITS[org.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.SOLO;

    if (org.maxUsers !== limits.maxUsers) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          maxUsers: limits.maxUsers,
          maxLocations: limits.maxLocations,
          maxStorage: limits.maxStorage
        }
      });

      console.log(`✅ ${org.name}`);
      console.log(`   Plan: ${org.plan}`);
      console.log(`   Limite utilisateurs: ${org.maxUsers} → ${limits.maxUsers}`);
      console.log(`   Utilisateurs actuels: ${org._count.users}/${limits.maxUsers}`);
      console.log('');
    }
  }

  console.log('✅ Mise à jour terminée !');
}

updatePlanLimits()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
