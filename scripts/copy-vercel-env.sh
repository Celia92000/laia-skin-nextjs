#!/bin/bash

# 🔐 Script pour copier les variables d'environnement entre projets Vercel
# Usage: ./scripts/copy-vercel-env.sh

echo "🔐 Copie des variables d'environnement Vercel"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI n'est pas installé${NC}"
    echo ""
    echo "Installer avec:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi

echo -e "${BLUE}📋 Liste de tes projets Vercel :${NC}"
echo ""
vercel ls
echo ""

# Demander le projet source
echo -e "${YELLOW}📥 Quel est le projet SOURCE (celui qui a déjà les variables) ?${NC}"
echo "Exemple: laia-skin-institut-as92"
read -p "Nom du projet source: " SOURCE_PROJECT

# Demander le projet destination
echo ""
echo -e "${YELLOW}📤 Quel est le projet DESTINATION (celui où copier les variables) ?${NC}"
echo "Exemple: laia-skin-institut-demo"
read -p "Nom du projet destination: " DEST_PROJECT

echo ""
echo -e "${BLUE}🔍 Variables du projet source :${NC}"
echo ""

# Récupérer les variables du projet source
vercel env ls --project="$SOURCE_PROJECT"

echo ""
echo -e "${YELLOW}⚠️  ATTENTION :${NC}"
echo "Les variables suivantes seront DIFFÉRENTES pour les 2 projets :"
echo "  - NEXT_PUBLIC_SITE_TYPE"
echo "  - NEXT_PUBLIC_APP_URL"
echo "  - NEXT_PUBLIC_TENANT_DOMAIN"
echo ""
echo "Toutes les autres variables seront IDENTIQUES."
echo ""
read -p "Continuer ? (o/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "Annulé."
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Commandes à exécuter manuellement :${NC}"
echo ""
echo "# 1. Récupérer les variables du projet source"
echo "vercel env pull .env.source --project=\"$SOURCE_PROJECT\""
echo ""
echo "# 2. Copier manuellement les variables dans Vercel Dashboard"
echo "# Aller sur : https://vercel.com"
echo "# Projet : $DEST_PROJECT → Settings → Environment Variables"
echo ""
echo "# 3. Ajouter ces variables DIFFÉRENTES pour le nouveau projet :"
echo ""
echo "Si projet = SaaS (laiaconnect.fr) :"
echo "  NEXT_PUBLIC_SITE_TYPE=saas"
echo "  NEXT_PUBLIC_APP_URL=https://www.laiaconnect.fr"
echo "  NEXT_PUBLIC_TENANT_DOMAIN=laiaconnect.fr"
echo ""
echo "Si projet = Institut (laiaskininstitut.fr) :"
echo "  NEXT_PUBLIC_SITE_TYPE=institut"
echo "  NEXT_PUBLIC_APP_URL=https://laiaskininstitut.fr"
echo "  NEXT_PUBLIC_TENANT_DOMAIN=laiaskininstitut.fr"
echo ""
echo -e "${BLUE}📚 Plus d'infos : voir VARIABLES_VERCEL.md${NC}"
echo ""

# Afficher la liste complète des variables à copier
echo -e "${GREEN}📋 Variables COMMUNES à copier (mêmes valeurs pour les 2 projets) :${NC}"
echo ""
cat << 'EOF'
✅ DATABASE_URL
✅ DIRECT_URL
✅ JWT_SECRET
✅ ENCRYPTION_KEY
✅ RESEND_API_KEY
✅ RESEND_WEBHOOK_SECRET
✅ BREVO_API_KEY
✅ EMAIL_FROM
✅ EMAIL_PROVIDER
✅ WHATSAPP_PROVIDER
✅ WHATSAPP_ACCESS_TOKEN
✅ WHATSAPP_PHONE_NUMBER_ID
✅ WHATSAPP_BUSINESS_ACCOUNT_ID
✅ WHATSAPP_API_VERSION
✅ WHATSAPP_WEBHOOK_VERIFY_TOKEN
✅ NEXT_PUBLIC_WHATSAPP_NUMBER
✅ TWILIO_ACCOUNT_SID
✅ TWILIO_AUTH_TOKEN
✅ TWILIO_WHATSAPP_FROM
✅ STRIPE_SECRET_KEY
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ STRIPE_WEBHOOK_SECRET
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ CRON_SECRET

Optionnelles :
⚪ META_APP_ID
⚪ META_APP_SECRET
⚪ FACEBOOK_PAGE_ACCESS_TOKEN
⚪ FACEBOOK_PAGE_ID
⚪ INSTAGRAM_ACCESS_TOKEN
⚪ INSTAGRAM_ACCOUNT_ID
⚪ CLOUDINARY_CLOUD_NAME
⚪ CLOUDINARY_API_KEY
⚪ CLOUDINARY_API_SECRET
EOF

echo ""
echo -e "${GREEN}✨ Fini !${NC}"
