const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Organization ID de "Célia IVORRA TEST"
const ORGANIZATION_ID = 'cmgyi476b0000bla76887z7d6';

async function importClients() {
  try {
    console.log('📥 Début de l\'import de MES clients...\n');

    // Lire le fichier CSV
    const csvPath = path.join(__dirname, 'mes-clients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    // Parser le CSV (simple parsing)
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    let imported = 0;
    let errors = 0;

    // Parcourir chaque ligne (sauf l'en-tête)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Ignorer les lignes vides

      const values = line.split(',');
      const client = {};

      // Mapper les colonnes
      headers.forEach((header, index) => {
        client[header.trim()] = values[index]?.trim() || null;
      });

      try {
        // Vérifier si l'email existe déjà pour cette organisation
        const existingUser = await prisma.user.findUnique({
          where: {
            organizationId_email: {
              organizationId: ORGANIZATION_ID,
              email: client.email
            }
          }
        });

        if (existingUser) {
          console.log(`⚠️  Client déjà existant : ${client.email}`);
          continue;
        }

        // Créer le client
        const newClient = await prisma.user.create({
          data: {
            name: client.name,
            email: client.email,
            phone: client.phone || null,
            birthDate: client.birthDate ? new Date(client.birthDate) : null,
            adminNotes: `${client.notes || ''}${client.address ? `\nAdresse: ${client.address}, ${client.postalCode} ${client.city}` : ''}`,
            role: 'CLIENT',
            organization: {
              connect: { id: ORGANIZATION_ID }
            },
            password: 'temp_password_123' // ⚠️ Le client devra réinitialiser son mot de passe
          }
        });

        console.log(`✅ Client importé : ${newClient.name} (${newClient.email})`);
        imported++;

      } catch (error) {
        console.error(`❌ Erreur pour ${client.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Résumé de l\'import :');
    console.log(`   ✅ Clients importés : ${imported}`);
    console.log(`   ❌ Erreurs : ${errors}`);

  } catch (error) {
    console.error('❌ Erreur fatale :', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Lancer l'import
importClients();
