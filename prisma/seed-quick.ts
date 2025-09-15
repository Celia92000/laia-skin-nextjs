import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Créer quelques services de base
  const services = await Promise.all([
    prisma.service.create({
      data: {
        slug: 'hydrafacial',
        name: 'HydraFacial',
        shortDescription: 'Soin du visage révolutionnaire',
        description: 'Le HydraFacial est un soin du visage non invasif qui nettoie, exfolie et hydrate la peau en profondeur.',
        price: 180,
        duration: 60,
        category: 'Soins du visage',
        active: true,
        featured: true,
      },
    }),
    prisma.service.create({
      data: {
        slug: 'bb-glow',
        name: 'BB Glow',
        shortDescription: 'Teint parfait et lumineux',
        description: 'Le BB Glow est un traitement semi-permanent qui donne à votre peau un effet fond de teint naturel.',
        price: 150,
        duration: 90,
        category: 'Soins du visage',
        active: true,
        featured: true,
      },
    }),
    prisma.service.create({
      data: {
        slug: 'microneedling',
        name: 'Microneedling',
        shortDescription: 'Régénération cellulaire',
        description: 'Le microneedling stimule la production de collagène pour une peau plus ferme et éclatante.',
        price: 200,
        duration: 75,
        category: 'Soins anti-âge',
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        slug: 'led-therapie',
        name: 'LED Thérapie',
        shortDescription: 'Traitement par la lumière',
        description: 'La LED thérapie utilise différentes longueurs d\'onde pour traiter divers problèmes de peau.',
        price: 80,
        duration: 30,
        category: 'Soins du visage',
        active: true,
      },
    }),
  ])

  console.log(`✅ ${services.length} services créés`)

  // Créer un utilisateur admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@laiaskin.com',
      password: 'admin123', // En production, utilisez bcrypt
      name: 'Admin LAIA',
      role: 'admin',
    },
  })

  console.log(`✅ Utilisateur admin créé: ${admin.email}`)

  // Créer un client test
  const client = await prisma.user.create({
    data: {
      email: 'marie.dupont@email.com',
      password: 'client123', // En production, utilisez bcrypt
      name: 'Marie Dupont',
      phone: '0612345678',
      role: 'client',
    },
  })

  console.log(`✅ Client test créé: ${client.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })