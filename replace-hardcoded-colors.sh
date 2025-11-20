#!/bin/bash

# Script pour remplacer les couleurs hardcodées par des variables CSS

FILE="src/app/(site)/page.tsx"

echo "🎨 Remplacement des couleurs hardcodées dans $FILE..."

# Remplacer text-[#d4b5a0] par style avec primaryColor
sed -i 's/text-\[#d4b5a0\]/text-primary/g' "$FILE"
sed -i 's/text-\[#c9a084\]/text-secondary/g' "$FILE"
sed -i 's/text-\[#2c3e50\]/text-accent/g' "$FILE"

# Remplacer bg-[#d4b5a0] par style avec primaryColor
sed -i 's/bg-\[#d4b5a0\]/bg-primary/g' "$FILE"
sed -i 's/bg-\[#c9a084\]/bg-secondary/g' "$FILE"
sed -i 's/bg-\[#2c3e50\]/bg-accent/g' "$FILE"

# Remplacer border-[#d4b5a0] par style avec primaryColor
sed -i 's/border-\[#d4b5a0\]/border-primary/g' "$FILE"
sed -i 's/border-\[#c9a084\]/border-secondary/g' "$FILE"
sed -i 's/border-\[#2c3e50\]/border-accent/g' "$FILE"

echo "✅ Couleurs Tailwind remplacées !"
echo "Note: Les gradients et couleurs avec opacité doivent être remplacés manuellement"
