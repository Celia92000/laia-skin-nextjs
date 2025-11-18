/**
 * Script de test pour générer un contrat d'abonnement
 * Usage: npx tsx scripts/generate-test-contract.ts
 */

import { PrismaClient } from '@prisma/client'
import { createOnboardingContract } from '../src/lib/contract-generator'
import { writeFile } from 'fs/promises'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Recherche d\'une organisation sans contrat...')

    // Trouver une organisation sans contrat
    const org = await prisma.organization.findFirst({
      where: {
        contractNumber: null
      },
      include: {
        config: true
      }
    })

    if (!org) {
      console.log('❌ Aucune organisation sans contrat trouvée')
      console.log('💡 Toutes les organisations ont déjà un contrat')
      return
    }

    console.log(`✅ Organisation trouvée: ${org.name}`)
    console.log(`   Plan: ${org.plan}`)
    console.log(`   Email: ${org.ownerEmail}`)

    // Mapper les prix des plans
    const planPrices: Record<string, number> = {
      SOLO: 49,
      DUO: 69,
      TEAM: 119,
      PREMIUM: 179
    }

    const monthlyAmount = planPrices[org.plan] || 49

    console.log('\n📄 Génération du contrat...')

    // Générer le contrat
    const contractResult = await createOnboardingContract({
      organizationName: org.name,
      legalName: org.legalName || org.name,
      siret: org.siret || '',
      tvaNumber: org.tvaNumber || '',
      billingAddress: org.billingAddress || '',
      billingPostalCode: org.billingPostalCode || '',
      billingCity: org.billingCity || '',
      billingCountry: org.billingCountry || 'France',
      ownerFirstName: org.ownerFirstName,
      ownerLastName: org.ownerLastName,
      ownerEmail: org.ownerEmail,
      ownerPhone: org.ownerPhone || '',
      plan: org.plan,
      monthlyAmount,
      trialEndsAt: org.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionStartDate: org.createdAt,
      sepaMandateRef: org.sepaMandateRef || '',
      sepaMandateDate: org.sepaMandateDate || new Date()
    })

    console.log(`✅ Contrat généré: ${contractResult.contractNumber}`)
    console.log(`   Chemin: ${contractResult.pdfPath}`)

    // Mettre à jour l'organisation
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        contractNumber: contractResult.contractNumber,
        contractPdfPath: contractResult.pdfPath,
        contractSignedAt: new Date()
      }
    })

    console.log(`✅ Organisation mise à jour dans la base de données`)
    console.log(`\n📂 Le contrat PDF est disponible à: ${contractResult.pdfPath}`)
    console.log(`🌐 Vous pouvez le consulter depuis le super-admin à:`)
    console.log(`   http://localhost:3001/super-admin/organizations/${org.id}`)
    console.log(`   ou`)
    console.log(`   http://localhost:3001/super-admin/billing/contracts`)

  } catch (error) {
    console.error('❌ Erreur:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
