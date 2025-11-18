const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateServicesDescriptions() {
  try {
    // Mise à jour Hydro'Cleaning
    await prisma.service.update({
      where: { slug: 'hydro-cleaning' },
      data: {
        shortDescription: "Nettoyage en profondeur avec extraction, radio-fréquence et LED thérapie",
        description: "L'Hydro'Cleaning est un soin complet qui combine technologies de pointe et expertise pour purifier votre peau en profondeur. Ce protocole associe extraction douce des impuretés, radio-fréquence ou ultrason selon vos besoins, et LED thérapie pour un résultat optimal. Votre peau est nettoyée, hydratée et éclatante de santé.",
        benefits: JSON.stringify([
          "Extraction complète des impuretés et points noirs",
          "Hydratation intense et durable",
          "Pores visiblement resserrés",
          "Teint unifié et lumineux",
          "Stimulation de la production de collagène par LED",
          "Peau nettoyée en profondeur et oxygénée",
          "Texture de peau affinée",
          "Effet anti-âge préventif"
        ])
      }
    });
    console.log('✅ Hydro\'Cleaning mis à jour');

    // Mise à jour Renaissance
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: {
        shortDescription: "Soin anti-âge révolutionnaire avec Dermapen et cocktail vitaminé",
        description: "Le soin Renaissance utilise la technologie du Dermapen pour créer des micro-canaux dans la peau, permettant une pénétration optimale d'actifs puissants. L'association d'une ampoule spécifique personnalisée et de sérum à la vitamine C stimule intensément la régénération cellulaire. Ce protocole anti-âge complet offre des résultats visibles dès la première séance.",
        benefits: JSON.stringify([
          "Réduction visible des rides et ridules",
          "Stimulation intense de la production de collagène",
          "Effet liftant naturel",
          "Amélioration de l'élasticité cutanée",
          "Teint éclatant grâce à la vitamine C",
          "Régénération cellulaire profonde",
          "Texture de peau raffinée",
          "Atténuation des taches pigmentaires"
        ])
      }
    });
    console.log('✅ Renaissance mis à jour');

    // Mise à jour Hydro'Naissance
    await prisma.service.update({
      where: { slug: 'hydro-naissance' },
      data: {
        shortDescription: "Le soin d'exception combinant Hydro'Cleaning et Renaissance pour une transformation complète",
        description: "L'Hydro'Naissance est notre protocole signature le plus complet, fusionnant l'excellence de l'Hydro'Cleaning et la puissance régénérante du Renaissance. Cette synergie unique offre une expérience de soin exceptionnelle : nettoyage en profondeur, extraction des impuretés, suivis du protocole anti-âge au Dermapen avec cocktail vitaminé. Un soin d'1h30 pour une transformation totale de votre peau.",
        benefits: JSON.stringify([
          "Protocole 2-en-1 : nettoyage profond + anti-âge",
          "Résultats immédiats et durables",
          "Peau parfaitement nettoyée et régénérée",
          "Effet lifting et repulpant",
          "Hydratation intense multi-niveaux",
          "Éclat incomparable du teint",
          "Stimulation maximale du collagène",
          "Transformation visible de la qualité de peau",
          "Effets anti-âge renforcés",
          "Protocole personnalisé selon vos besoins"
        ])
      }
    });
    console.log('✅ Hydro\'Naissance mis à jour');

    // Mise à jour BB Glow
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: {
        shortDescription: "Teint unifié et effet bonne mine semi-permanent",
        description: "Le BB Glow est une technique innovante qui dépose un fond de teint semi-permanent dans les couches superficielles de la peau. Ce soin offre un teint unifié, lumineux et naturel qui dure plusieurs semaines. Idéal pour corriger les imperfections, unifier le teint et obtenir un effet bonne mine permanent.",
        benefits: JSON.stringify([
          "Teint unifié instantanément",
          "Effet bonne mine qui dure 3 à 6 mois",
          "Correction des taches pigmentaires",
          "Hydratation profonde de la peau",
          "Réduction de l'apparence des pores",
          "Pas de maquillage nécessaire au quotidien",
          "Résultat naturel et lumineux",
          "Stimulation de la production de collagène"
        ])
      }
    });
    console.log('✅ BB Glow mis à jour');

    // Mise à jour LED Thérapie
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: {
        shortDescription: "Traitement par lumière LED pour régénérer et apaiser la peau",
        description: "La LED thérapie utilise différentes longueurs d'onde de lumière pour traiter divers problèmes cutanés. La lumière rouge stimule le collagène pour un effet anti-âge, la bleue combat l'acné, la verte atténue les taches. Un soin non invasif, sans douleur, aux résultats scientifiquement prouvés.",
        benefits: JSON.stringify([
          "Stimulation naturelle du collagène",
          "Réduction de l'inflammation et de l'acné",
          "Accélération de la cicatrisation",
          "Amélioration de la circulation sanguine",
          "Effet apaisant et relaxant",
          "Atténuation des taches pigmentaires",
          "Raffermissement de la peau",
          "Compatible avec tous types de peau"
        ])
      }
    });
    console.log('✅ LED Thérapie mis à jour');

    console.log('\n✨ Toutes les descriptions ont été mises à jour avec succès !');

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServicesDescriptions();