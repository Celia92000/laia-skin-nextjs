#!/bin/bash

# Remplacer toutes les vérifications de rôles par hasAdminAccess
find src/app/api/admin -name "*.ts" -type f -exec sed -i \
  -e "s/if (!user || (user\.role !== 'admin' && user\.role !== 'ADMIN' && user\.role !== 'EMPLOYEE') && user\.role !== 'ADMIN' && user\.role !== 'EMPLOYEE')/if (!hasAdminAccess(user))/g" \
  -e "s/if (!user || (user\.role !== 'admin' && user\.role !== 'ADMIN' && user\.role !== 'EMPLOYEE'))/if (!hasAdminAccess(user))/g" \
  -e "s/if (!user || (user\.role !== 'admin' && user\.role !== 'ADMIN'))/if (!hasAdminAccess(user))/g" \
  -e "s/if (user && user\.role !== 'admin' && user\.role !== 'ADMIN' && user\.role !== 'EMPLOYEE')/if (!hasAdminAccess(user))/g" \
  {} \;

echo "Remplacement terminé !"
