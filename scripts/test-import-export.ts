#!/usr/bin/env ts-node

/**
 * Script de test automatique Import/Export
 *
 * Ce script teste le cycle complet :
 * 1. Connexion en tant qu'admin
 * 2. Import de données (cartes cadeaux, codes promo, forfaits)
 * 3. Export des données
 * 4. Vérification de la cohérence
 */

import fs from 'fs';
import path from 'path';
import { getPrismaClient } from '../src/lib/prisma';

const BASE_URL = 'http://localhost:3001';

interface TestResult {
  step: string;
  success: boolean;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

/**
 * Étape 1 : Connexion admin
 */
async function loginAsAdmin(): Promise<string | null> {
  console.log('\n📝 Étape 1/5 : Connexion admin...');

  try {
    // Récupérer un compte admin depuis la base de données
    const prisma = await getPrismaClient();

    // Prioritize ORG_ADMIN over SUPER_ADMIN (need valid organizationId)
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ORG_ADMIN',
        organizationId: { not: null }
      },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true
      }
    });

    if (!admin) {
      throw new Error('Aucun compte admin trouvé en base de données');
    }

    console.log(`✅ Admin trouvé : ${admin.email} (${admin.role})`);
    console.log(`   Organisation ID : ${admin.organizationId}`);

    // Simuler l'authentification en créant un token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        organizationId: admin.organizationId
      },
      process.env.JWT_SECRET || 'laia-secret-key-dev',
      { expiresIn: '1h' }
    );

    results.push({
      step: 'Connexion admin',
      success: true,
      details: {
        email: admin.email,
        role: admin.role,
        organizationId: admin.organizationId
      }
    });

    return token;
  } catch (error: any) {
    console.error('❌ Erreur connexion:', error.message);
    results.push({
      step: 'Connexion admin',
      success: false,
      error: error.message
    });
    return null;
  }
}

/**
 * Étape 2 : Test import cartes cadeaux
 */
async function testImportGiftCards(token: string): Promise<boolean> {
  console.log('\n📝 Étape 2/5 : Test import cartes cadeaux...');

  try {
    const templatePath = path.join(process.cwd(), 'public/templates/template-giftcards.csv');

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template non trouvé : ${templatePath}`);
    }

    const csvContent = fs.readFileSync(templatePath, 'utf-8');

    const response = await fetch(`${BASE_URL}/api/admin/data-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        dataType: 'giftcards',
        csvContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Erreur inconnue'}`);
    }

    console.log(`✅ Import réussi : ${data.imported} cartes cadeaux importées`);
    console.log(`   Échecs : ${data.failed}`);

    if (data.errors && data.errors.length > 0) {
      console.log(`   Erreurs :`, data.errors.slice(0, 3));
    }

    results.push({
      step: 'Import cartes cadeaux',
      success: data.success,
      details: {
        imported: data.imported,
        failed: data.failed,
        errors: data.errors?.length || 0
      }
    });

    return data.success;
  } catch (error: any) {
    console.error('❌ Erreur import cartes cadeaux:', error.message);
    results.push({
      step: 'Import cartes cadeaux',
      success: false,
      error: error.message
    });
    return false;
  }
}

/**
 * Étape 3 : Test import codes promo
 */
async function testImportPromoCodes(token: string): Promise<boolean> {
  console.log('\n📝 Étape 3/5 : Test import codes promo...');

  try {
    const templatePath = path.join(process.cwd(), 'public/templates/template-promocodes.csv');

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template non trouvé : ${templatePath}`);
    }

    const csvContent = fs.readFileSync(templatePath, 'utf-8');

    const response = await fetch(`${BASE_URL}/api/admin/data-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        dataType: 'promocodes',
        csvContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Erreur inconnue'}`);
    }

    console.log(`✅ Import réussi : ${data.imported} codes promo importés`);
    console.log(`   Échecs : ${data.failed}`);

    results.push({
      step: 'Import codes promo',
      success: data.success,
      details: {
        imported: data.imported,
        failed: data.failed,
        errors: data.errors?.length || 0
      }
    });

    return data.success;
  } catch (error: any) {
    console.error('❌ Erreur import codes promo:', error.message);
    results.push({
      step: 'Import codes promo',
      success: false,
      error: error.message
    });
    return false;
  }
}

/**
 * Étape 4 : Test import forfaits
 */
