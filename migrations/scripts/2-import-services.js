const fs = require('fs');
const path = require('path');

async function importServices(organizationId, prisma) {
  const csvPath = path.join(__dirname, '../templates/2-services.csv');
  if (!fs.existsSync(csvPath)) return { imported: 0, errors: 0 };

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  let imported = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const service = {};
    headers.forEach((header, index) => {
      service[header.trim()] = values[index]?.trim() || null;
    });

    try {
      await prisma.service.create({
        data: {
          name: service.name,
          description: service.description || '',
          duration: parseInt(service.duration) || 60,
          price: parseFloat(service.price) || 0,
          category: service.category || 'Général',
          isActive: service.isActive === 'true',
          organization: {
            connect: { id: organizationId }
          }
        }
      });

      console.log(`  ✅ ${service.name}`);
      imported++;
    } catch (error) {
      console.error(`  ❌ Erreur pour ${service.name}:`, error.message);
      errors++;
    }
  }

  return { imported, errors };
}

module.exports = importServices;
