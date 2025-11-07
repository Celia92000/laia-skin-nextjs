import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'laia-skin-institut' }
  });

  if (!org) {
    console.log('Organisation non trouvée');
    return;
  }

  // Emails des vrais super-admins de LAIA Connect (qui doivent garder SUPER_ADMIN)
  const superAdminEmails = [
    'celia.ivorra95@hotmail.fr',  // Votre email personnel
  ];

  // Changer les admins de l'institut de SUPER_ADMIN → ORG_ADMIN
  const adminsToChange = await prisma.user.findMany({
    where: {
      organizationId: org.id,
      role: 'SUPER_ADMIN',
      email: { notIn: superAdminEmails }
    }
  });

  console.log(`Mise à jour de ${adminsToChange.length} utilisateurs...`);

  for (const user of adminsToChange) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ORG_ADMIN' }
    });
    console.log(`✅ ${user.email} → ORG_ADMIN`);
  }

  // Afficher les super-admins qui restent
  console.log('\nSuper-admins LAIA Connect (conservés):');
  superAdminEmails.forEach(email => console.log(`- ${email}`));
}

main().then(() => process.exit(0)).catch(console.error);
