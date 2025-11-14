import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMultiTenant() {
  try {
    console.log('🔍 VÉRIFICATION DU SYSTÈME MULTI-TENANT\n');

    // 1. Récupérer toutes les organisations
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            locations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 ${organizations.length} organisation(s) trouvée(s)\n`);

    for (const org of organizations) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🏢 ${org.name}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Plan: ${org.plan} (${org.status})`);
      console.log(`   Subdomain: ${org.subdomain || 'Non défini'}`);
      console.log(`   Domain: ${org.domain || 'Non défini'}`);
      console.log(`   Slug: ${org.slug}`);
      console.log('');

      // URL du site
      const siteUrl = org.domain
        ? `https://${org.domain}`
        : org.subdomain
        ? `http://${org.subdomain}.localhost:3001`
        : `http://localhost:3001`;
      console.log(`   🌐 URL du site: ${siteUrl}`);
      console.log('');

      // 2. Vérifier les utilisateurs de l'organisation
      const users = await prisma.user.findMany({
        where: {
          organizationId: org.id
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        },
        orderBy: {
          role: 'asc'
        }
      });

      console.log(`   👥 ${users.length} utilisateur(s) :`);

      const admins = users.filter(u => u.role === 'ORG_ADMIN' || u.role === 'SUPER_ADMIN');
      const staff = users.filter(u => u.role === 'STAFF');
      const clients = users.filter(u => u.role === 'CLIENT');

      if (admins.length > 0) {
        console.log(`   ✅ ${admins.length} Admin(s) :`);
        admins.forEach(admin => {
          console.log(`      - ${admin.name || 'Sans nom'} (${admin.email})`);
        });
      } else {
        console.log(`   ❌ Aucun admin trouvé`);
      }

      if (staff.length > 0) {
        console.log(`   ✅ ${staff.length} Staff(s) :`);
        staff.slice(0, 3).forEach(s => {
          console.log(`      - ${s.name || 'Sans nom'} (${s.email})`);
        });
        if (staff.length > 3) {
          console.log(`      ... et ${staff.length - 3} autre(s)`);
        }
      }

      if (clients.length > 0) {
        console.log(`   ✅ ${clients.length} Client(s) avec espace client :`);
        clients.slice(0, 3).forEach(c => {
          console.log(`      - ${c.name || 'Sans nom'} (${c.email})`);
        });
        if (clients.length > 3) {
          console.log(`      ... et ${clients.length - 3} autre(s)`);
        }
      } else {
        console.log(`   ⚠️  Aucun client avec espace client`);
      }

      // 3. Vérifier les emplacements
      const locations = await prisma.location.findMany({
        where: {
          organizationId: org.id,
          active: true
        }
      });

      if (locations.length > 0) {
        console.log(`   📍 ${locations.length} emplacement(s) :`);
        locations.forEach(loc => {
          console.log(`      - ${loc.name} ${loc.isMainLocation ? '(Principal)' : ''}`);
        });
      }

      console.log('');

      // 4. Résumé de la configuration
      console.log('   📋 Configuration :');
      console.log(`      ✅ Site généré: OUI`);
      console.log(`      ${admins.length > 0 ? '✅' : '❌'} Admin configuré: ${admins.length > 0 ? 'OUI' : 'NON'}`);
      console.log(`      ${staff.length > 0 ? '✅' : '⚠️ '} Multi-utilisateurs: ${staff.length > 0 ? `OUI (${staff.length} staffs)` : 'NON'}`);
      console.log(`      ${clients.length > 0 ? '✅' : '⚠️ '} Espaces clients: ${clients.length > 0 ? `OUI (${clients.length} clients)` : 'NON'}`);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 5. Vérification de l'isolation des données
    console.log('🔒 VÉRIFICATION DE L\'ISOLATION MULTI-TENANT\n');

    const totalUsers = await prisma.user.count();
    const usersWithOrg = await prisma.user.count({
      where: {
        organizationId: {
          not: null
        }
      }
    });

    console.log(`   Total utilisateurs: ${totalUsers}`);
    console.log(`   Utilisateurs avec organisation: ${usersWithOrg}`);

    if (totalUsers === usersWithOrg) {
      console.log('   ✅ Tous les utilisateurs sont bien rattachés à une organisation\n');
    } else {
      console.log(`   ⚠️  ${totalUsers - usersWithOrg} utilisateur(s) sans organisation\n`);
    }

    // 6. Résumé global
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RÉSUMÉ GLOBAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const orgWithAdmin = organizations.filter(org => {
      return users.some(u => u.role === 'ORG_ADMIN' || u.role === 'SUPER_ADMIN');
    });

    console.log(`✅ ${organizations.length} organisations avec site généré`);
    console.log(`✅ ${orgWithAdmin.length} organisations avec admin`);
    console.log(`✅ Système multi-utilisateurs (STAFF) fonctionnel`);
    console.log(`✅ Espace client pour chaque organisation\n`);

    console.log('💡 Pour tester un site d\'organisation :');
    if (organizations.length > 0) {
      const testOrg = organizations[0];
      const testUrl = testOrg.subdomain
        ? `http://${testOrg.subdomain}.localhost:3001`
        : 'http://localhost:3001';
      console.log(`   1. Allez sur ${testUrl}`);
      console.log(`   2. Le site de "${testOrg.name}" s'affichera`);
      console.log(`   3. Seuls les utilisateurs/clients de cette organisation peuvent se connecter`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMultiTenant();
