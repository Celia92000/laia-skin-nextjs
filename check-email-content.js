const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmailContent() {
  try {
    const email = await prisma.emailHistory.findFirst({
      where: { template: 'onboarding_welcome' },
      orderBy: { createdAt: 'desc' }
    });

    if (!email) {
      console.log('❌ Aucun email de bienvenue trouvé');
      return;
    }

    console.log(`\n📧 Email de bienvenue envoyé le ${email.createdAt.toLocaleString('fr-FR')}:\n`);
    console.log('Sujet:', email.subject);
    console.log('\n--- Contenu HTML ---\n');

    // Chercher "LAIA" dans le contenu
    const laiaMatches = email.content.match(/LAIA[^<]*/g) || [];
    console.log('Occurrences de "LAIA" dans l\'email:');
    laiaMatches.forEach((match, i) => {
      console.log(`  ${i + 1}. "${match}"`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailContent();
