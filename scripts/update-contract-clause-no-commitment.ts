import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateContractClause() {
  try {
    const newContent = `Le présent contrat est conclu pour une durée indéterminée, SANS ENGAGEMENT et SANS PRÉAVIS de résiliation.

L'abonnement est renouvelé automatiquement chaque mois, sans tacite reconduction contraignante.

Le Client peut résilier son abonnement À TOUT MOMENT, SANS PRÉAVIS et SANS FRAIS, depuis son espace client ou par email à contact@laiaconnect.fr.

La résiliation prend effet à la fin de la période de facturation en cours. Le Client conserve l'accès au Service jusqu'à la fin de la période déjà payée.

Aucun remboursement au prorata ne sera effectué pour le mois en cours déjà payé.

Aucun préavis n'est requis. Il suffit de cliquer sur "Résilier" dans les paramètres de votre abonnement.`

    const result = await prisma.contractClause.update({
      where: { key: 'article_4' },
      data: {
        content: newContent,
        updatedAt: new Date()
      }
    })

    console.log('✅ Clause "ARTICLE 4 - DURÉE ET RÉSILIATION" mise à jour avec succès')
    console.log('Nouveau contenu:', result.content)
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateContractClause()
