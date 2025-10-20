const { generateAndSaveInvoice } = require('./src/lib/invoice-service.ts');

const organizationId = 'cmgyi476b0000bla76887z7d6';
const amount = 99; // Plan DUO
const plan = 'DUO';

console.log('🔄 Génération de la facture...\n');

generateAndSaveInvoice(organizationId, amount, plan, 'test_payment_123')
  .then((result) => {
    console.log('✅ Facture générée avec succès!\n');
    console.log('Numéro:', result.invoiceNumber);
    console.log('Fichier:', result.pdfPath);
    console.log('URL:', result.pdfUrl);
    console.log('\n📄 Tu peux télécharger la facture ici:');
    console.log('http://localhost:3001' + result.pdfPath);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
