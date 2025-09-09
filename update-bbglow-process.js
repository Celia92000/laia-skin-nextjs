const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBBGlowProcess() {
  try {
    // Les étapes du déroulement pour BB Glow (similaire à Renaissance mais avec pigment)
    const processSteps = [
      "Diagnostic approfondi et détermination de la teinte idéale pour votre carnation",
      "Application d'un nettoyant exfoliant spécifique adapté",
      "Mousse neutralisante pour préparer la peau au traitement",
      "Utilisation du Dermapen avec pigment de couleur personnalisé pour un teint lumineux",
      "Pose d'un masque apaisant et hydratant",
      "LED thérapie pour optimiser l'absorption du pigment et stimuler la régénération",
      "Application d'une crème de finition et protection SPF"
    ];

    // Mettre à jour le service BB Glow
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: { 
        process: JSON.stringify(processSteps),
        description: "Le BB Glow utilise la même technologie avancée du Dermapen que le soin Renaissance, mais au lieu d'injecter une ampoule spécifique et du sérum vitamine C, nous déposons un pigment de couleur adapté à votre carnation. Ce pigment semi-permanent s'intègre dans les couches superficielles de la peau pour créer un effet fond de teint naturel et lumineux qui dure plusieurs mois. Un protocole identique au Renaissance mais avec un objectif beauté immédiat : un teint parfait au réveil.",
        shortDescription: "Effet fond de teint semi-permanent avec Dermapen et pigments de couleur"
      }
    });
    
    console.log('✅ Déroulement de la séance BB Glow mis à jour');
    console.log('\n📋 Étapes du soin BB Glow :');
    processSteps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBBGlowProcess();