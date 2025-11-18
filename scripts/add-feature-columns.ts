/**
 * Script pour ajouter les colonnes de features et templates à la base de données
 * Utilise du SQL brut pour éviter les timeouts Prisma
 */

import { prisma } from '../src/lib/prisma'

async function addFeatureColumns() {
  console.log('\n🔧 AJOUT DES COLONNES FEATURES ET TEMPLATES\n')
  console.log('='.repeat(60))

  try {
    // 1. Ajouter les colonnes de features à Organization
    console.log('\n📦 Ajout des colonnes features à Organization...')

    const featureColumns = [
      'featureBlog BOOLEAN DEFAULT false',
      'featureProducts BOOLEAN DEFAULT false',
      'featureCRM BOOLEAN DEFAULT false',
      'featureStock BOOLEAN DEFAULT false',
      'featureFormations BOOLEAN DEFAULT false',
    ]

    for (const column of featureColumns) {
      const columnName = column.split(' ')[0]
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "Organization"
          ADD COLUMN IF NOT EXISTS "${columnName}" BOOLEAN DEFAULT false;
        `)
        console.log(`   ✅ ${columnName} ajouté`)
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  ${columnName} existe déjà`)
        } else {
          console.log(`   ❌ Erreur ${columnName}:`, error.message)
        }
      }
    }

    // 2. Ajouter templateSourceId et isCustomized à Service
    console.log('\n📝 Ajout colonnes template à Service...')

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Service"
        ADD COLUMN IF NOT EXISTS "templateSourceId" TEXT,
        ADD COLUMN IF NOT EXISTS "isCustomized" BOOLEAN DEFAULT false;
      `)
      console.log('   ✅ Colonnes template ajoutées à Service')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Colonnes template existent déjà dans Service')
      } else {
        console.log('   ❌ Erreur:', error.message)
      }
    }

    // 3. Ajouter templateSourceId et isCustomized à Product
    console.log('\n🛍️  Ajout colonnes template à Product...')

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Product"
        ADD COLUMN IF NOT EXISTS "templateSourceId" TEXT,
        ADD COLUMN IF NOT EXISTS "isCustomized" BOOLEAN DEFAULT false;
      `)
      console.log('   ✅ Colonnes template ajoutées à Product')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Colonnes template existent déjà dans Product')
      } else {
        console.log('   ❌ Erreur:', error.message)
      }
    }

    // 4. Ajouter templateSourceId et isCustomized à BlogPost
    console.log('\n📰 Ajout colonnes template à BlogPost...')

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "BlogPost"
        ADD COLUMN IF NOT EXISTS "templateSourceId" TEXT,
        ADD COLUMN IF NOT EXISTS "isCustomized" BOOLEAN DEFAULT false;
      `)
      console.log('   ✅ Colonnes template ajoutées à BlogPost')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Colonnes template existent déjà dans BlogPost')
      } else {
        console.log('   ❌ Erreur:', error.message)
      }
    }

    // 5. Ajouter templateSourceId, isCustomized et organizationId à Formation
    console.log('\n🎓 Ajout colonnes template à Formation...')

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Formation"
        ADD COLUMN IF NOT EXISTS "templateSourceId" TEXT,
        ADD COLUMN IF NOT EXISTS "isCustomized" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "organizationId" TEXT;
      `)
      console.log('   ✅ Colonnes template ajoutées à Formation')

      // Créer l'index
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Formation_organizationId_idx"
        ON "Formation"("organizationId");
      `)
      console.log('   ✅ Index organizationId créé')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Colonnes template existent déjà dans Formation')
      } else {
        console.log('   ❌ Erreur:', error.message)
      }
    }

    // 6. Ajouter customizedFields à OrganizationConfig
    console.log('\n⚙️  Ajout customizedFields à OrganizationConfig...')

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "OrganizationConfig"
        ADD COLUMN IF NOT EXISTS "customizedFields" TEXT DEFAULT '{}';
      `)
      console.log('   ✅ customizedFields ajouté à OrganizationConfig')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  customizedFields existe déjà dans OrganizationConfig')
      } else {
        console.log('   ❌ Erreur:', error.message)
      }
    }

    // 7. Ajouter addons à Organization
    console.log('\n💎 Ajout addons à Organization...')

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Organization"
        ADD COLUMN IF NOT EXISTS "addons" TEXT DEFAULT '{}';
      `)
      console.log('   ✅ addons ajouté à Organization')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  addons existe déjà dans Organization')
      } else {
        console.log('   ❌ Erreur:', error.message)
      }
    }

    // 8. Ajouter champs design avancé à OrganizationConfig
    console.log('\n🎨 Ajout champs design avancé à OrganizationConfig...')

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "OrganizationConfig"
        ADD COLUMN IF NOT EXISTS "homeTemplate" TEXT DEFAULT 'classic',
        ADD COLUMN IF NOT EXISTS "homeSections" TEXT DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS "footerConfig" TEXT DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "extendedColors" TEXT DEFAULT '{}';
      `)
      console.log('   ✅ Champs design avancé ajoutés à OrganizationConfig')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('   ⚠️  Champs design existent déjà dans OrganizationConfig')
      } else {
        console.log('   ❌ Erreur:', error.message)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ MIGRATION TERMINÉE AVEC SUCCÈS !\n')

  } catch (error) {
    console.error('\n❌ ERREUR GLOBALE:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter
addFeatureColumns()
  .then(() => {
    console.log('✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Échec du script:', error)
    process.exit(1)
  })
