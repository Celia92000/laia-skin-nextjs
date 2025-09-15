import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Ajouter Hydro'Naissance
  await prisma.service.create({
    data: {
      slug: 'hydro-naissance',
      name: "Hydro'Naissance",
      shortDescription: 'Le soin signature ultime combinant HydraFacial et technologies de pointe',
      description: `L'Hydro'Naissance est notre soin signature le plus complet, une véritable renaissance pour votre peau. Ce protocole exclusif combine l'efficacité de l'HydraFacial avec les dernières innovations en matière de rajeunissement cutané. Un voyage sensoriel de 90 minutes qui transforme visiblement votre peau.`,
      metaTitle: "Hydro'Naissance - Soin Signature Premium | LAIA SKIN Institut",
      metaDescription: "Découvrez l'Hydro'Naissance, notre soin signature combinant HydraFacial, LED thérapie et technologies avancées pour une peau transformée.",
      keywords: 'hydro naissance, soin signature, hydrafacial premium, led thérapie, soin complet, rajeunissement, paris',
      price: 250,
      launchPrice: 200,
      promoPrice: 225,
      forfaitPrice: 1250,
      forfaitPromo: 1000,
      duration: 90,
      benefits: JSON.stringify([
        'Nettoyage en profondeur avec HydraFacial',
        'Stimulation cellulaire par LED thérapie',
        'Lifting et raffermissement immédiats',
        'Hydratation intense multi-niveaux',
        'Éclat et luminosité incomparables',
        'Réduction visible des rides et ridules',
        'Resserrement des pores',
        'Effet "peau de bébé" instantané',
        'Relaxation profonde et bien-être',
        'Résultats durables et cumulatifs'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Diagnostic & Préparation',
          description: 'Analyse personnalisée de votre peau et préparation avec vapeur chaude',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'HydraFacial Complet',
          description: 'Protocole HydraFacial intégral avec nettoyage, peeling, extraction et hydratation',
          duration: '45 min'
        },
        {
          step: 3,
          title: 'Booster Anti-Âge',
          description: 'Application de sérums concentrés en peptides et facteurs de croissance',
          duration: '10 min'
        },
        {
          step: 4,
          title: 'LED Thérapie',
          description: 'Séance de photobiomodulation pour stimuler le collagène',
          duration: '15 min'
        },
        {
          step: 5,
          title: 'Massage & Finition',
          description: 'Massage lymphatique et application de masque hydrogel premium',
          duration: '10 min'
        }
      ]),
      recommendations: 'Idéal pour les occasions spéciales, les peaux matures, ou comme soin mensuel d\'exception. Parfait avant un événement important pour un effet "coup d\'éclat" maximal.',
      contraindications: 'Grossesse (certains actifs), allergies aux composants, lésions cutanées actives, traitements par isotrétinoïne.',
      mainImage: '/services/hydro-naissance.jpg',
      gallery: JSON.stringify([
        '/services/hydro-naissance.jpg',
        '/services/hydro-cleaning.jpg'
      ]),
      category: 'Soins signature',
      canBeOption: false,
      active: true,
      featured: true
    }
  })

  // Ajouter aussi Hydro'Cleaning s'il n'existe pas
  const hydroCleaning = await prisma.service.findUnique({
    where: { slug: 'hydro-cleaning' }
  })

  if (!hydroCleaning) {
    await prisma.service.create({
      data: {
        slug: 'hydro-cleaning',
        name: "Hydro'Cleaning",
        shortDescription: 'Le nettoyage profond nouvelle génération pour une peau purifiée',
        description: `L'Hydro'Cleaning est un soin de nettoyage en profondeur qui combine la technologie HydraFacial avec des techniques spécifiques de purification. Idéal pour les peaux à imperfections, ce traitement élimine efficacement les impuretés tout en respectant l'équilibre cutané.`,
        metaTitle: "Hydro'Cleaning - Nettoyage Profond HydraFacial | LAIA SKIN",
        metaDescription: "Hydro'Cleaning : soin de nettoyage profond avec technologie HydraFacial. Idéal pour peaux à imperfections. Résultats immédiats.",
        keywords: 'hydro cleaning, nettoyage profond, hydrafacial, pores, impuretés, acné, points noirs',
        price: 150,
        launchPrice: 120,
        promoPrice: 135,
        forfaitPrice: 750,
        forfaitPromo: 600,
        duration: 60,
        benefits: JSON.stringify([
          'Nettoyage en profondeur des pores',
          'Extraction douce des points noirs',
          'Élimination des cellules mortes',
          'Régulation du sébum',
          'Hydratation équilibrante',
          'Teint plus net et uniforme',
          'Pores visiblement resserrés',
          'Prévention des imperfections'
        ]),
        process: JSON.stringify([
          {
            step: 1,
            title: 'Analyse & Démaquillage',
            description: 'Diagnostic de peau et démaquillage professionnel',
            duration: '10 min'
          },
          {
            step: 2,
            title: 'Vaporisation',
            description: 'Ouverture des pores à la vapeur tiède',
            duration: '5 min'
          },
          {
            step: 3,
            title: 'HydraFacial Nettoyage',
            description: 'Aspiration et nettoyage avec la technologie Vortex',
            duration: '25 min'
          },
          {
            step: 4,
            title: 'Purification',
            description: 'Application de sérums purifiants et antibactériens',
            duration: '10 min'
          },
          {
            step: 5,
            title: 'Apaisement',
            description: 'Masque apaisant et protection finale',
            duration: '10 min'
          }
        ]),
        recommendations: 'Recommandé pour les peaux mixtes à grasses, les peaux à imperfections, ou en entretien mensuel. Excellent avant un événement pour un teint net.',
        contraindications: 'Acné inflammatoire sévère, rosacée active, couperose importante, plaies ouvertes.',
        mainImage: '/services/hydro-cleaning.jpg',
        gallery: JSON.stringify(['/services/hydro-cleaning.jpg']),
        category: 'Soins du visage',
        canBeOption: false,
        active: true,
        featured: false
      }
    })
    console.log("✅ Hydro'Cleaning ajouté")
  }

  // Ajouter Renaissance s'il n'existe pas
  const renaissance = await prisma.service.findUnique({
    where: { slug: 'renaissance' }
  })

  if (!renaissance) {
    await prisma.service.create({
      data: {
        slug: 'renaissance',
        name: 'Renaissance',
        shortDescription: 'Le soin anti-âge global pour une peau visiblement rajeunie',
        description: `Le soin Renaissance est notre protocole anti-âge le plus avancé, combinant microneedling de précision et technologies régénérantes. Ce traitement complet stimule les mécanismes naturels de rajeunissement pour une peau visiblement transformée, plus ferme et éclatante.`,
        metaTitle: 'Renaissance - Soin Anti-Âge Global | LAIA SKIN Institut',
        metaDescription: 'Soin Renaissance : protocole anti-âge complet avec microneedling et LED. Rajeunissement visible, fermeté et éclat retrouvés.',
        keywords: 'renaissance, anti-âge, microneedling, rajeunissement, collagène, fermeté, rides',
        price: 280,
        launchPrice: 230,
        promoPrice: 250,
        forfaitPrice: 1400,
        forfaitPromo: 1150,
        duration: 90,
        benefits: JSON.stringify([
          'Stimulation maximale du collagène',
          'Réduction significative des rides',
          'Raffermissement visible',
          'Amélioration de l\'élasticité',
          'Éclat et luminosité retrouvés',
          'Lissage de la texture',
          'Atténuation des taches',
          'Effet lifting naturel',
          'Régénération cellulaire profonde'
        ]),
        process: JSON.stringify([
          {
            step: 1,
            title: 'Préparation Anti-Âge',
            description: 'Nettoyage et application d\'actifs préparateurs',
            duration: '15 min'
          },
          {
            step: 2,
            title: 'Microneedling Avancé',
            description: 'Traitement en profondeur avec sérums régénérants',
            duration: '30 min'
          },
          {
            step: 3,
            title: 'Infusion d\'Actifs',
            description: 'Pénétration de cocktails anti-âge personnalisés',
            duration: '15 min'
          },
          {
            step: 4,
            title: 'LED Rouge Anti-Âge',
            description: 'Stimulation du collagène par photothérapie',
            duration: '20 min'
          },
          {
            step: 5,
            title: 'Masque Régénérant',
            description: 'Masque bio-cellulose aux facteurs de croissance',
            duration: '10 min'
          }
        ]),
        recommendations: 'Idéal à partir de 35 ans ou dès les premiers signes de vieillissement. Protocole recommandé : 4-6 séances espacées de 3-4 semaines.',
        contraindications: 'Grossesse, troubles de la coagulation, infections actives, prise d\'anticoagulants, peeling récent.',
        mainImage: '/services/renaissance.jpg',
        gallery: JSON.stringify(['/services/renaissance.jpg']),
        category: 'Soins anti-âge',
        canBeOption: false,
        active: true,
        featured: true
      }
    })
    console.log('✅ Renaissance ajouté')
  }

  console.log("✅ Hydro'Naissance ajouté avec succès")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })