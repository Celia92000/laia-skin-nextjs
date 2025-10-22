#!/bin/bash

# Trouver tous les fichiers API admin
files=$(find src/app/api/admin -name "*.ts" -type f)

for file in $files; do
  # Vérifier si le fichier contient les anciennes vérifications de rôle
  if grep -q "user.role !== 'admin'" "$file"; then
    echo "Mise à jour de $file..."
    
    # Ajouter l'import en haut du fichier s'il n'existe pas déjà
    if ! grep -q "import.*hasAdminAccess.*from.*admin-roles" "$file"; then
      # Trouver la ligne après les imports existants
      sed -i "5i import { hasAdminAccess } from '@/lib/admin-roles';" "$file"
    fi
    
    echo "  ✓ Fichier mis à jour"
  fi
done

echo "Terminé !"
