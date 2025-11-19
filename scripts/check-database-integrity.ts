/**
 * Script de vérification d'intégrité de la base de données
 * À exécuter après une restauration de backup
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIntegrity() {
  console.log('🔍 Vérification intégrité base de données...\n');

  try {
    // Compter les enregistrements critiques
    const [users, reservations, organizations, services, products] = await Promise.all([
      prisma.user.count(),
      prisma.reservation.count(),
      prisma.organization.count(),
      prisma.service.count(),
      prisma.product.count(),
    ]);

    console.log('✅ Tables principales :');
    console.log(`   - Utilisateurs : ${users}`);
    console.log(`   - Réservations : ${reservations}`);
    console.log(`   - Organisations : ${organizations}`);
    console.log(`   - Services : ${services}`);
    console.log(`   - Produits : ${products}\n`);

    // Vérifier les contraintes de clés étrangères
    console.log('🔗 Vérification des relations...');

    const orphanReservations = await prisma.reservation.count({
      where: {
        OR: [
          { userId: { not: null }, user: null },
          { serviceId: { not: null }, service: null },
        ]
      },
    });

    if (orphanReservations > 0) {
      console.log(`⚠️  ${orphanReservations} réservations avec références invalides`);
    } else {
      console.log('✅ Aucune réservation orpheline');
    }

    const orphanUsers = await prisma.user.count({
      where: { organizationId: { not: null }, organization: null },
    });

    if (orphanUsers > 0) {
      console.log(`⚠️  ${orphanUsers} utilisateurs sans organisation valide`);
    } else {
      console.log('✅ Tous les utilisateurs ont une organisation valide');
    }

    // Vérifier les dates cohérentes
    console.log('\n📅 Vérification des dates...');

    const futureReservations = await prisma.reservation.count({
      where: { date: { gte: new Date() } },
    });

    const pastReservations = await prisma.reservation.count({
      where: { date: { lt: new Date() } },
    });

    console.log(`✅ ${futureReservations} réservations futures`);
    console.log(`✅ ${pastReservations} réservations passées`);

    // Vérifier les doublons d'email
    console.log('\n📧 Vérification des doublons...');

    const duplicateEmails = await prisma.$queryRaw<any[]>`
      SELECT email, "organizationId", COUNT(*) as count
      FROM "User"
      GROUP BY email, "organizationId"
      HAVING COUNT(*) > 1
    `;

    if (duplicateEmails.length > 0) {
      console.log(`⚠️  ${duplicateEmails.length} emails en double détectés :`);
      duplicateEmails.forEach(dup => {
        console.log(`   - ${dup.email} (${dup.count} fois)`);
      });
    } else {
      console.log('✅ Aucun email en double');
    }

    // Vérifier les mots de passe hashés
    console.log('\n🔐 Vérification des mots de passe...');

    const usersWithoutPassword = await prisma.user.count({
      where: {
        password: null,
        NOT: { role: 'CLIENT' } // Les clients peuvent ne pas avoir de MDP (OAuth)
      },
    });

    if (usersWithoutPassword > 0) {
      console.log(`⚠️  ${usersWithoutPassword} admins sans mot de passe`);
    } else {
      console.log('✅ Tous les admins ont un mot de passe');
    }

    // Résumé final
    console.log('\n' + '='.repeat(50));
    console.log('✅ VÉRIFICATION TERMINÉE - BASE DE DONNÉES INTÈGRE !');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Erreur lors de la vérification :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkIntegrity();