async function testImportPackages(token: string): Promise<boolean> {
  console.log('\n📝 Étape 4/5 : Test import forfaits...');

  try {
    const templatePath = path.join(process.cwd(), 'public/templates/template-packages.csv');

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template non trouvé : ${templatePath}`);
    }

    const csvContent = fs.readFileSync(templatePath, 'utf-8');

    const response = await fetch(`${BASE_URL}/api/admin/data-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        dataType: 'packages',
        csvContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Erreur inconnue'}`);
    }

    console.log(`✅ Import réussi : ${data.imported} forfaits importés`);
    console.log(`   Échecs : ${data.failed}`);

    results.push({
      step: 'Import forfaits',
      success: data.success,
      details: {
        imported: data.imported,
        failed: data.failed,
        errors: data.errors?.length || 0
      }
    });

    return data.success;
  } catch (error: any) {
    console.error('❌ Erreur import forfaits:', error.message);
    results.push({
      step: 'Import forfaits',
      success: false,
      error: error.message
    });
    return false;
  }
}

/**
 * Étape 5 : Test export de toutes les données
 */
async function testExportData(token: string): Promise<boolean> {
  console.log('\n📝 Étape 5/5 : Test export données...');

  try {
    const dataTypes = [
      'clients', 'services', 'products', 'appointments', 'formations',
      'giftcards', 'packages', 'promocodes', 'reviews', 'newsletter'
    ];

    const response = await fetch(`${BASE_URL}/api/admin/data-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        dataTypes
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Erreur inconnue'}`);
    }

    // Vérifier que c'est bien un ZIP
    const contentType = response.headers.get('content-type');
    if (contentType !== 'application/zip') {
      throw new Error(`Type de contenu invalide: ${contentType}, attendu: application/zip`);
    }

    const blob = await response.blob();
    const zipSize = blob.size;

    console.log(`✅ Export réussi : ZIP de ${(zipSize / 1024).toFixed(2)} KB téléchargé`);
    console.log(`   Types exportés : ${dataTypes.length}`);

    // Sauvegarder le ZIP pour inspection manuelle
    const zipPath = path.join(process.cwd(), `test-export-${Date.now()}.zip`);
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(zipPath, buffer);
    console.log(`   ZIP sauvegardé : ${zipPath}`);

    results.push({
      step: 'Export données',
      success: true,
      details: {
        zipSize: zipSize,
        dataTypes: dataTypes.length,
        zipPath: zipPath
      }
    });

    return true;
  } catch (error: any) {
    console.error('❌ Erreur export données:', error.message);
    results.push({
      step: 'Export données',
      success: false,
      error: error.message
    });
    return false;
  }
}

/**
 * Vérification dans la base de données
 */
async function verifyInDatabase(organizationId: string) {
  console.log('\n📝 Vérification en base de données...');

  try {
    const prisma = await getPrismaClient();

    const giftCardsCount = await prisma.giftCard.count({
      where: { organizationId }
    });

    const promoCodesCount = await prisma.promoCode.count({
      where: { organizationId }
    });

    const packagesCount = await prisma.package.count({
      where: { organizationId }
    });

    console.log(`✅ Données en base :`);
    console.log(`   - Cartes cadeaux : ${giftCardsCount}`);
    console.log(`   - Codes promo : ${promoCodesCount}`);
    console.log(`   - Forfaits : ${packagesCount}`);

    results.push({
      step: 'Vérification base de données',
      success: true,
      details: {
        giftCardsCount,
        promoCodesCount,
        packagesCount
      }
    });

  } catch (error: any) {
    console.error('❌ Erreur vérification base:', error.message);
    results.push({
      step: 'Vérification base de données',
      success: false,
      error: error.message
    });
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🧪 TEST COMPLET IMPORT / EXPORT');
  console.log('================================\n');

  // Étape 1 : Connexion
  const token = await loginAsAdmin();
  if (!token) {
    console.error('\n❌ ÉCHEC : Impossible de se connecter');
    process.exit(1);
  }

  // Extraire l'organizationId du token
  const jwt = require('jsonwebtoken');
  const decoded = jwt.decode(token);
  const organizationId = decoded?.organizationId;

  // Étape 2-4 : Imports
  const giftCardsOk = await testImportGiftCards(token);
  const promoCodesOk = await testImportPromoCodes(token);
  const packagesOk = await testImportPackages(token);

  // Vérification en base
  if (organizationId) {
    await verifyInDatabase(organizationId);
  }

  // Étape 5 : Export
  const exportOk = await testExportData(token);

  // Résumé
  console.log('\n\n📊 RÉSUMÉ DES TESTS');
  console.log('==================\n');

  const totalTests = results.length;
  const successTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successTests;

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${result.step}`);
    if (result.details) {
      console.log(`   Détails :`, JSON.stringify(result.details, null, 2));
    }
    if (result.error) {
      console.log(`   Erreur : ${result.error}`);
    }
  });

  console.log(`\n📈 Score : ${successTests}/${totalTests} tests réussis`);

  if (failedTests > 0) {
    console.log(`\n❌ ${failedTests} test(s) échoué(s)`);
    process.exit(1);
  } else {
    console.log(`\n✅ TOUS LES TESTS SONT PASSÉS ! 🎉`);
    process.exit(0);
  }
}

// Exécution
main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
