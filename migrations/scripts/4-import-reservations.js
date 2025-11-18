const fs = require('fs');
const path = require('path');

async function importReservations(organizationId, prisma) {
  console.log('  ⚠️  Import des réservations - À implémenter selon votre modèle de données');
  return { imported: 0, errors: 0 };

  // TODO: Implémenter selon votre structure de réservations
  // Nécessite de trouver les clients, services et employés par leurs emails/noms
}

module.exports = importReservations;
