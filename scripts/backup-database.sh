#!/bin/bash

###############################################################################
# SCRIPT DE BACKUP BASE DE DONNÉES LAIA CONNECT
#
# Ce script crée un backup complet de la base de données PostgreSQL
# Utilisation: ./scripts/backup-database.sh
###############################################################################

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}🗄️  BACKUP BASE DE DONNÉES LAIA CONNECT${NC}"
echo -e "${GREEN}==================================================${NC}\n"

# Charger les variables d'environnement
if [ -f .env.local ]; then
    source .env.local
else
    echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
    exit 1
fi

# Vérifier que DIRECT_URL existe
if [ -z "$DIRECT_URL" ]; then
    echo -e "${RED}❌ Variable DIRECT_URL non définie dans .env.local${NC}"
    exit 1
fi

# Créer le dossier backups s'il n'existe pas
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Nom du fichier de backup avec timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/laia_connect_backup_$TIMESTAMP.sql"

echo -e "${YELLOW}📦 Création du backup...${NC}"
echo -e "   Destination: $BACKUP_FILE\n"

# Extraire les informations de connexion depuis DIRECT_URL
# Format: postgresql://user:pass@host:port/database

# Méthode simple: utiliser pg_dump directement avec l'URL
export DATABASE_URL="$DIRECT_URL"

# Vérifier si pg_dump est installé
if ! command -v pg_dump &> /dev/null; then
    echo -e "${YELLOW}⚠️  pg_dump n'est pas installé localement${NC}"
    echo -e "${YELLOW}   Alternative: Utiliser Supabase Dashboard → Database → Backups${NC}\n"
    echo -e "${YELLOW}📋 INFORMATIONS SUPABASE BACKUP:${NC}"
    echo -e "   1. Aller sur https://supabase.com/dashboard"
    echo -e "   2. Sélectionner votre projet"
    echo -e "   3. Database → Backups"
    echo -e "   4. Activer 'Point in Time Recovery' (PITR)"
    echo -e "   5. Les backups quotidiens sont automatiques\n"
    echo -e "${GREEN}✅ Supabase fait des backups automatiques quotidiens${NC}"
    echo -e "${GREEN}✅ Conservation: 7 jours (gratuit), 30 jours (Pro)${NC}"
    exit 0
fi

# Créer le backup avec pg_dump
if pg_dump "$DIRECT_URL" > "$BACKUP_FILE" 2>&1; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup créé avec succès !${NC}"
    echo -e "   Fichier: $BACKUP_FILE"
    echo -e "   Taille: $BACKUP_SIZE\n"

    # Compter le nombre de backups
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
    echo -e "${GREEN}📊 Total de backups: $BACKUP_COUNT${NC}\n"

    # Suggestion de nettoyage si trop de backups
    if [ "$BACKUP_COUNT" -gt 30 ]; then
        echo -e "${YELLOW}⚠️  Plus de 30 backups détectés${NC}"
        echo -e "${YELLOW}   Conseil: Supprimer les anciens backups${NC}"
        echo -e "${YELLOW}   Commande: find $BACKUP_DIR -name '*.sql' -mtime +30 -delete${NC}\n"
    fi

    echo -e "${GREEN}==================================================${NC}"
    echo -e "${GREEN}🎉 BACKUP TERMINÉ${NC}"
    echo -e "${GREEN}==================================================${NC}\n"

    echo -e "${YELLOW}💡 CONSEILS:${NC}"
    echo -e "   1. Testez régulièrement la restauration"
    echo -e "   2. Stockez les backups hors du serveur (cloud)"
    echo -e "   3. Automatisez avec cron (ex: quotidien à 3h du matin)\n"

    echo -e "${YELLOW}📅 AUTOMATISATION (Cron):${NC}"
    echo -e "   Ajoutez à votre crontab:"
    echo -e "   0 3 * * * cd /path/to/project && ./scripts/backup-database.sh\n"

else
    echo -e "${RED}❌ Erreur lors de la création du backup${NC}"
    exit 1
fi
