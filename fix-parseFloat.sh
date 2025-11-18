#!/bin/bash

# Fichier à corriger
FILE="/home/celia/laia-github-temp/laia-skin-nextjs/src/app/api/admin/statistics/route.ts"

# Remplacer tous les parseFloat qui peuvent recevoir un number
sed -i 's/satisfactionScore: parseFloat(averageRating)/satisfactionScore: typeof averageRating === "number" ? averageRating : parseFloat(averageRating)/g' "$FILE"
sed -i 's/rate: parseFloat(retentionRate)/rate: typeof retentionRate === "number" ? retentionRate : parseFloat(retentionRate)/g' "$FILE"

echo "✅ Corrections appliquées"