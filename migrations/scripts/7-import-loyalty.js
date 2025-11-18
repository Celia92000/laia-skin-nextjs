const fs = require('fs');
const path = require('path');

async function importLoyalty(organizationId, prisma) {
  console.log('  ⚠️  Import des points de fidélité - À implémenter');
  return { imported: 0, errors: 0 };

  // TODO: Mettre à jour les points de fidélité des clients
}

module.exports = importLoyalty;
