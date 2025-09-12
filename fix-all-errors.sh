#!/bin/bash

echo "🔧 Correction de toutes les erreurs TypeScript..."

# Corriger client -> user dans les includes Prisma
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/include: {[[:space:]]*client:/include: { user:/g' {} \;

# Corriger les références prisma.client -> prisma.user
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/prisma\.client/prisma.user/g' {} \;

echo "✅ Corrections appliquées"