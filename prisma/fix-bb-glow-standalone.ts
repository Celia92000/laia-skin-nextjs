import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // BB Glow comme soin complet ET option
  await prisma.service.update({
    where: { slug: 'bb-glow' },
    data: {
      name: 'BB Glow',
      shortDescription: 'Le teint parfait semi-permanent - Disponible seul ou en option',
      description: `Le BB Glow est un traitement révolutionnaire qui dépose des pigments semi-permanents pour un effet "fond de teint" naturel durant plusieurs semaines. Disponible en soin complet (60 min) ou en option à ajouter à vos autres soins (+30 min). Réveillez-vous chaque matin avec une peau parfaite !`,
      price: 150, // Prix soin complet
      duration: 60, // Durée soin complet
      canBeOption: true, // Peut aussi être ajouté en option
      category: 'Soins du visage',
      featured: true,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Consultation & Préparation',
          description: 'Analyse de peau et choix de la teinte',
          duration: '10 min'
        },
        {
          step: 2,
          title: 'Nettoyage',
          description: 'Double nettoyage et désinfection',
          duration: '10 min'
        },
        {
          step: 3,
          title: 'Application BB Sérum',
          description: 'Dermapen avec sérum BB Glow teinté',
          duration: '25 min'
        },
        {
          step: 4,
          title: 'Masque Apaisant',
          description: 'Masque hydrogel pour calmer et fixer',
          duration: '10 min'
        },
        {
          step: 5,
          title: 'Protection',
          description: 'Sérum réparateur et SPF',
          duration: '5 min'
        }
      ])
    }
  })

  // Créer une version "BB Glow Express" pour l'option
  await prisma.service.create({
    data: {
      slug: 'bb-glow-express',
      name: 'BB Glow Express (Option)',
      shortDescription: 'Ajoutez l\'effet BB Glow à votre soin - 30 min supplémentaires',
      description: `Version express du BB Glow à ajouter en complément de votre soin principal. En seulement 30 minutes supplémentaires, obtenez l'effet teint parfait semi-permanent. Idéal après un Hydro'Cleaning ou un Renaissance.`,
      price: 90, // Prix réduit en option
      duration: 30,
      canBeOption: true,
      category: 'Options & Compléments',
      active: true,
      featured: false,
      process: JSON.stringify([
        {
          step: 1,
          title: 'Choix teinte',
          description: 'Sélection rapide',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Application',
          description: 'BB Sérum avec Dermapen',
          duration: '20 min'
        },
        {
          step: 3,
          title: 'Finition',
          description: 'Fixation et protection',
          duration: '5 min'
        }
      ])
    }
  })

  console.log("✅ BB Glow configuré :")
  console.log("")
  console.log("• BB GLOW COMPLET (60min - 150€)")
  console.log("  → Soin standalone avec protocole complet")
  console.log("")
  console.log("• BB GLOW EXPRESS (30min - 90€)")
  console.log("  → Version option à ajouter aux autres soins")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })