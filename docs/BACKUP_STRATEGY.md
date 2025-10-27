# 💾 Stratégie de Backup - LAIA Connect

## 🔒 Backups Automatiques Supabase

### ✅ Configuration Actuelle

**Supabase** gère automatiquement les backups de votre base de données :

- **Fréquence** : Quotidien
- **Conservation** :
  - Plan Gratuit : 7 jours
  - Plan Pro : 30 jours
- **Type** : Backup complet + Point-in-Time Recovery (PITR)
- **Localisation** : Stockage sécurisé Supabase

### 📊 Vérifier les Backups

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. **Database → Backups**
4. Voir l'historique des backups

### 🔄 Restaurer un Backup

1. Dashboard Supabase → Database → Backups
2. Sélectionner le backup souhaité
3. Cliquer sur "Restore"
4. ⚠️ **ATTENTION** : Cela va écraser les données actuelles

---

## 🛠️ Backup Manuel (Optional)

Si vous voulez créer un backup manuel supplémentaire :

```bash
./scripts/backup-database.sh
```

Les backups manuels sont stockés dans `/backups/`

---

## 📅 Recommandations Production

### Plan Gratuit (Actuel)
- ✅ Backups quotidiens (7 jours)
- ⚠️ **À FAIRE AVANT PRODUCTION** :
  - Passer au plan Pro (30 jours de rétention)
  - Activer Point-in-Time Recovery
  - Exporter backup mensuel hors Supabase (sécurité)

### Plan Pro (Recommandé pour Production)
- ✅ Backups quotidiens (30 jours)
- ✅ Point-in-Time Recovery
- ✅ Restauration à n'importe quel moment des 7 derniers jours
- **Coût** : ~25$/mois

---

## 🚨 Plan de Reprise d'Activité (DRP)

### En cas de perte de données :

1. **Identifier le point de restauration**
   - Quelle heure/jour avant l'incident ?

2. **Restaurer depuis Supabase**
   - Dashboard → Backups → Restore

3. **Vérifier l'intégrité**
   - Tester connexion
   - Vérifier données critiques (réservations, clients)
   - Relancer les tests d'isolation

4. **Communiquer**
   - Informer les clients si nécessaire
   - Documenter l'incident

---

## ✅ Checklist de Sécurité

- [x] Backups automatiques activés (Supabase)
- [ ] **À FAIRE** : Passer au plan Pro avant production
- [ ] **À FAIRE** : Tester restauration (1x/trimestre)
- [ ] **À FAIRE** : Export mensuel hors Supabase
- [ ] **À FAIRE** : Documentation procédure de restauration

---

## 💡 Backup Complémentaire (Optionnel)

Pour une sécurité maximale :

### Export mensuel vers Cloud externe

```bash
# Créer backup
./scripts/backup-database.sh

# Upload vers Google Drive / Dropbox / S3
# (À configurer selon votre infrastructure)
```

### Automatisation avec Cron

```bash
# Backup quotidien à 3h du matin
0 3 * * * cd /path/to/laia-connect && ./scripts/backup-database.sh

# Backup hebdomadaire le dimanche à 2h
0 2 * * 0 cd /path/to/laia-connect && ./scripts/backup-database.sh --weekly
```

---

## 📞 Support

En cas de problème avec les backups :
- **Supabase Support** : https://supabase.com/support
- **Documentation** : https://supabase.com/docs/guides/platform/backups
