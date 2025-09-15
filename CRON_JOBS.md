# Configuration des Cron Jobs

## Cron Jobs Actifs sur Vercel (Limite : 2)

1. **Emails d'anniversaire** - `/api/cron/birthday-emails`
   - Horaire : Tous les jours à 9h
   - Envoie automatiquement des emails d'anniversaire avec code promo -30%

2. **Rappels de rendez-vous** - `/api/cron/reminder-emails`
   - Horaire : Tous les jours à 18h
   - Envoie des rappels 24h avant les rendez-vous

## Cron Jobs Additionnels (Déclenchement Manuel)

Ces endpoints peuvent être déclenchés manuellement ou via un service externe :

3. **Rappels 48h** - `/api/cron/send-48h-reminders`
   - URL : `https://votre-domaine.vercel.app/api/cron/send-48h-reminders?secret=VOTRE_CRON_SECRET`
   - Recommandé : Tous les jours à 10h
   - Envoie des rappels 48h avant les rendez-vous

4. **Demandes d'avis** - `/api/cron/send-review-requests`
   - URL : `https://votre-domaine.vercel.app/api/cron/send-review-requests?secret=VOTRE_CRON_SECRET`
   - Recommandé : Tous les jours à 15h
   - Envoie des demandes d'avis 3 jours après les rendez-vous

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