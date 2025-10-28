#!/bin/bash

# Script pour générer toutes les icônes PWA à partir du logo
# Utilise ImageMagick (convert) ou sharp si disponible

LOGO="/home/celia/laia-github-temp/laia-skin-nextjs/public/logo-laia-skin.png"
ICONS_DIR="/home/celia/laia-github-temp/laia-skin-nextjs/public/icons"

# Créer le dossier icons s'il n'existe pas
mkdir -p "$ICONS_DIR"

echo "🎨 Génération des icônes PWA..."

# Vérifier si convert (ImageMagick) est disponible
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick détecté"

    # Générer toutes les tailles d'icônes
    for size in 72 96 128 144 152 192 384 512; do
        echo "📐 Génération icône ${size}x${size}..."
        convert "$LOGO" -resize ${size}x${size} -background white -gravity center -extent ${size}x${size} "$ICONS_DIR/icon-${size}x${size}.png"
    done

    # Générer les icônes maskable (avec padding pour le safe zone)
    for size in 192 512; do
        echo "📐 Génération icône maskable ${size}x${size}..."
        convert "$LOGO" -resize $((size * 80 / 100))x$((size * 80 / 100)) -background "#d4b5a0" -gravity center -extent ${size}x${size} "$ICONS_DIR/icon-${size}x${size}-maskable.png"
    done

    # Apple Touch Icon
    echo "📐 Génération Apple Touch Icon..."
    convert "$LOGO" -resize 180x180 -background white -gravity center -extent 180x180 "/home/celia/laia-github-temp/laia-skin-nextjs/public/apple-touch-icon.png"

    # Favicon
    echo "📐 Génération Favicon..."
    convert "$LOGO" -resize 32x32 "/home/celia/laia-github-temp/laia-skin-nextjs/public/favicon-32x32.png"
    convert "$LOGO" -resize 16x16 "/home/celia/laia-github-temp/laia-skin-nextjs/public/favicon-16x16.png"
    convert "$LOGO" -resize 32x32 "/home/celia/laia-github-temp/laia-skin-nextjs/public/favicon.ico"

    echo "✅ Toutes les icônes ont été générées avec succès!"

else
    echo "❌ ImageMagick (convert) n'est pas installé."
    echo "💡 Installation: sudo apt install imagemagick"
    echo ""
    echo "📝 Alternative: Je vais créer des icônes simples avec des couleurs unies"

    # Créer des icônes simples en attendant
    for size in 72 96 128 144 152 192 384 512; do
        echo "📐 Création icône simple ${size}x${size}..."
        # Copier simplement le logo redimensionné (si possible)
        cp "$LOGO" "$ICONS_DIR/icon-${size}x${size}.png" 2>/dev/null || echo "⚠️  Copie manuelle nécessaire pour ${size}x${size}"
    done
fi

echo ""
echo "📁 Icônes générées dans: $ICONS_DIR"
ls -lh "$ICONS_DIR"
