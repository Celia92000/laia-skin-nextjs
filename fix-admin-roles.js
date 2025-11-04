const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminRoles() {
  try {
    console.log('🔍 Recherche des utilisateurs avec des rôles incorrects...\n');

    // Trouver tous les utilisateurs qui ont une organisation mais sont marqués comme CLIENT
    const usersToFix = await prisma.user.findMany({
      where: {
        role: 'CLIENT',
        organizationId: { not: null }
      },
      include: {
        organization: {
          select: {
            name: true,
            ownerEmail: true
          }
        }
      }
    });

    console.log(`📊 ${usersToFix.length} utilisateur(s) trouvé(s) avec rôle CLIENT mais ayant une organisation\n`);

    if (usersToFix.length === 0) {
      console.log('✅ Aucune correction nécessaire !');
      return;
    }

    // Afficher les utilisateurs à corriger
    usersToFix.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Organisation: ${user.organization?.name}`);
      console.log(`   Rôle actuel: ${user.role}`);
      console.log('');
    });

    // Demander confirmation
    console.log('⚠️  Ces utilisateurs seront mis à jour avec le rôle ORG_ADMIN\n');

    // Mise à jour automatique
    for (const user of usersToFix) {
      // Vérifier si c'est l'email du propriétaire de l'organisation
      const isOwner = user.email === user.organization?.ownerEmail;
      const newRole = isOwner ? 'ORG_ADMIN' : 'STAFF';

      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
      });

      console.log(`✅ ${user.email} → ${newRole}`);
    }

    console.log('\n🎉 Correction terminée avec succès !');
    console.log('\n💡 Vous pouvez maintenant vous reconnecter avec vos identifiants admin.');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRoles();
