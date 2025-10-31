const fs = require('fs');
const path = require('path');

/**
 * Import des clients depuis le CSV
 *
 * @param {string} organizationId - ID de l'organization
 * @param {PrismaClient} prisma - Instance Prisma
 * @returns {Promise<{imported: number, errors: number}>}
 */
async function importClients(organizationId, prisma) {
  const csvPath = path.join(__dirname, '../templates/1-clients.csv');

  if (!fs.existsSync(csvPath)) {
    console.log('⚠️  Fichier clients.csv non trouvé');
    return { imported: 0, errors: 0 };
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  let imported = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const client = {};

    headers.forEach((header, index) => {
      client[header.trim()] = values[index]?.trim() || null;
    });

    try {
      // Vérifier si le client existe déjà
      const existing = await prisma.user.findUnique({
        where: {
          organizationId_email: {
            organizationId: organizationId,
            email: client.email
          }
        }
      });

      if (existing) {
        console.log(`  ⚠️  Client déjà existant : ${client.email}`);
        continue;
      }

      // Créer le client
      await prisma.user.create({
        data: {
          name: client.name,
          email: client.email,
          phone: client.phone || null,
          birthDate: client.birthDate ? new Date(client.birthDate) : null,
          allergies: client.allergies || null,
          skinType: client.skinType || null,
          medicalNotes: client.medicalNotes || null,
          preferences: client.preferences || null,
          adminNotes: [
            client.notes,
            client.address ? `Adresse: ${client.address}, ${client.postalCode} ${client.city}` : null
          ].filter(Boolean).join('\n'),
          role: 'CLIENT',
          organization: {
            connect: { id: organizationId }
          },
          password: 'temp_password_123' // Le client devra réinitialiser
        }
      });

      console.log(`  ✅ ${client.name}`);
      imported++;

    } catch (error) {
      console.error(`  ❌ Erreur pour ${client.email}:`, error.message);
      errors++;
    }
  }

  return { imported, errors };
}

module.exports = importClients;
