#!/bin/bash

# Script de migration SQLite vers PostgreSQL
echo "🚀 Migration vers PostgreSQL"
echo "============================"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
    echo "Créez d'abord .env.local avec votre DATABASE_URL PostgreSQL"
    exit 1
fi

# Vérifier si DATABASE_URL contient postgresql
if ! grep -q "postgresql://" .env.local; then
    echo -e "${YELLOW}⚠️  DATABASE_URL ne semble pas pointer vers PostgreSQL${NC}"
    echo "Assurez-vous d'avoir configuré DATABASE_URL avec votre URL Supabase"
    read -p "Continuer quand même ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Configuration trouvée${NC}"

# Backup du schema SQLite
echo -e "\n${YELLOW}📦 Sauvegarde du schema SQLite...${NC}"
cp prisma/schema.prisma prisma/schema.sqlite.backup.prisma
echo -e "${GREEN}✓ Backup créé : prisma/schema.sqlite.backup.prisma${NC}"

# Activer le schema PostgreSQL
echo -e "\n${YELLOW}🔄 Activation du schema PostgreSQL...${NC}"
cp prisma/schema.postgresql.prisma prisma/schema.prisma
echo -e "${GREEN}✓ Schema PostgreSQL activé${NC}"

# Générer le client Prisma
echo -e "\n${YELLOW}🔨 Génération du client Prisma...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Client Prisma généré${NC}"

# Pousser le schema vers la base de données
echo -e "\n${YELLOW}📤 Création des tables dans PostgreSQL...${NC}"
npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Tables créées avec succès !${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création des tables${NC}"
    echo "Vérifiez votre DATABASE_URL et réessayez"
    exit 1
fi

# Demander si on veut seed les données
echo -e "\n${YELLOW}Voulez-vous ajouter des données de test ?${NC}"
read -p "Seed la base de données ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🌱 Ajout des données de test...${NC}"
    npm run seed
    echo -e "${GREEN}✓ Données de test ajoutées${NC}"
fi

echo -e "\n${GREEN}🎉 Migration terminée avec succès !${NC}"
echo -e "\nProchaines étapes :"
echo "1. Testez localement avec : npm run dev"
echo "2. Ajoutez DATABASE_URL dans Vercel Settings > Environment Variables"
echo "3. Redéployez sur Vercel"

echo -e "\n${YELLOW}💡 Commandes utiles :${NC}"
echo "  npx prisma studio     # Visualiser les données"
echo "  npx prisma db pull    # Vérifier la connexion"
echo "  npm run seed          # Ajouter des données de test"