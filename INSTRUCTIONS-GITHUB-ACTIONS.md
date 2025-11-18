# 📋 Instructions pour Activer les CRON Jobs Gratuits

## Option 1: Ajouter via GitHub (Recommandé)

1. **Aller sur GitHub** : https://github.com/Celia92000/laia-skin-nextjs

2. **Créer le dossier workflows** :
   - Cliquer sur "Create new file"
   - Taper : `.github/workflows/cron-jobs.yml`

3. **Copier-coller ce code** :

```yaml
name: CRON Jobs WhatsApp et Email

on:
  schedule:
    # Rappels WhatsApp 24h avant - Tous les jours à 18h (heure Paris)
    - cron: '0 17 * * *'  # 17h UTC = 18h Paris
    
    # Demandes d'avis - Tous les jours à 10h (heure Paris)
    - cron: '0 9 * * *'   # 9h UTC = 10h Paris
    
    # Messages d'anniversaire - Tous les jours à 9h (heure Paris)
    - cron: '0 8 * * *'   # 8h UTC = 9h Paris
    
  workflow_dispatch: # Permet de déclencher manuellement

jobs:
  rappels-whatsapp:
    name: Rappels WhatsApp 24h avant
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 17 * * *' || github.event_name == 'workflow_dispatch'
    
    steps:
      - name: Envoyer rappels WhatsApp
        run: |
          curl -X GET "https://laia-skin-institut-as92.vercel.app/api/cron/send-whatsapp-reminders?secret=laia_skin_cron_secret_2025" \
            -H "User-Agent: GitHub-Actions" \
            --fail-with-body \
            --max-time 300
          
  demandes-avis-email:
    name: Demandes d'avis par Email
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 9 * * *' || github.event_name == 'workflow_dispatch'
    
    steps:
      - name: Envoyer demandes d'avis email
        run: |
          curl -X GET "https://laia-skin-institut-as92.vercel.app/api/cron/send-review-requests?secret=laia_skin_cron_secret_2025" \
            -H "User-Agent: GitHub-Actions" \
            --fail-with-body \
            --max-time 300
            
  demandes-avis-whatsapp:
    name: Demandes d'avis par WhatsApp
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 9 * * *' || github.event_name == 'workflow_dispatch'
    needs: demandes-avis-email # Après les emails
    
    steps:
      - name: Attendre 1 minute
        run: sleep 60
        
      - name: Envoyer demandes d'avis WhatsApp
        run: |
          curl -X GET "https://laia-skin-institut-as92.vercel.app/api/cron/send-whatsapp-reviews?secret=laia_skin_cron_secret_2025" \
            -H "User-Agent: GitHub-Actions" \
            --fail-with-body \
            --max-time 300

  anniversaires:
    name: Messages d'anniversaire Email + WhatsApp
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 8 * * *' || github.event_name == 'workflow_dispatch'
    
    steps:
      - name: Envoyer messages d'anniversaire
        run: |
          curl -X GET "https://laia-skin-institut-as92.vercel.app/api/cron/send-birthday-emails?secret=laia_skin_cron_secret_2025" \
            -H "User-Agent: GitHub-Actions" \
            --fail-with-body \
            --max-time 300
```

4. **Cliquer sur "Commit new file"**

5. **C'est fait !** Les CRON jobs sont maintenant actifs

## Option 2: Via Git avec bon token

Si vous voulez pousser depuis votre ordinateur, vous devez :

1. Créer un nouveau token GitHub avec permission `workflow`
2. Aller sur : https://github.com/settings/tokens/new
3. Cocher : `workflow`
4. Générer le token
5. Utiliser ce token pour push

## ✅ Tester Manuellement

1. Aller sur : https://github.com/Celia92000/laia-skin-nextjs/actions
2. Cliquer sur "CRON Jobs WhatsApp et Email"
3. Cliquer sur "Run workflow"
4. Cliquer sur le bouton vert "Run workflow"

## 📅 Résumé des Horaires

- **9h00** : Messages d'anniversaire (Email + WhatsApp)
- **10h00** : Demandes d'avis (Email + WhatsApp)
- **18h00** : Rappels RDV du lendemain (WhatsApp)

## 🎉 C'est Gratuit !

- Pas de limite sur le nombre de CRON
- 2000 minutes gratuites par mois
- Vous utilisez ~3 minutes par jour = 90 minutes/mois
- Largement suffisant !

## ❓ Besoin d'aide ?

Les CRON jobs s'activeront automatiquement aux heures programmées.
Vous pouvez voir les exécutions dans l'onglet "Actions" de GitHub.