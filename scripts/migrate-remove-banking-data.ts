#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Application de la migration : Suppression des colonnes bancaires...')

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../prisma/migrations/manual_remove_banking_data.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    // Extraire les commandes SQL (en ignorant les commentaires)
    const sqlCommands = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .filter(cmd => cmd.trim().length > 0)

    // Exécuter chaque commande
    for (const command of sqlCommands) {
      const trimmedCommand = command.trim()
      if (trimmedCommand) {
        console.log(`📝 Exécution: ${trimmedCommand.substring(0, 60)}...`)
        await prisma.$executeRawUnsafe(trimmedCommand)
        console.log('✅ Commande exécutée avec succès')
      }
    }

    console.log('\n✅ Migration terminée avec succès !')
    console.log('\nColonnes supprimées :')
    console.log('  ❌ sepaIban')
    console.log('  ❌ sepaBic')
    console.log('  ❌ sepaAccountHolder')
    console.log('  ❌ sepaMandate')
    console.log('\nColonnes conservées :')
    console.log('  ✅ sepaMandateRef (référence uniquement)')
    console.log('  ✅ sepaMandateDate (date uniquement)')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
