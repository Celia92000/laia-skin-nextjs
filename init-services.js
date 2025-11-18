// Script pour initialiser les services dans la base de données
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initServices() {
  const services = [
    {
      id: 'bb-glow',
      slug: 'bb-glow',
      name: 'BB Glow',
      shortDescription: 'Le BB Glow offre un teint unifié et lumineux en infusant un fond de teint semi-permanent dans les couches superficielles de la peau.',
      description: 'Le BB Glow est une technique révolutionnaire qui permet d\'obtenir un effet "bonne mine" durable. Cette méthode utilise la micro-perforation pour infuser un fond de teint semi-permanent dans les couches superficielles de la peau.',
      category: 'Teint',
      price: 150,
      duration: 90,
      active: true,
      featured: true,
      order: 1,
      benefits: JSON.stringify([
        'Teint unifié et lumineux',
        'Réduction des imperfections',
        'Effet bonne mine longue durée',
        'Hydratation profonde'
      ]),
      contraindications: JSON.stringify([
        'Grossesse et allaitement',
        'Infections cutanées actives',
        'Traitement Roaccutane en cours'
      ])
    },
    {
      id: 'hydrocleaning',
      slug: 'hydrocleaning',
      name: 'Hydrocleaning',
      shortDescription: 'L\'Hydrocleaning est un soin complet qui nettoie, exfolie et hydrate votre peau en profondeur pour un teint éclatant.',
      description: 'L\'Hydrocleaning est une technique de nettoyage en profondeur qui combine plusieurs technologies pour purifier et hydrater la peau.',
      category: 'Nettoyage',
      price: 120,
      duration: 60,
      active: true,
      featured: true,
      order: 2,
      benefits: JSON.stringify([
        'Nettoyage en profondeur',
        'Exfoliation douce',
        'Hydratation intense',
        'Teint éclatant'
      ])
    },
    {
      id: 'led-therapie',
      slug: 'led-therapie',
      name: 'LED Thérapie',
      shortDescription: 'La LED thérapie utilise différentes longueurs d\'onde de lumière pour traiter divers problèmes de peau.',
      description: 'La LED thérapie est une technique non invasive qui utilise différentes couleurs de lumière LED pour traiter divers problèmes cutanés.',
      category: 'Anti-âge',
      price: 80,
      duration: 45,
      active: true,
      featured: false,
      order: 3,
      benefits: JSON.stringify([
        'Stimulation du collagène',
        'Réduction de l\'acné',
        'Amélioration du teint',
        'Effet anti-âge'
      ])
    },
    {
      id: 'renaissance',
      slug: 'renaissance',
      name: 'Renaissance',
      shortDescription: 'Le soin Renaissance est notre protocole signature anti-âge qui combine plusieurs techniques pour une régénération complète.',
      description: 'Le soin Renaissance est notre protocole le plus complet, combinant microneedling, LED thérapie et cocktails de vitamines.',
      category: 'Anti-âge',
      price: 250,
      duration: 120,
      active: true,
      featured: true,
      order: 4,
      benefits: JSON.stringify([
        'Régénération cellulaire',
        'Effet liftant',
        'Réduction des rides',
        'Éclat du teint'
      ])
    }
  ];

  for (const service of services) {
    try {
      await prisma.service.upsert({
        where: { id: service.id },
        update: service,
        create: service
      });
      console.log(`✅ Service créé/mis à jour : ${service.name}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${service.name}:`, error.message);
    }
  }

  console.log('\n📊 Services dans la base de données:');
  const allServices = await prisma.service.findMany();
  console.log(allServices.map(s => `- ${s.name} (/${s.slug})`).join('\n'));
}

initServices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());