import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'laia-skin-institut' },
    select: { id: true, name: true }
  });

  if (!org) {
    console.log('Organisation non trouvée');
    return;
  }

  console.log('Organisation:', org.name);
  console.log('ID:', org.id);
  console.log('');

  const users = await prisma.user.findMany({
    where: { organizationId: org.id },
    select: {
      email: true,
      name: true,
      role: true
    }
  });

  console.log('Utilisateurs de cette organisation:');
  users.forEach(u => {
    console.log(`- ${u.email} | ${u.name} | Rôle: ${u.role}`);
  });

  console.log('\n--- Rôles disponibles ---');
  console.log('SUPER_ADMIN: Super-admin LAIA Connect → /super-admin');
  console.log('ORG_OWNER / ORG_ADMIN / ADMIN: Admin institut → /admin');
}

main().then(() => process.exit(0)).catch(console.error);
