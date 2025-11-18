# 🚀 CRON Jobs via GitHub Actions (GRATUIT)

## ✅ Avantages de GitHub Actions vs Vercel CRON

- **100% GRATUIT** (2000 minutes/mois gratuit, largement suffisant)
- **Pas de limite** sur le nombre de CRON jobs
- **Fiabilité** : GitHub Actions est très stable
- **Logs détaillés** dans GitHub

## 📅 Horaires Configurés

| Job | Heure Paris | Fréquence | Description |
|-----|-------------|-----------|-------------|
| **Anniversaires** | 9h00 | Tous les jours | Email + WhatsApp |
| **Demandes d'avis** | 10h00 | Tous les jours | Email + WhatsApp (3j après) |
| **Rappels RDV** | 18h00 | Tous les jours | WhatsApp (24h avant) |

## 🔧 Configuration

Le workflow est dans `.github/workflows/cron-jobs.yml`

### Test Manuel

1. Aller sur GitHub → Actions
2. Sélectionner "CRON Jobs WhatsApp et Email"
3. Cliquer sur "Run workflow"
4. Choisir la branche "main"
5. Cliquer sur "Run workflow" (vert)

### Vérifier les Logs

1. GitHub → Actions
2. Cliquer sur un workflow exécuté
3. Voir les détails de chaque job

## 📊 Monitoring

- **Succès** : ✅ Coche verte dans GitHub Actions
- **Échec** : ❌ Croix rouge + notification email
- **En cours** : 🟡 Cercle jaune

## 🔐 Sécurité

Le secret `laia_skin_cron_secret_2025` protège vos endpoints.
Ne le partagez pas !

## 💡 Notes

- Les CRON s'exécutent en UTC (1h de décalage avec Paris)
- GitHub Actions retry automatiquement si échec
- Maximum 6h d'exécution par job (largement suffisant)

## 🚨 En cas de problème

Si un CRON ne fonctionne pas :

1. Vérifier que le site Vercel est accessible
2. Vérifier les logs GitHub Actions
3. Tester manuellement l'endpoint :
```bash
curl https://laia-skin-institut-as92.vercel.app/api/cron/send-whatsapp-reminders?secret=laia_skin_cron_secret_2025
```

## 📈 Statistiques

Vous pouvez voir les statistiques d'exécution :
- GitHub → Actions → Insights
- Voir le taux de succès
- Voir les temps d'exécution