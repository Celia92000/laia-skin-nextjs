const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePrices() {
  try {
    console.log('🔄 Mise à jour des tarifs...\n');

    // Hydro'Naissance - Séance Signature
    await prisma.service.update({
      where: { slug: 'hydro-naissance' },
      data: {
        name: "Hydro'Naissance Signature",
        price: 180,
        promoPrice: null, // Pas de promo sur ce tarif
        forfaitPrice: 150, // Forfait entretien mensuel
        forfaitPromo: null,
        shortDescription: "Protocole HydroFacial complet avec LED Photothérapie incluse",
        description: `Le soin signature Hydro'Naissance est notre protocole HydroFacial le plus complet. 
        
Cette technologie révolutionnaire combine l'hydrodermabrasion de dernière génération avec la LED photothérapie pour une transformation complète de votre peau en seulement 45 minutes.

Le système Vortex-Fusion™ nettoie, exfolie et hydrate en profondeur tout en infusant des sérums haute performance adaptés à vos besoins spécifiques. La séance se termine par une session de LED thérapie pour maximiser les résultats.

Idéal pour : tous types de peau, éclat immédiat, hydratation profonde, réduction des imperfections.`,
        duration: 45,
        benefits: JSON.stringify([
          "Nettoyage en profondeur avec la technologie Vortex",
          "Exfoliation douce et extraction des impuretés",
          "Hydratation intense avec sérums personnalisés",
          "LED Photothérapie incluse pour booster les résultats",
          "Éclat immédiat et teint unifié",
          "Réduction visible des pores",
          "Amélioration de la texture de la peau",
          "Résultats visibles dès la première séance"
        ])
      }
    });
    console.log('✅ Hydro\'Naissance Signature mis à jour : 180€');

    // Hydro'Cleaning avec Booster
    await prisma.service.update({
      where: { slug: 'hydro-cleaning' },
      data: {
        name: "Hydro'Cleaning Booster",
        price: 240,
        promoPrice: null,
        forfaitPrice: 900, // Forfait 4 séances
        forfaitPromo: null,
        shortDescription: "Protocole complet avec Booster ciblé et LED Photothérapie",
        description: `Le soin Hydro'Cleaning Booster est notre protocole avancé qui inclut un sérum booster spécifique pour traiter vos préoccupations particulières.

En plus du protocole HydroFacial complet, ce soin intègre un booster haute concentration choisi selon vos besoins :
- Booster Britenol™ : pour les taches pigmentaires et l'éclat
- Booster GlySal™ : pour les imperfections et l'acné
- Booster DermaBuilder™ : pour les rides et la fermeté
- Booster CTGF™ : pour le raffermissement et la régénération

La séance inclut également la LED photothérapie pour des résultats optimisés et durables.`,
        duration: 45,
        benefits: JSON.stringify([
          "Protocole HydroFacial complet",
          "Sérum Booster haute concentration inclus",
          "Traitement ciblé de vos préoccupations spécifiques",
          "LED Photothérapie pour maximiser les résultats",
          "Résultats améliorés et plus durables",
          "Personnalisation complète du traitement",
          "Action intensive sur les problématiques ciblées",
          "Effet cumulatif avec les séances régulières"
        ])
      }
    });
    console.log('✅ Hydro\'Cleaning Booster mis à jour : 240€');

    // Renaissance - Forfait Entretien
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: {
        name: "Renaissance Entretien",
        price: 150,
        promoPrice: null,
        forfaitPrice: 540, // Forfait 4 séances avec réduction
        forfaitPromo: null,
        shortDescription: "Séance d'entretien mensuelle pour maintenir l'éclat",
        description: `Le soin Renaissance Entretien est spécialement conçu pour maintenir les résultats obtenus et garder une peau éclatante tout au long de l'année.

Ce protocole d'entretien mensuel permet de :
- Maintenir l'hydratation optimale de la peau
- Prévenir l'accumulation d'impuretés
- Stimuler le renouvellement cellulaire régulier
- Conserver l'éclat et la luminosité du teint

Recommandé après une cure intensive ou en entretien régulier pour les peaux qui souhaitent rester au top de leur forme.`,
        duration: 30,
        benefits: JSON.stringify([
          "Maintien des résultats à long terme",
          "Peau toujours éclatante et hydratée",
          "Prévention du vieillissement cutané",
          "Séances mensuelles recommandées",
          "Protocole adapté aux besoins évolutifs",
          "Tarif préférentiel pour l'entretien",
          "Suivi personnalisé de l'évolution",
          "Compatible avec tous les types de peau"
        ])
      }
    });
    console.log('✅ Renaissance Entretien mis à jour : 150€');

    // BB Glow reste sur les soins complémentaires
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: {
        price: 120,
        promoPrice: 90,
        forfaitPrice: 420, // Forfait 4 séances
        forfaitPromo: 320,
        shortDescription: "Teint parfait effet bonne mine semi-permanent"
      }
    });
    console.log('✅ BB Glow mis à jour : 120€ (promo 90€)');

    // LED Thérapie en complément
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: {
        price: 60,
        promoPrice: 40,
        forfaitPrice: 200, // Forfait 4 séances
        forfaitPromo: 150,
        shortDescription: "Séance de LED thérapie seule ou en complément",
        duration: 20
      }
    });
    console.log('✅ LED Thérapie mis à jour : 60€ (promo 40€)');

    console.log('\n✨ Tous les tarifs ont été mis à jour !');
    console.log('\n📋 Récapitulatif :');
    console.log('- Hydro\'Naissance Signature : 180€ (45 min)');
    console.log('- Hydro\'Cleaning Booster : 240€ (45 min)');
    console.log('- Renaissance Entretien : 150€ (30 min)');
    console.log('- BB Glow : 120€ / 90€ promo');
    console.log('- LED Thérapie : 60€ / 40€ promo (20 min)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePrices();