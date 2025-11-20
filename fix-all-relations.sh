#!/bin/bash

echo "=== CORRECTION AUTOMATIQUE DE TOUTES LES RELATIONS PRISMA ==="
echo ""
echo "Cela va corriger automatiquement :"
echo "  - organization → Organization"
echo "  - user → User"
echo "  - config → OrganizationConfig"
echo ""

# Sauvegarder les fichiers
echo "📦 Création d'une sauvegarde..."
cp -r src src.backup.$(date +%Y%m%d_%H%M%S)

echo "🔧 Correction des relations dans tous les fichiers..."

# Corriger les includes et relations
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/include: { organization:/include: { Organization:/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/include: { user:/include: { User:/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/include: { config:/include: { OrganizationConfig:/g' {} \;

# Corriger les accès aux propriétés
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.organization\?\./.Organization?./g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.organization\./.Organization./g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.organization,/.Organization,/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.organization)/.Organization)/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.organization }/.Organization }/g' {} \;

find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.user\?\./.User?./g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.user\./.User./g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.user,/.User,/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.user)/.User)/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/\.user }/.User }/g' {} \;

# Cas spéciaux pour les variables
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/user\.organization/user.Organization/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/review\.user/review.User/g' {} \;
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/reservation\.user/reservation.User/g' {} \;

echo "✅ Corrections terminées !"
echo ""
echo "📊 Résumé des changements :"
echo "  - $(grep -r "\.Organization" src --include="*.ts" --include="*.tsx" | wc -l) références à .Organization"
echo "  - $(grep -r "\.User" src --include="*.ts" --include="*.tsx" | wc -l) références à .User"
echo "  - $(grep -r "OrganizationConfig" src --include="*.ts" --include="*.tsx" | wc -l) références à OrganizationConfig"
echo ""
echo "💾 Sauvegarde créée dans src.backup.*"
