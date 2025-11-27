import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
      email: {
        not: ''
      }
    },
    select: {
      email: true,
      name: true,
      phone: true,
      organizationId: true
    },
    take: 5
  });

  console.log('\n=== COMPTES CLIENTS DISPONIBLES ===\n');
  console.log(JSON.stringify(clients, null, 2));
  console.log('\n✅ Pour tester le système d\'avis, connectez-vous avec un de ces emails');
  console.log('📧 Mot de passe par défaut à réinitialiser via "Mot de passe oublié"\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
