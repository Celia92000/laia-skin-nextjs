const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRenaissanceProcess() {
  try {
    // Les étapes du déroulement pour Renaissance
    const processSteps = [
      "Diagnostic approfondi et étude précise de votre type de peau",
      "Application d'un nettoyant exfoliant spécifique adapté",
      "Mousse neutralisante pour préparer la peau au traitement",
      "Utilisation du Dermapen avec ampoule spécifique et sérum à la vitamine C pour booster les effets",
      "Pose d'un masque apaisant et régénérant",
      "LED thérapie pour optimiser la régénération cellulaire",
      "Application d'une crème de finition et protection SPF"
    ];

    // Mettre à jour le service Renaissance
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: { 
        process: JSON.stringify(processSteps)
      }
    });
    
    console.log('✅ Déroulement de la séance Renaissance mis à jour');
    console.log('\n📋 Étapes du soin :');
    processSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRenaissanceProcess();