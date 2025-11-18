import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      name: "Hydro'Naissance",
      shortDescription: 'La synergie parfaite : HydraFacial + Microneedling pour une peau transformée',
      description: `L'Hydro'Naissance est notre soin signature qui combine la puissance de deux technologies de pointe : l'HydraFacial et le Microneedling. Cette synergie unique offre des résultats spectaculaires en une seule séance. L'HydraFacial nettoie et hydrate en profondeur, tandis que le microneedling stimule la régénération cellulaire et la production de collagène. Un protocole d'exception pour une véritable renaissance de votre peau.`,
      metaTitle: "Hydro'Naissance - HydraFacial + Microneedling | LAIA SKIN",
      metaDescription: "Hydro'Naissance : la combinaison exclusive HydraFacial + Microneedling. Double action pour une peau parfaite. Résultats exceptionnels.",
      keywords: 'hydro naissance, hydrafacial microneedling, soin combiné, double traitement, collagène, hydratation, régénération',
      price: 280,
      launchPrice: 230,
      promoPrice: 250,
      forfaitPrice: 1400,
      forfaitPromo: 1150,
      duration: 90,
      benefits: JSON.stringify([
        'Double action : nettoyage profond + régénération',
        'Hydratation intense par HydraFacial',
        'Stimulation du collagène par microneedling',
        'Réduction des rides et ridules',
        'Resserrement des pores dilatés',
        'Amélioration des cicatrices d\'acné',
        'Teint unifié et lumineux',
        'Texture de peau affinée',
        'Effet lifting naturel',
        'Résultats immédiats et durables'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Consultation & Préparation',
          description: 'Analyse de peau et application d\'une crème anesthésiante si nécessaire',
          duration: '15 min'
        },
        {
          step: 2,
          title: 'HydraFacial Phase 1',
          description: 'Nettoyage profond, exfoliation et extraction des impuretés avec la technologie Vortex',
          duration: '30 min'
        },
        {
          step: 3,
          title: 'Microneedling Ciblé',
          description: 'Traitement de microneedling avec sérums personnalisés pour stimuler la régénération',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'HydraFacial Phase 2',
          description: 'Infusion de sérums hydratants et antioxydants pour apaiser et nourrir',
          duration: '15 min'
        },
        {
          step: 5,
          title: 'LED & Finition',
          description: 'LED thérapie rouge pour optimiser les résultats et masque apaisant',
          duration: '15 min'
        }
      ]),
      recommendations: 'Idéal pour les peaux qui ont besoin d\'une transformation complète : pores dilatés, rides, cicatrices, teint terne. Parfait avant un événement important (prévoir 3-5 jours). Protocole optimal : 1 séance par mois ou cure de 4 séances.',
      contraindications: 'Acné active sévère, rosacée inflammatoire, grossesse, troubles de la coagulation, prise d\'anticoagulants, infections cutanées.',
      mainImage: '/services/hydro-naissance.jpg',
      gallery: JSON.stringify([
        '/services/hydro-naissance.jpg',
        '/services/hydro-cleaning.jpg',
        '/services/renaissance.jpg'
      ]),
      category: 'Soins signature',
      canBeOption: false,
      active: true,
      featured: true
    }
  })

  console.log("✅ Hydro'Naissance mis à jour : HydraFacial + Microneedling")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })