// Script pour créer un lead de test qui simule un client qui a payé
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestLead() {
  try {
    const testLead = await prisma.lead.create({
      data: {
        institutName: 'Beauté Zen Paris',
        contactName: 'Sophie Martin',
        contactEmail: 'sophie.martin@beaute-zen.fr',
        contactPhone: '06 12 34 56 78',
        city: 'Paris',
        address: '15 Rue de la Paix',
        postalCode: '75002',
        status: 'QUALIFIED', // Client qui a payé
        source: 'WEBSITE',
        score: 90,
        probability: 80,
        notes: `Paiement confirmé - Montant: 89€ - Plan DUO

Date de paiement: ${new Date().toLocaleString('fr-FR')}
Session Stripe: sim_ch_test_123456789

🔔 NOUVEAU CLIENT - À configurer dans les 24h

Informations de paiement:
- Plan: DUO
- Montant: 89€
- Paiement confirmé: Oui
- Needs onboarding: Oui`,
        tags: ['PAIEMENT_CONFIRMÉ', 'NOUVEAU', 'DUO']
      }
    });

    console.log('\n✅ Lead de test créé avec succès !');
    console.log('\n📋 Détails du lead :');
    console.log('ID:', testLead.id);
    console.log('Institut:', testLead.institutName);
    console.log('Contact:', testLead.contactName);
    console.log('Email:', testLead.contactEmail);
    console.log('Status:', testLead.status);
    console.log('Score:', testLead.score);
    console.log('\n💡 Tu peux maintenant voir ce lead dans le CRM à l\'adresse:');
    console.log('http://localhost:3001/super-admin/crm');
    console.log('\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création du lead:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestLead();
