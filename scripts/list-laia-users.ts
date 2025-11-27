import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listLaiaUsers() {
  try {
    // Récupérer l'organisation Laia Skin Institut
    const org = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' }
    });

    if (!org) {
      console.log('❌ Organisation "laia-skin-institut" non trouvée');
      return;
    }

    console.log(`✅ Organisation trouvée: ${org.name} (ID: ${org.id})\n`);

    // Récupérer tous les utilisateurs de cette organisation
    const users = await prisma.user.findMany({
      where: { organizationId: org.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      },
      orderBy: { role: 'asc' }
    });

    console.log(`📊 Total: ${users.length} utilisateur(s) trouvé(s)\n`);

    if (users.length === 0) {
      console.log('❌ AUCUN UTILISATEUR pour cette organisation !');
      console.log('   → Vous devez créer un utilisateur pour pouvoir vous connecter\n');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sans nom'}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Mot de passe: ${user.password ? '✅ Défini' : '❌ NON défini (OAuth uniquement)'}`);
        console.log('');
      });

      console.log('\n💡 Pour vous connecter à l\'admin:');
      console.log('   1. Allez sur http://localhost:3001/connexion');
      console.log('   2. Utilisez un des emails ci-dessus');
      console.log('   3. Si vous ne connaissez pas le mot de passe, utilisez "Mot de passe oublié"\n');

      const usersWithoutPassword = users.filter(u => !u.password);
      if (usersWithoutPassword.length > 0) {
        console.log('⚠️  Utilisateurs SANS mot de passe (OAuth uniquement):');
        usersWithoutPassword.forEach(u => console.log(`   - ${u.email}`));
        console.log('   Ces utilisateurs ne peuvent PAS se connecter avec email/mot de passe\n');
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listLaiaUsers();
