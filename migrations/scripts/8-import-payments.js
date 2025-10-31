const fs = require('fs');
const path = require('path');

async function importPayments(organizationId, prisma) {
  console.log('  ⚠️  Import de l\'historique des paiements - À implémenter');
  return { imported: 0, errors: 0 };

  // TODO: Créer l'historique des paiements
}

module.exports = importPayments;
