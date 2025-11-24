#!/bin/bash
# Script pour push le schéma Prisma avec les nouveaux champs de parrainage

cd /home/celia/laia-github-temp/laia-skin-nextjs

echo "🔄 Synchronisation du schéma Prisma avec la base de données..."
echo "   Ajout des colonnes de configuration parrainage..."

DIRECT_URL="$DATABASE_URL" npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
  echo "✅ Colonnes de parrainage ajoutées avec succès !"
else
  echo "❌ Erreur lors de l'ajout des colonnes"
  exit 1
fi
