#!/usr/bin/env node

/**
 * Script de test de génération de facture avec les nouveaux paramètres
 */

require('dotenv').config({ path: '.env.local' });

async function testInvoiceGeneration() {
  try {
    console.log('🔧 Test de génération de facture avec paramètres personnalisés\n');

    const organizationId = 'cmgyi476b0000bla76887z7d6'; // Célia IVORRA TEST

    // Étape 1: Vérifier les paramètres actuels
    console.log('1️⃣ Récupération des paramètres de facturation...');
    const settingsRes = await fetch('http://localhost:3001/api/super-admin/invoice-settings');

    if (!settingsRes.ok) {
      console.error('❌ Erreur récupération paramètres:', settingsRes.status, settingsRes.statusText);
      const text = await settingsRes.text();
      console.error('Réponse:', text);
      return;
    }

    const settings = await settingsRes.json();
    console.log('✅ Paramètres récupérés:');
    console.log('   - Entreprise:', settings.companyName);
    console.log('   - Couleur principale:', settings.primaryColor);
    console.log('   - Taux TVA:', settings.tvaRate + '%');
    console.log('   - Préfixe factures:', settings.invoicePrefix);

    // Étape 2: Générer une facture
    console.log('\n2️⃣ Génération d\'une nouvelle facture...');
    const invoiceRes = await fetch(`http://localhost:3001/api/test/generate-invoice?organizationId=${organizationId}`);

    if (!invoiceRes.ok) {
      console.error('❌ Erreur génération facture:', invoiceRes.status, invoiceRes.statusText);
      const text = await invoiceRes.text();
      console.error('Réponse:', text);
      return;
    }

    const invoice = await invoiceRes.json();
    console.log('✅ Facture générée:');
    console.log('   - Numéro:', invoice.invoice.invoiceNumber);
    console.log('   - PDF:', invoice.invoice.pdfPath);
    console.log('   - URL:', invoice.invoice.pdfUrl);

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n💡 La facture a utilisé les paramètres actuels de la base de données.');
    console.log('   Vous pouvez modifier les paramètres sur: http://localhost:3001/super-admin/invoice-settings');
    console.log('   Puis relancer ce script pour voir les changements appliqués.');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

testInvoiceGeneration();
