# 📱 Système WhatsApp Business - LAIA SKIN Institut

## ✅ Configuration Complète

### 🔧 API WhatsApp Business (Meta)
- **Phone Number ID**: 672520675954185
- **Numéro**: +33 6 83 71 70 50
- **Version API**: v18.0
- **Status**: ✅ FONCTIONNEL

## 📨 Messages Automatiques Configurés

### 1. **Confirmation de Réservation** (EMAIL)
- **Déclencheur**: Nouvelle réservation client
- **Canal**: Email uniquement
- **Contenu**: Détails du RDV, adresse, contact

### 2. **Rappel 24h Avant** (WHATSAPP) 
- **Déclencheur**: CRON job quotidien à 18h
- **Canal**: WhatsApp uniquement
- **Contenu**: Rappel du RDV du lendemain
- **API**: `/api/cron/send-whatsapp-reminders`

### 3. **Demande d'Avis** (EMAIL + WHATSAPP)
- **Déclencheur**: 3 jours après le soin (CRON à 10h)
- **Canaux**: Email ET WhatsApp
- **Contenu**: Demande d'avis + programme fidélité
- **APIs**: 
  - `/api/cron/send-review-requests` (Email)
  - `/api/cron/send-whatsapp-reviews` (WhatsApp)

### 4. **Message d'Anniversaire** (EMAIL + WHATSAPP)
- **Déclencheur**: CRON job quotidien à 9h
- **Canaux**: Email ET WhatsApp
- **Contenu**: Vœux + Code promo -30%
- **API**: `/api/cron/send-birthday-emails`

## 📅 Planification CRON (Vercel)

```json
{
  "crons": [
    {
      "path": "/api/cron/send-birthday-emails",
      "schedule": "0 9 * * *"  // 9h00 - Anniversaires
    },
    {
      "path": "/api/cron/send-review-requests",
      "schedule": "0 10 * * *"  // 10h00 - Avis Email
    },
    {
      "path": "/api/cron/send-whatsapp-reviews",
      "schedule": "0 10 * * *"  // 10h00 - Avis WhatsApp
    },
    {
      "path": "/api/cron/send-whatsapp-reminders",
      "schedule": "0 18 * * *"  // 18h00 - Rappels demain
    }
  ]
}
```

## 🔐 Variables d'Environnement Requises

```env
# WhatsApp Business
WHATSAPP_ACCESS_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxx
WHATSAPP_API_VERSION=v18.0

# CRON Security
CRON_SECRET=laia_skin_cron_secret_2025
```

## 🧪 Tests Disponibles

```bash
# Test direct WhatsApp
npx tsx test-whatsapp-direct.ts

# Test messages anniversaire
npx tsx test-birthday-whatsapp.ts

# Test CRON jobs
npx tsx test-cron-whatsapp.ts
```

## 📊 Base de Données

Nouveaux champs ajoutés dans `Reservation`:
- `reminderSent`: Track rappel WhatsApp envoyé
- `reviewEmailSent`: Track email avis envoyé  
- `reviewWhatsAppSent`: Track WhatsApp avis envoyé

## 🚀 Déploiement

1. Les CRON jobs s'activeront automatiquement sur Vercel
2. Vérifier les logs Vercel pour suivre les envois
3. Les messages sont envoyés automatiquement selon le planning

## 📈 Programme de Fidélité Intégré

- Mentionné dans les demandes d'avis
- 5 soins individuels = -30€
- 3 forfaits = -30€
- Progression affichée dans les messages