// Script de migration vers architecture multi-tenant
// Ce script doit être exécuté AVANT d'appliquer le nouveau schéma Prisma avec les champs obligatoires

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping des anciens rôles vers les nouveaux
const ROLE_MAPPING: Record<string, string> = {
  'ADMIN': 'ORG_OWNER',
  'EMPLOYEE': 'STAFF',
  'STAGIAIRE': 'STAFF',
  'COMPTABLE': 'ORG_ADMIN',
  'CLIENT': 'CLIENT',
  'client': 'CLIENT',
  'INACTIVE': 'CLIENT',
  'RECEPTIONIST': 'RECEPTIONIST'
}

async function migrateToMultiTenant() {
  console.log('🚀 Démarrage de la migration vers multi-tenancy...\n')

  try {
    // 1. Créer l'organisation Laia Skin par défaut
    console.log('📦 Création de l\'organisation Laia Skin...')

    const organization = await prisma.$executeRaw`
      INSERT INTO "Organization" (
        id, name, slug, "legalName", type, subdomain, plan, status,
        "ownerEmail", "maxLocations", "maxUsers", "maxStorage",
        "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        'Laia Skin Institut',
        'laia-skin',
        'Laia Skin Institut',
        'SINGLE_LOCATION',
        'laia-skin',
        'ENTERPRISE',
        'ACTIVE',
        'admin@laiaskin.com',
        10,
        100,
        50,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `

    // Récupérer l'ID de l'organisation
    const orgResult = await prisma.$queryRaw<Array<{id: string}>>`
      SELECT id FROM "Organization" WHERE slug = 'laia-skin' LIMIT 1
    `

    if (!orgResult || orgResult.length === 0) {
      throw new Error('Organisation non trouvée après création')
    }

    const orgId = orgResult[0].id
    console.log(`✅ Organisation créée: ${orgId}\n`)

    // 2. Créer un emplacement par défaut
    console.log('📍 Création de l\'emplacement principal...')

    await prisma.$executeRaw`
      INSERT INTO "Location" (
        id, "organizationId", name, slug, address, city, "postalCode", country,
        "isMainLocation", active, "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${orgId}::text,
        'Laia Skin Institut - Principal',
        'principal',
        '123 rue de la Beauté',
        'Paris',
        '75001',
        'France',
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `

    const locResult = await prisma.$queryRaw<Array<{id: string}>>`
      SELECT id FROM "Location" WHERE "organizationId" = ${orgId}::text LIMIT 1
    `

    if (!locResult || locResult.length === 0) {
      throw new Error('Location non trouvée après création')
    }

    const locationId = locResult[0].id
    console.log(`✅ Emplacement créé: ${locationId}\n`)

    // 3. Associer tous les utilisateurs à l'organisation avec conversion de rôles
    console.log('👥 Migration des utilisateurs...')

    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    })

    let userCount = 0
    for (const user of users) {
      const oldRole = user.role || 'CLIENT'
      const newRole = ROLE_MAPPING[oldRole] || 'CLIENT'

      // Utiliser un raw SQL avec cast explicite vers l'enum
      await prisma.$executeRawUnsafe(`
        UPDATE "User"
        SET "organizationId" = '${orgId}',
            role = '${newRole}'::"UserRole"
        WHERE id = '${user.id}'
      `)
      userCount++
    }

    console.log(`✅ ${userCount} utilisateurs migrés\n`)

    // 4. Associer tous les services à l'organisation
    console.log('💆 Migration des services...')
    await prisma.$executeRaw`
      UPDATE "Service" SET "organizationId" = ${orgId}::text WHERE "organizationId" IS NULL
    `
    const servicesCount = await prisma.service.count()
    console.log(`✅ ${servicesCount} services migrés\n`)

    // 5. Associer tous les produits à l'organisation
    console.log('🛍️ Migration des produits...')
    await prisma.$executeRaw`
      UPDATE "Product" SET "organizationId" = ${orgId}::text WHERE "organizationId" IS NULL
    `
    const productsCount = await prisma.product.count()
    console.log(`✅ ${productsCount} produits migrés\n`)

    // 6. Associer tous les articles de blog à l'organisation
    console.log('📝 Migration des articles de blog...')
    await prisma.$executeRaw`
      UPDATE "BlogPost" SET "organizationId" = ${orgId}::text WHERE "organizationId" IS NULL
    `
    const blogPostsCount = await prisma.blogPost.count()
    console.log(`✅ ${blogPostsCount} articles de blog migrés\n`)

    // 7. Associer toutes les réservations à l'organisation et l'emplacement
    console.log('📅 Migration des réservations...')
    await prisma.$executeRaw`
      UPDATE "Reservation"
      SET "organizationId" = ${orgId}::text,
          "locationId" = ${locationId}::text
      WHERE "organizationId" IS NULL
    `
    const reservationsCount = await prisma.reservation.count()
    console.log(`✅ ${reservationsCount} réservations migrées\n`)

    // 8. Associer les horaires à l'emplacement
    console.log('🕒 Migration des horaires...')
    await prisma.$executeRaw`
      UPDATE "WorkingHours" SET "locationId" = ${locationId}::text WHERE "locationId" IS NULL
    `
    const workingHoursCount = await prisma.workingHours.count()
    console.log(`✅ ${workingHoursCount} horaires migrés\n`)

    // 9. Associer les créneaux bloqués à l'emplacement
    console.log('🚫 Migration des créneaux bloqués...')
    await prisma.$executeRaw`
      UPDATE "BlockedSlot" SET "locationId" = ${locationId}::text WHERE "locationId" IS NULL
    `
    const blockedSlotsCount = await prisma.blockedSlot.count()
    console.log(`✅ ${blockedSlotsCount} créneaux bloqués migrés\n`)

    // 10. Créer la configuration de l'organisation en copiant depuis SiteConfig
    console.log('⚙️ Migration de la configuration du site...')

    const siteConfig = await prisma.siteConfig.findFirst()

    if (siteConfig) {
      await prisma.$executeRaw`
        INSERT INTO "OrganizationConfig" (
          id, "organizationId", "siteName", "siteTagline", "siteDescription",
          email, phone, address, city, "postalCode", country,
          facebook, instagram, tiktok, whatsapp, linkedin, youtube,
          "primaryColor", "secondaryColor", "accentColor", "logoUrl", "faviconUrl",
          "fontFamily", "headingFont", "baseFontSize", "headingSize",
          "businessHours", latitude, longitude, "googleMapsUrl",
          "heroTitle", "heroSubtitle", "heroImage", "aboutText",
          "founderName", "founderTitle", "founderQuote", "founderImage",
          "aboutIntro", "aboutParcours", testimonials, formations,
          "termsAndConditions", "privacyPolicy", "legalNotice",
          "emailSignature", "welcomeEmailText",
          siret, siren, "tvaNumber", "apeCode", rcs, capital, "legalForm",
          "insuranceCompany", "insuranceContract", "insuranceAddress",
          "bankName", "bankIban", "bankBic",
          "legalRepName", "legalRepTitle",
          "googleAnalyticsId", "facebookPixelId", "metaVerificationCode", "googleVerificationCode",
          "defaultMetaTitle", "defaultMetaDescription", "defaultMetaKeywords",
          "createdAt", "updatedAt"
        )
        SELECT
          gen_random_uuid()::text, ${orgId}::text, "siteName", "siteTagline", "siteDescription",
          email, phone, address, city, "postalCode", country,
          facebook, instagram, tiktok, whatsapp, linkedin, youtube,
          "primaryColor", "secondaryColor", "accentColor", "logoUrl", "faviconUrl",
          "fontFamily", "headingFont", "baseFontSize", "headingSize",
          "businessHours", latitude, longitude, "googleMapsUrl",
          "heroTitle", "heroSubtitle", "heroImage", "aboutText",
          "founderName", "founderTitle", "founderQuote", "founderImage",
          "aboutIntro", "aboutParcours", testimonials, formations,
          "termsAndConditions", "privacyPolicy", "legalNotice",
          "emailSignature", "welcomeEmailText",
          siret, siren, "tvaNumber", "apeCode", rcs, capital, "legalForm",
          "insuranceCompany", "insuranceContract", "insuranceAddress",
          "bankName", "bankIban", "bankBic",
          "legalRepName", "legalRepTitle",
          "googleAnalyticsId", "facebookPixelId", "metaVerificationCode", "googleVerificationCode",
          "defaultMetaTitle", "defaultMetaDescription", "defaultMetaKeywords",
          NOW(), NOW()
        FROM "SiteConfig"
        WHERE id = ${siteConfig.id}::text
        ON CONFLICT DO NOTHING
      `
      console.log('✅ Configuration migrée\n')
    } else {
      console.log('⚠️ Aucune configuration existante trouvée\n')
    }

    console.log('✨ Migration terminée avec succès !')
    console.log('\nRésumé:')
    console.log(`- Organisation: Laia Skin Institut (${orgId})`)
    console.log(`- Emplacement: Principal (${locationId})`)
    console.log(`- ${userCount} utilisateurs migrés`)
    console.log(`- ${servicesCount} services migrés`)
    console.log(`- ${productsCount} produits migrés`)
    console.log(`- ${blogPostsCount} articles migrés`)
    console.log(`- ${reservationsCount} réservations migrées`)
    console.log(`- ${workingHoursCount} horaires migrés`)
    console.log(`- ${blockedSlotsCount} créneaux bloqués migrés`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateToMultiTenant()
  .then(() => {
    console.log('\n✅ Vous pouvez maintenant exécuter: npx prisma db push --accept-data-loss')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration échouée:', error)
    process.exit(1)
  })
