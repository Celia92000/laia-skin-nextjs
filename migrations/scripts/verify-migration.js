#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VÉRIFICATION POST-MIGRATION
 *
 * Vérifie que toutes les données ont bien été importées
 *
 * USAGE:
 *   node migrations/scripts/verify-migration.js <organizationId>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ORGANIZATION_ID = process.argv[2];

if (!ORGANIZATION_ID) {
  console.error('❌ Erreur : Vous devez fournir un organizationId');
  console.log('Usage: node migrations/scripts/verify-migration.js <organizationId>');
  process.exit(1);
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🔍 VÉRIFICATION POST-MIGRATION          ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Vérifier l'organisation
  const org = await prisma.organization.findUnique({
    where: { id: ORGANIZATION_ID },
    select: { id: true, name: true }
  });

  if (!org) {
    console.error(`❌ Organisation introuvable : ${ORGANIZATION_ID}`);
    process.exit(1);
  }

  console.log(`🏢 Organisation : ${org.name}`);
  console.log(`🆔 ID : ${ORGANIZATION_ID}\n`);
  console.log('─'.repeat(50) + '\n');

  const checks = [];

  // 1. Vérifier les clients
  const clientsCount = await prisma.user.count({
    where: {
      organizationId: ORGANIZATION_ID,
      role: 'CLIENT'
    }
  });
  checks.push({
    label: 'Clients',
    count: clientsCount,
    status: clientsCount > 0 ? 'ok' : 'warning'
  });

  // 2. Vérifier les employés
  const employeesCount = await prisma.user.count({
    where: {
      organizationId: ORGANIZATION_ID,
      role: { in: ['STAFF', 'ORG_ADMIN', 'ORG_OWNER', 'LOCATION_MANAGER'] }
    }
  });
  checks.push({
    label: 'Employés',
    count: employeesCount,
    status: employeesCount > 0 ? 'ok' : 'warning'
  });

  // 3. Vérifier les services
  const servicesCount = await prisma.service.count({
    where: { organizationId: ORGANIZATION_ID }
  });
  checks.push({
    label: 'Services',
    count: servicesCount,
    status: servicesCount > 0 ? 'ok' : 'warning'
  });

  // 4. Vérifier les réservations
  const reservationsCount = await prisma.reservation.count({
    where: {
      user: {
        organizationId: ORGANIZATION_ID
      }
    }
  }).catch(() => 0);
  checks.push({
    label: 'Réservations',
    count: reservationsCount,
    status: 'info'
  });

  // 5. Vérifier les cartes cadeaux
  const giftCardsCount = await prisma.giftCard.count({
    where: { organizationId: ORGANIZATION_ID }
  }).catch(() => 0);
  checks.push({
    label: 'Cartes cadeaux',
    count: giftCardsCount,
    status: 'info'
  });

  // 6. Vérifier les produits
  const productsCount = await prisma.product.count({
    where: { organizationId: ORGANIZATION_ID }
  }).catch(() => 0);
  checks.push({
    label: 'Produits',
    count: productsCount,
    status: 'info'
  });

  // Afficher les résultats
  console.log('📊 RÉSUMÉ DES DONNÉES\n');
  checks.forEach(check => {
    const icon = check.status === 'ok' ? '✅' :
                 check.status === 'warning' ? '⚠️ ' : 'ℹ️ ';
    const count = check.count.toString().padStart(5);
    console.log(`${icon} ${check.label.padEnd(20)} ${count} éléments`);
  });

  console.log('\n' + '─'.repeat(50));

  // Vérifications supplémentaires
  console.log('\n🔍 VÉRIFICATIONS DÉTAILLÉES\n');

  // Emails en double ?
  const duplicateEmails = await prisma.user.groupBy({
    by: ['email'],
    where: { organizationId: ORGANIZATION_ID },
    _count: { email: true },
    having: {
      email: {
        _count: {
          gt: 1
        }
      }
    }
  });

  if (duplicateEmails.length > 0) {
    console.log(`⚠️  ${duplicateEmails.length} email(s) en double détecté(s)`);
    duplicateEmails.forEach(dup => {
      console.log(`   - ${dup.email} (${dup._count.email} fois)`);
    });
  } else {
    console.log('✅ Aucun email en double');
  }

  // Clients sans mot de passe ?
  const usersWithoutPassword = await prisma.user.count({
    where: {
      organizationId: ORGANIZATION_ID,
      password: null
    }
  });

  if (usersWithoutPassword > 0) {
    console.log(`⚠️  ${usersWithoutPassword} utilisateur(s) sans mot de passe`);
  } else {
    console.log('✅ Tous les utilisateurs ont un mot de passe');
  }

  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║          ✨ VÉRIFICATION TERMINÉE          ║');
  console.log('╚════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('❌ Erreur:', error);
  prisma.$disconnect();
  process.exit(1);
});
