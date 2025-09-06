const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateLaunchPrices() {
  try {
    console.log('🚀 Configuration des tarifs de lancement avec réductions...\n');

    // Hydro'Naissance Signature - Tarif de lancement
    await prisma.service.update({
      where: { slug: 'hydro-naissance' },
      data: {
        name: "Hydro'Naissance Signature",
        price: 180,        // Prix normal (barré)
        promoPrice: 149,   // Prix de lancement
        forfaitPrice: 150, // Forfait entretien normal
        forfaitPromo: 120, // Forfait entretien lancement
        shortDescription: "Protocole HydroFacial complet avec LED Photothérapie - TARIF DE LANCEMENT",
      }
    });
    console.log('✅ Hydro\'Naissance : 180€ → 149€ (Tarif lancement -17%)');

    // Hydro'Cleaning Booster - Tarif de lancement
    await prisma.service.update({
      where: { slug: 'hydro-cleaning' },
      data: {
        name: "Hydro'Cleaning Booster",
        price: 240,        // Prix normal (barré)
        promoPrice: 190,   // Prix de lancement
        forfaitPrice: 900, // Forfait 4 séances normal
        forfaitPromo: 720, // Forfait 4 séances lancement
        shortDescription: "Protocole complet avec Booster ciblé - OFFRE DE LANCEMENT",
      }
    });
    console.log('✅ Hydro\'Cleaning Booster : 240€ → 190€ (Tarif lancement -21%)');

    // Renaissance Entretien - Tarif de lancement
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: {
        name: "Renaissance Entretien",
        price: 150,        // Prix normal (barré)
        promoPrice: 99,    // Prix de lancement
        forfaitPrice: 540, // Forfait 4 séances normal
        forfaitPromo: 360, // Forfait 4 séances lancement
        shortDescription: "Séance d'entretien mensuelle - PRIX SPÉCIAL OUVERTURE",
      }
    });
    console.log('✅ Renaissance Entretien : 150€ → 99€ (Tarif lancement -34%)');

    // BB Glow - Tarif de lancement
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: {
        price: 120,        // Prix normal (barré)
        promoPrice: 79,    // Prix de lancement
        forfaitPrice: 420, // Forfait 4 séances normal
        forfaitPromo: 280, // Forfait 4 séances lancement
        shortDescription: "Teint parfait semi-permanent - PROMO LANCEMENT",
      }
    });
    console.log('✅ BB Glow : 120€ → 79€ (Tarif lancement -34%)');

    // LED Thérapie - Tarif de lancement
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: {
        price: 60,         // Prix normal (barré)
        promoPrice: 39,    // Prix de lancement
        forfaitPrice: 200, // Forfait 4 séances normal
        forfaitPromo: 140, // Forfait 4 séances lancement
        shortDescription: "Séance LED thérapie - OFFRE DÉCOUVERTE",
      }
    });
    console.log('✅ LED Thérapie : 60€ → 39€ (Tarif lancement -35%)');

    console.log('\n🎉 Tous les tarifs de lancement sont configurés !');
    console.log('\n📊 Récapitulatif des réductions :');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ Service                    │ Normal │ Lancement │ -%%  │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Hydro\'Naissance Signature  │  180€  │    149€   │ -17% │');
    console.log('│ Hydro\'Cleaning Booster     │  240€  │    190€   │ -21% │');
    console.log('│ Renaissance Entretien      │  150€  │     99€   │ -34% │');
    console.log('│ BB Glow                    │  120€  │     79€   │ -34% │');
    console.log('│ LED Thérapie               │   60€  │     39€   │ -35% │');
    console.log('└─────────────────────────────────────────────────────────┘');
    
    console.log('\n💡 Les prix normaux seront affichés barrés');
    console.log('   avec le tarif de lancement en évidence !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateLaunchPrices();