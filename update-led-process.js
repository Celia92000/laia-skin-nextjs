const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLEDProcess() {
  try {
    // Les étapes du déroulement pour LED Thérapie
    const processSteps = [
      "Nettoyage et démaquillage en profondeur",
      "Gommage doux pour préparer la peau",
      "Application d'un masque adapté à votre type de peau",
      "LED thérapie ciblée selon vos besoins (rouge anti-âge, bleu anti-acné, vert anti-taches)",
      "Application d'une crème de finition et protection SPF"
    ];

    // Mettre à jour le service LED Thérapie
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: { 
        process: JSON.stringify(processSteps),
        description: "La LED thérapie est un soin doux et relaxant qui utilise différentes longueurs d'onde de lumière pour traiter en profondeur les problématiques de votre peau. Après une préparation minutieuse avec nettoyage, gommage et masque, votre peau est parfaitement réceptive aux bienfaits de la lumière LED. Un protocole simple mais efficace pour une peau apaisée, régénérée et éclatante.",
        shortDescription: "Soin apaisant par lumière LED avec préparation complète de la peau"
      }
    });
    
    console.log('✅ Déroulement de la séance LED Thérapie mis à jour');
    console.log('\n📋 Étapes du soin LED Thérapie :');
    processSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLEDProcess();