import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Liste complète des colonnes attendues basée sur schema.prisma
const EXPECTED_SCHEMA = {
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
    'address', 'city', 'zipCode', 'country', 'timezone', 'currency',
    'logoUrl', 'websiteUrl', 'description', 'instagram', 'facebook',
    'linkedIn', 'twitter', 'stripeAccountId', 'stripeCustomerId',
    'paymentProvider', 'paymentMethodId', 'billingEmail',
    'featureEmailing', 'featureSMS', 'featureWhatsApp', 'featureSocialMedia',
    'featureReviews', 'featureBlog', 'featureLoyalty', 'featureCRM',
    'featureStock', 'featureAccounting', 'featureGiftCards', 'featureMultiLocation',
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

async function verifyAllColumns() {
  console.log('🔍 VÉRIFICATION EXHAUSTIVE DU SCHÉMA\n');
  console.log('='.repeat(70));

  let totalMissing = 0;
  let totalChecked = 0;

  for (const [tableName, expectedColumns] of Object.entries(EXPECTED_SCHEMA)) {
    console.log(`\n🔎 Vérification de la table "${tableName}"...`);

    const missingColumns: string[] = [];

    for (const columnName of expectedColumns) {
      totalChecked++;
      try {
        // Tester si la colonne existe en faisant une requête select
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
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RÉSUMÉ FINAL\n');
  console.log(`   Colonnes vérifiées : ${totalChecked}`);
  console.log(`   Colonnes manquantes : ${totalMissing}`);

  if (totalMissing === 0) {
    console.log('\n🎉 PARFAIT ! Toutes les colonnes du schéma Prisma existent dans la DB.\n');
  } else {
    console.log('\n⚠️  ATTENTION ! Il y a des colonnes manquantes à ajouter.\n');
  }

  await prisma.$disconnect();
}

verifyAllColumns();
