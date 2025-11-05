const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmails() {
  try {
    const emails = await prisma.emailHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        from: true,
        to: true,
        subject: true,
        template: true,
        status: true,
        createdAt: true
      }
    });

    if (emails.length === 0) {
      console.log('❌ Aucun email trouvé dans l\'historique');
      return;
    }

    console.log(`\n📧 ${emails.length} derniers emails envoyés:\n`);
    emails.forEach((email, index) => {
      console.log(`${index + 1}. ${email.subject}`);
      console.log(`   De: ${email.from}`);
      console.log(`   À: ${email.to}`);
      console.log(`   Template: ${email.template || 'N/A'}`);
      console.log(`   Status: ${email.status}`);
      console.log(`   Date: ${email.createdAt.toLocaleString('fr-FR')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmails();
