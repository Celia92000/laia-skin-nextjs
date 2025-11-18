import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // HydraFacial
  await prisma.service.update({
    where: { slug: 'hydrafacial' },
    data: {
      name: 'HydraFacial',
      shortDescription: 'Le soin révolutionnaire pour une peau éclatante et hydratée en profondeur',
      description: `L'HydraFacial est un soin du visage révolutionnaire non invasif qui combine nettoyage en profondeur, exfoliation douce, extraction des impuretés et hydratation intense. Cette technologie brevetée utilise un système de vortex unique pour délivrer des sérums personnalisés directement dans la peau, offrant des résultats immédiats et durables sans temps de récupération.`,
      metaTitle: 'HydraFacial Paris - Soin du Visage Révolutionnaire | LAIA SKIN',
      metaDescription: 'Découvrez l\'HydraFacial chez LAIA SKIN Institut. Soin du visage non invasif pour une peau éclatante. Nettoyage, exfoliation et hydratation en profondeur.',
      keywords: 'hydrafacial paris, soin visage hydratant, nettoyage profond, exfoliation douce, extraction impuretés, hydratation intense',
      price: 180,
      launchPrice: 150,
      promoPrice: 160,
      forfaitPrice: 900,
      forfaitPromo: 750,
      duration: 60,
      benefits: JSON.stringify([
        'Nettoyage en profondeur des pores',
        'Exfoliation douce et non irritante',
        'Extraction des points noirs et impuretés',
        'Hydratation intense avec des sérums personnalisés',
        'Amélioration de la texture et du teint',
        'Réduction des ridules et rides',
        'Éclat immédiat du teint',
        'Convient à tous types de peaux'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Nettoyage & Exfoliation',
          description: 'Élimination des cellules mortes et ouverture des pores avec une solution douce',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Peeling Doux',
          description: 'Application d\'un mélange d\'acides glycolique et salicylique pour un renouvellement cellulaire',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Extraction',
          description: 'Aspiration douce et indolore des impuretés et points noirs',
          duration: '15 min'
        },
        {
          step: 4,
          title: 'Hydratation',
          description: 'Infusion de sérums antioxydants, peptides et acide hyaluronique',
          duration: '15 min'
        },
        {
          step: 5,
          title: 'Protection',
          description: 'Application de protection solaire et conseils personnalisés',
          duration: '10 min'
        }
      ]),
      recommendations: 'Idéal pour tous types de peaux, particulièrement recommandé pour les peaux ternes, déshydratées, avec des pores dilatés ou des signes de vieillissement. Fréquence recommandée : 1 fois par mois pour un entretien optimal.',
      contraindications: 'Grossesse (pour certains sérums), allergies aux ingrédients utilisés, lésions cutanées actives, coups de soleil récents.',
      mainImage: '/services/hydro-cleaning.jpg',
      gallery: JSON.stringify([
        '/services/hydro-cleaning.jpg',
        '/services/hydro-naissance.jpg'
      ]),
      category: 'Soins du visage',
      active: true,
      featured: true
    }
  })

  // BB Glow
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      name: 'BB Glow',
      shortDescription: 'Le traitement semi-permanent pour un teint parfait et lumineux 24/7',
      description: `Le BB Glow est un traitement esthétique innovant qui combine les bienfaits du microneedling avec l'application de pigments semi-permanents. Ce soin révolutionnaire unifie le teint, camoufle les imperfections et donne à votre peau un effet "fond de teint" naturel qui dure plusieurs semaines. Réveillez-vous chaque matin avec une peau parfaite !`,
      metaTitle: 'BB Glow Paris - Teint Parfait Semi-Permanent | LAIA SKIN Institut',
      metaDescription: 'BB Glow chez LAIA SKIN : traitement semi-permanent pour un teint unifié et lumineux. Effet fond de teint naturel longue durée. Résultats immédiats.',
      keywords: 'bb glow paris, teint parfait, maquillage semi-permanent, microneedling, pigments, uniformiser teint, camoufler imperfections',
      price: 150,
      launchPrice: 120,
      promoPrice: 135,
      forfaitPrice: 750,
      forfaitPromo: 600,
      duration: 90,
      benefits: JSON.stringify([
        'Teint unifié et lumineux instantanément',
        'Effet "bonne mine" naturel 24/7',
        'Réduction visible des imperfections',
        'Atténuation des taches pigmentaires',
        'Hydratation intense de la peau',
        'Stimulation de la production de collagène',
        'Résultats durables (3-6 mois)',
        'Gain de temps au quotidien (moins de maquillage)'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Consultation & Analyse',
          description: 'Analyse de votre peau et choix de la teinte adaptée',
          duration: '15 min'
        },
        {
          step: 2,
          title: 'Préparation',
          description: 'Nettoyage profond et désinfection de la peau',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Application Anesthésiante',
          description: 'Crème anesthésiante pour un confort optimal',
          duration: '20 min'
        },
        {
          step: 4,
          title: 'Microneedling & BB Sérum',
          description: 'Application du sérum BB Glow avec micro-aiguilles',
          duration: '30 min'
        },
        {
          step: 5,
          title: 'Finition & Protection',
          description: 'Masque apaisant et protection solaire',
          duration: '15 min'
        }
      ]),
      recommendations: 'Parfait pour les peaux avec des imperfections, taches pigmentaires, teint terne ou irrégulier. Protocole recommandé : 3-5 séances espacées de 2 semaines pour des résultats optimaux.',
      contraindications: 'Grossesse et allaitement, acné active, eczéma, psoriasis, allergies aux pigments, traitements par isotrétinoïne, diabète non contrôlé.',
      mainImage: '/services/bb-glow.jpg',
      gallery: JSON.stringify(['/services/bb-glow.jpg']),
      category: 'Soins du visage',
      active: true,
      featured: true
    }
  })

  // Microneedling
  await prisma.service.update({
    where: { slug: 'microneedling' },
    data: {
      name: 'Microneedling',
      shortDescription: 'La régénération cellulaire pour une peau rajeunie et éclatante',
      description: `Le microneedling est une technique de pointe qui utilise de micro-aiguilles pour créer des micro-perforations contrôlées dans la peau. Cette stimulation déclenche le processus naturel de régénération, augmentant la production de collagène et d'élastine. Résultat : une peau visiblement plus ferme, lisse et rajeunie.`,
      metaTitle: 'Microneedling Paris - Régénération Cellulaire | LAIA SKIN Institut',
      metaDescription: 'Microneedling professionnel chez LAIA SKIN. Stimulation du collagène pour une peau ferme et lisse. Traitement anti-âge et cicatrices.',
      keywords: 'microneedling paris, dermapen, collagène, élastine, anti-âge, cicatrices acné, vergetures, rides, ridules',
      price: 200,
      launchPrice: 170,
      promoPrice: 180,
      forfaitPrice: 1000,
      forfaitPromo: 850,
      duration: 75,
      benefits: JSON.stringify([
        'Stimulation naturelle du collagène',
        'Réduction des rides et ridules',
        'Amélioration des cicatrices d\'acné',
        'Atténuation des vergetures',
        'Resserrement des pores dilatés',
        'Amélioration de la texture de la peau',
        'Teint plus uniforme et lumineux',
        'Raffermissement cutané visible'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Diagnostic Personnalisé',
          description: 'Évaluation de vos besoins et objectifs spécifiques',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Préparation Cutanée',
          description: 'Nettoyage et application d\'anesthésiant topique',
          duration: '20 min'
        },
        {
          step: 3,
          title: 'Traitement Microneedling',
          description: 'Passages précis avec ajustement de la profondeur',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'Application de Sérums',
          description: 'Sérums régénérants et facteurs de croissance',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Soin Post-Traitement',
          description: 'Masque apaisant et conseils de soins à domicile',
          duration: '10 min'
        }
      ]),
      recommendations: 'Excellent pour le traitement anti-âge, les cicatrices d\'acné, les vergetures et l\'amélioration générale de la qualité de la peau. Protocole optimal : 4-6 séances espacées de 4 semaines.',
      contraindications: 'Acné active sévère, infections cutanées, rosacée active, troubles de la coagulation, prise d\'anticoagulants, grossesse.',
      mainImage: '/services/renaissance.jpg',
      gallery: JSON.stringify(['/services/renaissance.jpg']),
      category: 'Soins anti-âge',
      active: true,
      featured: false
    }
  })

  // LED Thérapie
  await prisma.service.update({
    where: { slug: 'led-therapie' },
    data: {
      name: 'LED Thérapie',
      shortDescription: 'La photobiomodulation pour réparer et régénérer votre peau en profondeur',
      description: `La LED thérapie utilise différentes longueurs d'onde de lumière pour traiter divers problèmes cutanés. Cette technologie non invasive stimule les processus naturels de réparation cellulaire, combat l'acné, réduit l'inflammation et stimule la production de collagène. Un soin doux et efficace adapté à tous les types de peaux.`,
      metaTitle: 'LED Thérapie Paris - Photobiomodulation | LAIA SKIN Institut',
      metaDescription: 'LED Thérapie professionnelle chez LAIA SKIN. Traitement par la lumière pour acné, anti-âge et réparation cellulaire. Sans douleur, sans effet secondaire.',
      keywords: 'led thérapie paris, photothérapie, lumière rouge, lumière bleue, anti-acné, anti-âge, collagène, inflammation',
      price: 80,
      launchPrice: 60,
      promoPrice: 70,
      forfaitPrice: 400,
      forfaitPromo: 320,
      duration: 30,
      benefits: JSON.stringify([
        'Traitement de l\'acné (lumière bleue)',
        'Stimulation du collagène (lumière rouge)',
        'Réduction de l\'inflammation',
        'Accélération de la cicatrisation',
        'Amélioration de la circulation sanguine',
        'Effet anti-âge visible',
        'Apaisement des rougeurs',
        'Sans douleur ni effet secondaire'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Analyse de Peau',
          description: 'Détermination du programme LED adapté',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Nettoyage',
          description: 'Préparation de la peau pour optimiser l\'absorption',
          duration: '5 min'
        },
        {
          step: 3,
          title: 'Session LED',
          description: 'Exposition aux longueurs d\'onde thérapeutiques',
          duration: '15 min'
        },
        {
          step: 4,
          title: 'Soin Complémentaire',
          description: 'Application de sérums adaptés',
          duration: '5 min'
        }
      ]),
      recommendations: 'Idéal en cure de 10-12 séances (2 fois par semaine) ou en complément d\'autres soins. Parfait pour l\'acné, le vieillissement cutané, la rosacée et la cicatrisation post-procédure.',
      contraindications: 'Épilepsie, prise de médicaments photosensibilisants, cancer de la peau, grossesse (par précaution).',
      mainImage: '/services/led-therapie.jpg',
      gallery: JSON.stringify(['/services/led-therapie.jpg']),
      category: 'Soins du visage',
      active: true,
      featured: false
    }
  })

  console.log('✅ Tous les services ont été mis à jour avec les informations détaillées')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })