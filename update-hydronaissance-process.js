const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateHydroNaissanceProcess() {
  try {
    // Protocole complet Hydro'Naissance = Hydro'Cleaning + Renaissance
    const processSteps = [
      "Diagnostic approfondi et analyse complète de votre type de peau",
      "Démaquillage bi-phasique pour éliminer toutes les impuretés",
      "Gommage enzymatique et préparation cutanée en douceur",
      "Vapeur tiède pour ouvrir les pores et faciliter l'extraction",
      "Aspiration et extraction des impuretés et points noirs",
      "Nettoyage en profondeur avec solution adaptée et exfoliant spécifique",
      "Mousse neutralisante pour préparer la peau au traitement Renaissance",
      "Utilisation du Dermapen avec ampoule spécifique et sérum à la vitamine C",
      "Radio-fréquence ou ultrason selon les besoins de votre peau",
      "Application d'un spray vaporisateur et sérum anti-oxydant",
      "Pose d'un masque hydratant et régénérant personnalisé",
      "LED thérapie pour optimiser la régénération cellulaire",
      "Application d'une crème de finition et protection SPF"
    ];

    // Mettre à jour le service Hydro'Naissance
    await prisma.service.update({
      where: { slug: 'hydro-naissance' },
      data: { 
        process: JSON.stringify(processSteps),
        description: "Le soin Hydro'Naissance est notre protocole le plus complet, combinant l'excellence de l'Hydro'Cleaning pour un nettoyage en profondeur et le soin Renaissance pour une régénération anti-âge. Cette synergie unique offre à votre peau une transformation complète : purification, hydratation et rajeunissement en une seule séance d'exception."
      }
    });
    
    console.log('✅ Déroulement de la séance Hydro\'Naissance mis à jour');
    console.log('\n📋 Protocole complet (Hydro\'Cleaning + Renaissance) :');
    processSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHydroNaissanceProcess();