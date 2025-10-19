/**
 * Script pour initialiser ou mettre à jour la configuration du site
 * Usage: npx tsx scripts/init-site-config.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Initialisation de la configuration du site...\n');

  // Vérifier si une config existe déjà
  const existingConfig = await prisma.siteConfig.findFirst();

  if (existingConfig) {
    console.log('⚠️  Une configuration existe déjà!');
    console.log(`   Nom actuel: ${existingConfig.siteName}`);
    console.log('   Utilisez ce script pour la mettre à jour\n');

    // Demander confirmation (en production, utiliser un vrai prompt)
    const shouldUpdate = true; // TODO: ajouter un prompt interactif

    if (shouldUpdate) {
      await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: {
          // Données spécifiques à Laia Skin (pour l'instant)
          siteName: 'LAIA SKIN Institut',
          siteTagline: 'Institut de Beauté & Bien-être',
          email: 'contact@laiaskininstitut.fr',
          phone: '+33 6 XX XX XX XX',

          // Informations légales
          legalName: 'LAIA SKIN SARL',
          siret: '123 456 789 00012',
          siren: '123 456 789',
          tvaNumber: 'FR 12 123456789',
          apeCode: '9602B',
          rcs: 'Paris 123 456 789',
          capital: '10 000 €',
          legalForm: 'SARL',

          // Assurance
          insuranceCompany: 'AXA France',
          insuranceContract: '1234567',

          // Représentant légal
          legalRepName: 'Laïa [Nom]',
          legalRepTitle: 'Gérante',

          // Couleurs
          primaryColor: '#d4b5a0',
          secondaryColor: '#2c3e50',
          accentColor: '#20b2aa',

          // Polices
          fontFamily: 'Inter',
          headingFont: 'Playfair Display',
          baseFontSize: '16px',
          headingSize: '2.5rem',
        }
      });
      console.log('✅ Configuration mise à jour avec succès!\n');
    }
  } else {
    // Créer une nouvelle configuration
    await prisma.siteConfig.create({
      data: {
        siteName: 'LAIA SKIN Institut',
        siteTagline: 'Institut de Beauté & Bien-être',
        email: 'contact@laiaskininstitut.fr',
        phone: '+33 6 XX XX XX XX',

        legalName: 'LAIA SKIN SARL',
        siret: '123 456 789 00012',
        siren: '123 456 789',
        tvaNumber: 'FR 12 123456789',
        apeCode: '9602B',
        rcs: 'Paris 123 456 789',
        capital: '10 000 €',
        legalForm: 'SARL',

        insuranceCompany: 'AXA France',
        insuranceContract: '1234567',

        legalRepName: 'Laïa [Nom]',
        legalRepTitle: 'Gérante',

        primaryColor: '#d4b5a0',
        secondaryColor: '#2c3e50',
        accentColor: '#20b2aa',

        fontFamily: 'Inter',
        headingFont: 'Playfair Display',
        baseFontSize: '16px',
        headingSize: '2.5rem',
      }
    });
    console.log('✅ Configuration créée avec succès!\n');
  }

  const config = await prisma.siteConfig.findFirst();
  console.log('📋 Configuration actuelle:');
  console.log(`   Nom: ${config?.siteName}`);
  console.log(`   Email: ${config?.email}`);
  console.log(`   Téléphone: ${config?.phone}`);
  console.log(`   Raison sociale: ${config?.legalName}`);
  console.log(`   SIRET: ${config?.siret}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
