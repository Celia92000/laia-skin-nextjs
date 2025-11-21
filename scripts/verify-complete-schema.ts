import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Schéma COMPLET extrait de schema.prisma
const COMPLETE_SCHEMA = {
  User: [
    'id', 'organizationId', 'email', 'password', 'name', 'phone', 'role',
    'emailVerified', 'image', 'customPermissions', 'isVisible', 'isAvailable',
    'loyaltyPoints', 'totalSpent', 'adminNotes', 'allergies', 'birthDate',
    'lastVisit', 'medicalNotes', 'preferences', 'skinType', 'resetToken',
    'resetTokenExpiry', 'lastLoginAt', 'deletionRequestedAt', 'scheduledDeletionAt',
    'createdAt', 'updatedAt'
  ],
  Organization: [
    'id', 'name', 'slug', 'legalName', 'type', 'domain', 'subdomain',
    'databaseUrl', 'plan', 'status', 'trialEndsAt', 'subscriptionId',
    'leadSource', 'activatedAt', 'convertedAt', 'maxLocations', 'maxUsers',
    'maxStorage', 'customFeaturesEnabled', 'customFeaturesDisabled',
    'ownerFirstName', 'ownerLastName', 'ownerEmail', 'ownerPhone', 'siret',
    'tvaNumber', 'billingEmail', 'billingAddress', 'billingPostalCode',
    'billingCity', 'billingCountry', 'sepaMandateRef', 'sepaMandateDate',
    'nextBillingDate', 'lastBillingDate', 'lastPaymentDate', 'monthlyAmount',
    'stripeCustomerId', 'stripeSubscriptionId', 'stripeConnectedAccountId',
    'stripeOnboardingComplete', 'stripeChargesEnabled', 'stripePayoutsEnabled',
    'contractNumber', 'contractPdfPath', 'contractSignedAt',
    'planityConnected', 'planityAccessToken', 'planityRefreshToken',
    'planityTokenExpiry', 'planityBusinessId', 'planityBusinessName',
    'treatwellConnected', 'treatwellAccessToken', 'treatwellRefreshToken',
    'treatwellTokenExpiry', 'treatwellVenueId', 'treatwellVenueName',
    'paypalConnected', 'paypalAccessToken', 'paypalRefreshToken',
    'paypalTokenExpiry', 'paypalMerchantId', 'paypalEmail',
    'sumupConnected', 'sumupAccessToken', 'sumupRefreshToken',
    'sumupTokenExpiry', 'sumupMerchantCode', 'sumupCurrency',
    'googleCalendarConnected', 'googleCalendarAccessToken', 'googleCalendarRefreshToken',
    'googleCalendarTokenExpiry', 'googleCalendarId', 'googleCalendarEmail',
    'templateVersion', 'lastTemplateUpdate',
    'featureBlog', 'featureProducts', 'featureCRM', 'featureEmailing',
    'featureWhatsApp', 'featureSMS', 'featureSocialMedia', 'featureStock',
    'featureFormations', 'featureShop',
    'addons', 'address', 'city', 'zipCode', 'country', 'timezone', 'currency',
    'logoUrl', 'websiteUrl', 'description', 'instagram', 'facebook',
    'linkedIn', 'twitter', 'stripeAccountId', 'paymentProvider', 'paymentMethodId',
    'featureReviews', 'featureLoyalty', 'featureAccounting', 'featureGiftCards',
    'featureMultiLocation',
    'createdAt', 'updatedAt'
  ],
  Service: [
    'id', 'organizationId', 'categoryId', 'name', 'description',
    'duration', 'price', 'imageUrl', 'active', 'order', 'color',
    'requiresApproval', 'isPublic', 'maxClientsPerSlot', 'locationId',
    'createdAt', 'updatedAt'
  ],
  Product: [
    'id', 'organizationId', 'categoryId', 'name', 'description',
    'price', 'salePrice', 'imageUrl', 'stock', 'sku', 'barcode',
    'isActive', 'isFeatured', 'weight', 'dimensions', 'loyaltyPoints',
    'createdAt', 'updatedAt'
  ],
  Reservation: [
    'id', 'organizationId', 'userId', 'serviceId', 'staffId', 'locationId',
    'date', 'startTime', 'endTime', 'status', 'notes', 'clientNotes',
    'internalNotes', 'price', 'paidAmount', 'paymentStatus', 'paymentMethod',
    'reminderSent', 'cancelledAt', 'cancelReason', 'createdAt', 'updatedAt'
  ]
};

async function verifyCompleteSchema() {
  console.log('🔍 VÉRIFICATION COMPLÈTE DU SCHÉMA DE BASE DE DONNÉES\n');
  console.log('='.repeat(70));

  const allMissing: { table: string; columns: string[] }[] = [];
  let totalChecked = 0;
  let totalMissing = 0;

  for (const [tableName, expectedColumns] of Object.entries(COMPLETE_SCHEMA)) {
    console.log(`\n🔎 Table "${tableName}" (${expectedColumns.length} colonnes)...`);

    const missingColumns: string[] = [];

    for (const columnName of expectedColumns) {
      totalChecked++;
      try {
        const testQuery = `SELECT "${columnName}" FROM "${tableName}" LIMIT 1`;
        await prisma.$queryRawUnsafe(testQuery);
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          missingColumns.push(columnName);
          totalMissing++;
        }
      }
    }

    if (missingColumns.length === 0) {
      console.log(`   ✅ Toutes les colonnes présentes (${expectedColumns.length}/${expectedColumns.length})`);
    } else {
      console.log(`   ❌ ${missingColumns.length} colonne(s) manquante(s):`);
      missingColumns.forEach(col => console.log(`      - ${col}`));
      allMissing.push({ table: tableName, columns: missingColumns });
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RÉSUMÉ FINAL\n');
  console.log(`   Colonnes vérifiées : ${totalChecked}`);
  console.log(`   Colonnes manquantes : ${totalMissing}`);

  if (totalMissing === 0) {
    console.log('\n🎉 PARFAIT ! Toutes les colonnes existent dans la base de données.\n');
  } else {
    console.log('\n⚠️  ATTENTION ! Il reste des colonnes manquantes :\n');
    allMissing.forEach(({ table, columns }) => {
      console.log(`   ${table}: ${columns.join(', ')}`);
    });
    console.log('\n💡 Exécutez les scripts de correction appropriés.\n');
  }

  await prisma.$disconnect();
}

verifyCompleteSchema();
