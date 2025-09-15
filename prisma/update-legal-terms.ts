import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Mettre à jour Hydro'Naissance avec des termes légalement sûrs
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      name: "Hydro'Naissance",
      shortDescription: 'La synergie parfaite : HydraFacial + Dermapen pour une peau transformée',
      description: `L'Hydro'Naissance est notre soin signature qui combine la puissance de l'HydraFacial avec la technique du Dermapen (micro-perforation contrôlée). Cette synergie unique offre des résultats spectaculaires en une seule séance. L'HydraFacial nettoie et hydrate en profondeur, tandis que le Dermapen stimule naturellement le renouvellement cellulaire. Un protocole d'exception pour une véritable renaissance de votre peau.`,
      metaTitle: "Hydro'Naissance - HydraFacial + Dermapen | LAIA SKIN",
      metaDescription: "Hydro'Naissance : la combinaison exclusive HydraFacial + Dermapen. Double action pour une peau parfaite. Résultats exceptionnels.",
      keywords: 'hydro naissance, hydrafacial dermapen, soin combiné, micro-perforation, renouvellement cellulaire, hydratation',
    }
  })

  // Mettre à jour le service Microneedling -> Dermapen
  await prisma.service.update({
    where: { slug: 'microneedling' },
    data: {
      name: 'Dermapen',
      shortDescription: 'La micro-perforation contrôlée pour un renouvellement cellulaire optimal',
      description: `Le Dermapen est une technique de pointe utilisant un stylo électrique équipé de micro-aiguilles stériles à usage unique. Cette technologie permet une micro-perforation contrôlée et précise de l'épiderme, stimulant ainsi les mécanismes naturels de régénération cutanée. Les micro-canaux créés permettent également une meilleure pénétration des actifs cosmétiques.`,
      metaTitle: 'Dermapen - Micro-perforation Contrôlée | LAIA SKIN Institut',
      metaDescription: 'Dermapen professionnel chez LAIA SKIN. Micro-perforation pour stimuler le renouvellement cellulaire. Technique douce et efficace.',
      keywords: 'dermapen, micro-perforation, renouvellement cellulaire, soin visage, texture peau, éclat',
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
          description: 'Nettoyage et préparation de la peau',
          duration: '15 min'
        },
        {
          step: 3,
          title: 'Traitement Dermapen',
          description: 'Micro-perforation contrôlée avec profondeur adaptée (0.5mm max)',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'Application de Sérums',
          description: 'Sérums cosmétiques adaptés à vos besoins',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Soin Post-Traitement',
          description: 'Masque apaisant et conseils de soins à domicile',
          duration: '15 min'
        }
      ])
    }
  })

  // Mettre à jour Renaissance avec des termes appropriés
  await prisma.service.update({
    where: { slug: 'renaissance' },
    data: {
      name: 'Renaissance',
      shortDescription: 'Le soin global combinant Dermapen et LED pour une peau visiblement rajeunie',
      description: `Le soin Renaissance est notre protocole le plus complet, combinant la technique du Dermapen avec la LED thérapie. Ce traitement stimule les mécanismes naturels de renouvellement cutané pour une peau visiblement transformée, plus ferme et éclatante. La micro-perforation contrôlée associée à la photobiomodulation offre des résultats remarquables.`,
      metaTitle: 'Renaissance - Soin Global Dermapen + LED | LAIA SKIN Institut',
      metaDescription: 'Soin Renaissance : protocole complet avec Dermapen et LED thérapie. Renouvellement cellulaire visible et éclat retrouvé.',
      keywords: 'renaissance, dermapen, led thérapie, renouvellement cellulaire, soin global, éclat',
      process: JSON.stringify([
        {
          step: 1,
          title: 'Préparation',
          description: 'Nettoyage et application de sérums préparateurs',
          duration: '15 min'
        },
        {
          step: 2,
          title: 'Dermapen',
          description: 'Micro-perforation contrôlée avec sérums cosmétiques',
          duration: '30 min'
        },
        {
          step: 3,
          title: 'Infusion d\'Actifs',
          description: 'Pénétration optimale de cocktails cosmétiques',
          duration: '15 min'
        },
        {
          step: 4,
          title: 'LED Rouge',
          description: 'Photobiomodulation pour stimuler les processus naturels',
          duration: '20 min'
        },
        {
          step: 5,
          title: 'Masque Final',
          description: 'Masque bio-cellulose apaisant et hydratant',
          duration: '10 min'
        }
      ])
    }
  })

  console.log("✅ Termes mis à jour pour être conformes à la réglementation esthétique")
  console.log("- Microneedling → Dermapen")
  console.log("- Micro-perforation contrôlée (0.5mm max)")
  console.log("- Éviter les termes médicaux")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })