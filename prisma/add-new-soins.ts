import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Mettre BB Glow comme option pouvant être ajoutée aux autres soins
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      name: 'BB Glow (Option)',
      shortDescription: 'Ajoutez l\'effet teint parfait à votre soin - Option à combiner',
      description: `Le BB Glow peut être ajouté en option à vos soins pour un effet "fond de teint" semi-permanent. Cette technique dépose des pigments naturels pour unifier le teint et camoufler les imperfections. Idéal en complément de l'Hydro'Cleaning ou du Renaissance.`,
      price: 90, // Prix réduit car c'est une option
      duration: 30, // Durée additionnelle
      canBeOption: true,
      category: 'Options & Compléments',
      featured: false,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Choix de teinte',
          description: 'Sélection de la nuance adaptée',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Application BB Sérum',
          description: 'Dermapen avec sérum teinté',
          duration: '20 min'
        },
        {
          step: 3,
          title: 'Finition',
          description: 'Massage et protection',
          duration: '5 min'
        }
      ])
    }
  })

  // 2. Créer la Séance LED Complète
  await prisma.service.create({
    data: {
      slug: 'seance-led-complete',
      name: 'Séance LED Complète',
      shortDescription: 'Le soin apaisant complet : nettoyage, gommage, masque et LED thérapie',
      description: `Notre séance LED complète est le soin idéal pour apaiser, régénérer et illuminer votre peau. Ce protocole doux combine un nettoyage professionnel, un gommage enzymatique, un masque adapté et se termine par une séance de LED thérapie personnalisée. Parfait pour les peaux sensibles, après un acte esthétique ou simplement pour un moment de détente.`,
      metaTitle: 'Séance LED Complète - Soin Apaisant | LAIA SKIN Institut',
      metaDescription: 'Séance LED complète avec nettoyage, gommage et masque. Soin apaisant et régénérant. Idéal peaux sensibles.',
      keywords: 'led thérapie, soin led complet, photothérapie, soin apaisant, masque led, gommage doux',
      price: 120,
      launchPrice: 100,
      promoPrice: 110,
      forfaitPrice: 600,
      forfaitPromo: 500,
      duration: 60,
      benefits: JSON.stringify([
        'Apaisement immédiat des rougeurs',
        'Stimulation de la régénération cellulaire',
        'Effet anti-inflammatoire',
        'Boost de collagène (LED rouge)',
        'Action antibactérienne (LED bleue)',
        'Éclat et luminosité',
        'Relaxation profonde',
        'Idéal post-procédure'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Nettoyage',
          description: 'Double nettoyage adapté à votre peau',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Gommage Enzymatique',
          description: 'Exfoliation douce aux enzymes de fruits',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Masque Personnalisé',
          description: 'Masque hydratant, apaisant ou purifiant selon vos besoins',
          duration: '15 min'
        },
        {
          step: 4,
          title: 'LED Thérapie',
          description: 'Séance personnalisée (rouge anti-âge, bleu anti-acné, ou combiné)',
          duration: '20 min'
        },
        {
          step: 5,
          title: 'Finition',
          description: 'Sérum, crème et protection adaptés',
          duration: '5 min'
        }
      ]),
      recommendations: 'Parfait pour les peaux sensibles, réactives, ou après des soins plus intensifs (Dermapen, peeling). Excellent en cure de 10 séances pour traiter l\'acné ou stimuler le collagène.',
      contraindications: 'Épilepsie, photosensibilité médicamenteuse, cancer de la peau.',
      mainImage: '/services/led-therapie.jpg',
      gallery: JSON.stringify(['/services/led-therapie.jpg']),
      category: 'Soins essentiels',
      canBeOption: false,
      active: true,
      featured: false
    }
  })

  // 3. Mettre à jour la LED Thérapie simple pour la différencier
  await prisma.service.update({
    where: { slug: 'led-therapie' },
    data: {
      name: 'LED Express',
      shortDescription: 'La séance LED rapide en complément de vos soins',
      description: `La LED Express est une séance de photothérapie pure, idéale en complément d'autres soins ou en cure. Sans préparation élaborée, cette séance se concentre sur l'exposition aux LED thérapeutiques pour un maximum d'efficacité en minimum de temps.`,
      price: 60,
      duration: 30,
      canBeOption: true,
      category: 'Options & Compléments',
      process: JSON.stringify([
        {
          step: 1,
          title: 'Préparation',
          description: 'Nettoyage rapide',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'LED Thérapie',
          description: 'Exposition ciblée',
          duration: '20 min'
        },
        {
          step: 3,
          title: 'Protection',
          description: 'Sérum et SPF',
          duration: '5 min'
        }
      ])
    }
  })

  console.log("✅ Nouveaux soins ajoutés :")
  console.log("")
  console.log("1. BB GLOW (Option - 30min - 90€)")
  console.log("   → Peut être ajouté aux autres soins")
  console.log("")
  console.log("2. SÉANCE LED COMPLÈTE (60min - 120€)")
  console.log("   → Nettoyage + Gommage + Masque + LED")
  console.log("")
  console.log("3. LED EXPRESS (30min - 60€)")
  console.log("   → Version rapide, idéale en complément")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })