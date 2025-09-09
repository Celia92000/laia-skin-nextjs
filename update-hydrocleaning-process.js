const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateHydroCleaningProcess() {
  try {
    // Les étapes du déroulement pour Hydro'Cleaning
    const processSteps = [
      "Analyse de peau et détermination du protocole personnalisé",
      "Démaquillage bi-phasique pour éliminer toutes les impuretés",
      "Gommage enzymatique et préparation cutanée en douceur",
      "Vapeur tiède pour ouvrir les pores et faciliter l'extraction",
      "Aspiration et extraction des impuretés et points noirs",
      "Nettoyage en profondeur avec solution adaptée",
      "Radio-fréquence ou ultrason selon les besoins spécifiques de votre peau",
      "Application d'un spray vaporisateur et sérum anti-oxydant",
      "Pose d'un masque hydratant/purifiant selon votre type de peau",
      "LED thérapie pour stimuler la régénération cellulaire",
      "Application d'une crème de finition et protection SPF"
    ];

    // Mettre à jour le service Hydro'Cleaning
    await prisma.service.update({
      where: { slug: 'hydro-cleaning' },
      data: { 
        process: JSON.stringify(processSteps)
      }
    });
    
    console.log('✅ Déroulement de la séance Hydro\'Cleaning mis à jour');
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

updateHydroCleaningProcess();