import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification des organisations et comptes admin...\n');

  // Lister toutes les organisations
  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      subdomain: true,
      status: true
    }
  });

  console.log('📊 Organisations trouvées:');
  orgs.forEach((org, i) => {
    console.log(`\n${i + 1}. ${org.name}`);
    console.log(`   ID: ${org.id}`);
    console.log(`   Slug: ${org.slug}`);
    console.log(`   Subdomain: ${org.subdomain || 'N/A'}`);
    console.log(`   Status: ${org.status}`);
  });

  // Pour chaque organisation, lister les admins
  for (const org of orgs) {
    console.log(`\n\n👥 Utilisateurs admin de "${org.name}":`);

    const admins = await prisma.user.findMany({
      where: {
        organizationId: org.id,
        role: {
          in: ['ORG_ADMIN', 'SUPER_ADMIN', 'ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true
      }
    });

    if (admins.length === 0) {
      console.log('   ❌ Aucun admin trouvé pour cette organisation');
    } else {
      admins.forEach((admin, i) => {
        console.log(`\n   ${i + 1}. ${admin.name || 'Sans nom'}`);
        console.log(`      Email: ${admin.email}`);
        console.log(`      Role: ${admin.role}`);
        console.log(`      Actif: ${admin.active ? '✅' : '❌'}`);
        console.log(`      ID: ${admin.id}`);
      });
    }
  }

  // Vérifier s'il y a des super admins
  console.log('\n\n🔐 Super Admins globaux:');
  const superAdmins = await prisma.user.findMany({
    where: {
      role: 'SUPER_ADMIN'
    },
    select: {
      id: true,
      email: true,
      name: true,
      organizationId: true,
      active: true
    }
  });

  if (superAdmins.length === 0) {
    console.log('   ❌ Aucun super admin trouvé');
  } else {
    superAdmins.forEach((admin, i) => {
      console.log(`\n   ${i + 1}. ${admin.name || 'Sans nom'}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Actif: ${admin.active ? '✅' : '❌'}`);
      console.log(`      Organisation ID: ${admin.organizationId || 'N/A'}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
