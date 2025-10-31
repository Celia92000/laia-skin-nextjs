#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE MIGRATION COMPLET
 *
 * Ce script importe toutes les données d'un institut dans l'ordre correct.
 *
 * USAGE:
 *   node migrations/scripts/import-all.js <organizationId>
 *
 * EXEMPLE:
 *   node migrations/scripts/import-all.js cmgyi476b0000bla76887z7d6
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Récupérer l'organizationId depuis les arguments
const ORGANIZATION_ID = process.argv[2];

if (!ORGANIZATION_ID) {
  console.error('❌ Erreur : Vous devez fournir un organizationId');
  console.log('Usage: node migrations/scripts/import-all.js <organizationId>');
  process.exit(1);
}

// Ordre d'import (important : respecter les dépendances)
const IMPORT_ORDER = [
  { name: '1-clients', label: 'Clients', script: './1-import-clients.js' },
  { name: '2-services', label: 'Services', script: './2-import-services.js' },
  { name: '3-employees', label: 'Employés', script: './3-import-employees.js' },
  { name: '4-reservations', label: 'Réservations', script: './4-import-reservations.js' },
  { name: '5-gift-cards', label: 'Cartes cadeaux', script: './5-import-gift-cards.js' },
  { name: '6-products', label: 'Produits', script: './6-import-products.js' },
  { name: '7-loyalty-points', label: 'Points de fidélité', script: './7-import-loyalty.js' },
  { name: '8-payments', label: 'Historique paiements', script: './8-import-payments.js' }
];

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🚀 MIGRATION COMPLÈTE DES DONNÉES      ║');
  console.log('╚════════════════════════════════════════════╝\n');

  console.log(`📋 Organization ID: ${ORGANIZATION_ID}\n`);

  // Vérifier que l'organization existe
  const org = await prisma.organization.findUnique({
    where: { id: ORGANIZATION_ID },
    select: { id: true, name: true }
  });

  if (!org) {
    console.error(`❌ Organisation introuvable : ${ORGANIZATION_ID}`);
    process.exit(1);
  }

  console.log(`✅ Organisation trouvée : ${org.name}\n`);
  console.log('─'.repeat(50) + '\n');

  const startTime = Date.now();
  const results = [];

  for (const step of IMPORT_ORDER) {
    console.log(`\n📦 Import ${step.label}...`);
    console.log('─'.repeat(50));

    const scriptPath = path.join(__dirname, step.script);

    if (!fs.existsSync(scriptPath)) {
      console.log(`⚠️  Script non trouvé, ignoré: ${step.script}`);
      results.push({ step: step.label, status: 'skipped', count: 0 });
      continue;
    }

    try {
      // Exécuter le script d'import
      const importFn = require(scriptPath);
      const result = await importFn(ORGANIZATION_ID, prisma);

      results.push({
        step: step.label,
        status: 'success',
        count: result.imported || 0,
        errors: result.errors || 0
      });

      console.log(`✅ ${step.label} : ${result.imported || 0} importés, ${result.errors || 0} erreurs`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'import ${step.label}:`, error.message);
      results.push({ step: step.label, status: 'error', error: error.message });
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Résumé final
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║          📊 RÉSUMÉ DE LA MIGRATION         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  results.forEach(r => {
    const icon = r.status === 'success' ? '✅' : r.status === 'error' ? '❌' : '⚠️ ';
    const count = r.count !== undefined ? ` (${r.count} éléments)` : '';
    console.log(`${icon} ${r.step}${count}`);
  });

  console.log(`\n⏱️  Durée totale : ${duration}s`);
  console.log('\n✨ Migration terminée !\n');

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  prisma.$disconnect();
  process.exit(1);
});
