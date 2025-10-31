const fs = require('fs');
const path = require('path');

async function importEmployees(organizationId, prisma) {
  const csvPath = path.join(__dirname, '../templates/3-employees.csv');
  if (!fs.existsSync(csvPath)) return { imported: 0, errors: 0 };

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');

  let imported = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const employee = {};
    headers.forEach((header, index) => {
      employee[header.trim()] = values[index]?.trim() || null;
    });

    try {
      // Vérifier si l'employé existe déjà
      const existing = await prisma.user.findUnique({
        where: {
          organizationId_email: {
            organizationId: organizationId,
            email: employee.email
          }
        }
      });

      if (existing) {
        console.log(`  ⚠️  Employé déjà existant : ${employee.email}`);
        continue;
      }

      await prisma.user.create({
        data: {
          name: employee.name,
          email: employee.email,
          phone: employee.phone || null,
          role: employee.role || 'STAFF',
          adminNotes: `Spécialités: ${employee.specialties || ''}\nHoraires: ${employee.schedule || ''}`,
          organization: {
            connect: { id: organizationId }
          },
          password: 'temp_password_123'
        }
      });

      console.log(`  ✅ ${employee.name}`);
      imported++;
    } catch (error) {
      console.error(`  ❌ Erreur pour ${employee.name}:`, error.message);
      errors++;
    }
  }

  return { imported, errors };
}

module.exports = importEmployees;
