# 🕐 CRON Jobs - Tâches automatiques LAIA

Documentation des tâches planifiées automatiques de la plateforme LAIA.

## 🏢 Cron Jobs Super-Admin (Facturation & Gestion)

### 1. Génération factures mensuelles
**Endpoint**: `/api/cron/generate-monthly-invoices`
**Planification**: Le 1er de chaque mois à minuit (0 0 1 * *)
**Durée max**: 5 minutes (300s)

**Fonction**:
- Génère automatiquement les factures mensuelles pour toutes les organisations ACTIVE
- Calcul du montant selon le plan (SOLO: 49€, DUO: 99€, TEAM: 199€, PREMIUM: 399€)
- Génération du PDF avec numéro unique (LAIA-2025-001234)
- Ignore les organisations déjà facturées ce mois
- Ignore les organisations en période d'essai

### 2. Relances paiement
**Endpoint**: `/api/cron/send-payment-reminders`
**Planification**: Tous les jours à 9h (0 9 * * *)
**Durée max**: 3 minutes (180s)

**Fonction**:
- Vérifie toutes les factures impayées (PENDING, FAILED)
- **Après 7 jours**: 1ère relance par email
- **Après 14 jours**: 2ème relance avec avertissement
- **Après 21 jours**: Suspension automatique du compte

## 📅 Cron Jobs Clients (Rendez-vous & Communication)

### 3. Rappels de rendez-vous 24h
**Endpoint**: `/api/cron/reminder-emails`
**Planification**: Tous les jours à 18h
**Fonction**: Envoie des rappels 24h avant les rendez-vous

### 4. Demandes d'avis clients
**Endpoint**: `/api/cron/send-review-requests`
**Planification**: Tous les jours à 15h
**Fonction**: Envoie des demandes d'avis 3 jours après les rendez-vous

## Cron Jobs Additionnels (Déclenchement Manuel)

Ces endpoints peuvent être déclenchés manuellement ou via un service externe :

3. **Emails d'anniversaire** - `/api/cron/birthday-emails`
   - URL : `https://votre-domaine.vercel.app/api/cron/birthday-emails`
   - Recommandé : Tous les jours à 9h
   - Envoie automatiquement des emails d'anniversaire avec code promo -30%

4. **Rappels 48h** - `/api/cron/send-48h-reminders`
   - URL : `https://votre-domaine.vercel.app/api/cron/send-48h-reminders?secret=VOTRE_CRON_SECRET`
   - Recommandé : Tous les jours à 10h
   - Envoie des rappels 48h avant les rendez-vous

## Options pour les Cron Jobs Additionnels

### Option 1 : Déclenchement Manuel
Visitez simplement l'URL avec le bon secret pour déclencher l'envoi.

### Option 2 : Service Externe Gratuit
Utilisez [cron-job.org](https://cron-job.org) (gratuit) :
1. Créez un compte gratuit
2. Ajoutez une nouvelle tâche avec l'URL de votre endpoint
3. Configurez l'horaire souhaité

### Option 3 : GitHub Actions
Créez un workflow GitHub Actions dans `.github/workflows/cron.yml` :

```yaml
name: Cron Jobs
on:
  schedule:
    - cron: '0 10 * * *'  # 10h pour les rappels 48h
    - cron: '0 15 * * *'  # 15h pour les demandes d'avis
  workflow_dispatch:  # Permet le déclenchement manuel

jobs:
  trigger-crons:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger 48h reminders
        run: |
          curl -X GET "https://votre-domaine.vercel.app/api/cron/send-48h-reminders?secret=${{ secrets.CRON_SECRET }}"
      
      - name: Trigger review requests
        run: |
          curl -X GET "https://votre-domaine.vercel.app/api/cron/send-review-requests?secret=${{ secrets.CRON_SECRET }}"
```

## Variables d'Environnement Requises

Ajoutez ces variables dans Vercel :
- `CRON_SECRET` : Un secret pour sécuriser les endpoints (ex: `laia_skin_cron_secret_2025`)
- `RESEND_API_KEY` : Votre clé API Resend
- `DATABASE_URL` : URL de connexion PostgreSQL avec port 6543

## Test des Cron Jobs

Pour tester un cron job manuellement :
```bash
curl -X GET "http://localhost:3000/api/cron/birthday-emails" \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

## Monitoring

Les logs des cron jobs sont disponibles dans :
- Vercel Dashboard > Functions > Logs
- Base de données : Table `EmailHistory` pour l'historique des envois