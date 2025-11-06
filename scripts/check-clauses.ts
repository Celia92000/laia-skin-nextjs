import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Vérification des clauses dans la base de données...\n')

    const clauses = await prisma.contractClause.findMany({
      orderBy: { order: 'asc' }
    })

    console.log(`📊 Nombre de clauses trouvées : ${clauses.length}\n`)

    if (clauses.length === 0) {
      console.log('❌ AUCUNE CLAUSE dans la base de données !')
      console.log('📝 Le script SQL n\'a probablement pas inséré les clauses.')
      console.log('\n💡 Retournez dans Supabase SQL Editor et ré-exécutez le script RESET-COMPLET.sql')
    } else {
      console.log('✅ Clauses trouvées :')
      clauses.forEach(c => {
        console.log(`  ${c.order}. ${c.title} (${c.isActive ? '✅ Actif' : '❌ Inactif'})`)
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
