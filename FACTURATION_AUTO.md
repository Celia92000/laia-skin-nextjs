# 💳 Système de Facturation Automatique LAIA Connect

## 📋 Vue d'ensemble

Le système de facturation automatique génère et envoie automatiquement les factures mensuelles pour tous les abonnements LAIA Connect avec prélèvement SEPA.

---

## ⚙️ Configuration

### 1. Job CRON Mensuel

**Fichier** : `src/app/api/cron/generate-monthly-invoices/route.ts`

**Planification** : Le 1er de chaque mois à minuit (00:00)
```
0 0 1 * *
```

**Durée maximale** : 5 minutes (300 secondes)

### 2. Variables d'environnement requises

```env
# Sécurité CRON
CRON_SECRET=votre_secret_cron_ici

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=billing@laia-connect.com
```

---

## 🔄 Fonctionnement

### Étapes automatiques chaque 1er du mois :

1. **Récupération des organisations actives**
   - Statut : `ACTIVE`
   - Plans : `SOLO`, `DUO`, `TEAM`, `PREMIUM`

2. **Vérifications de sécurité**
   - ✅ Organisation pas en période d'essai
   - ✅ Pas de facture déjà générée ce mois-ci
   - ✅ Abonnement démarré

3. **Génération de la facture**
   - Calcul du montant (forfait + add-ons)
   - Calcul du prorata si changement récent
   - Création dans la base de données
   - Statut initial : `PENDING`

4. **Envoi automatique par email**
   - Email professionnel avec branding LAIA
   - Détails complets de la facture
   - Lignes détaillées (forfait + add-ons)
   - Information prorata si applicable
   - Modalités de paiement (prélèvement automatique)

---

## 📊 Logs et monitoring

### Logs générés automatiquement :

```
🔄 Démarrage génération factures mensuelles...
📊 X organisations actives trouvées

Pour chaque organisation :
  ✅ Facture LAIA-202501-000123 créée pour [Nom]
  📧 Email envoyé à contact@institut.com
  ⏭️  [Raison du saut si ignorée]
  ❌ [Erreur si échec]

✅ Génération factures terminée
   - Réussies: X
   - Ignorées: Y
   - Erreurs: Z
```

### Enregistrement dans ActivityLog

```javascript
{
  action: 'MONTHLY_INVOICES_GENERATED',
  entityType: 'INVOICE',
  metadata: {
    total: X,
    success: Y,
    skipped: Z,
    errors: W,
    date: '2025-01-01T00:00:00.000Z'
  }
}
```

---

## 🧪 Test manuel

### Tester la génération de factures :

```bash
# En local
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3001/api/cron/generate-monthly-invoices

# En production
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://votre-domaine.com/api/cron/generate-monthly-invoices
```

### Réponse attendue :

```json
{
  "success": true,
  "message": "Factures générées avec succès",
  "stats": {
    "total": 10,
    "success": 8,
    "skipped": 1,
    "errors": 1
  },
  "details": {
    "success": ["Institut A", "Institut B", ...],
    "skipped": ["Institut C (En période d'essai)"],
    "errors": [{"org": "Institut D", "error": "..."}]
  }
}
```

---

## 🔐 Sécurité

### Protection du endpoint CRON :

```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
}
```

⚠️ **Important** : Ne jamais exposer `CRON_SECRET` publiquement

---

## 📧 Template Email

### Contenu de l'email automatique :

- 🎨 Design professionnel LAIA Connect (violet/rose)
- 📄 Numéro de facture
- 💰 Montant total
- 📅 Date d'échéance
- 📊 Tableau détaillé des lignes
- ℹ️ Information prorata si applicable
- 💳 Modalités de paiement automatique
- 🔗 Lien vers l'espace client

---

## 🎯 Cas particuliers

### Organisations ignorées :

1. **En période d'essai**
   ```
   trialEndsAt > Date.now()
   ```

2. **Facture déjà générée ce mois**
   ```
   Invoice existante avec issueDate dans le mois courant
   ```

3. **Abonnement pas encore démarré**
   ```
   subscriptionStartDate > Date.now()
   ```

### Gestion des erreurs :

- ❌ **Erreur de génération** : Loggée, organisation passée
- ⚠️ **Erreur d'envoi email** : Loggée, facture créée quand même
- 📧 **Notification admin** : Si erreurs détectées

---

## 🔧 Maintenance

### Vérifications mensuelles recommandées :

1. Consulter les logs du 1er du mois
2. Vérifier le nombre de factures générées
3. Contrôler les emails envoyés (Resend dashboard)
4. Examiner les erreurs éventuelles
5. Vérifier l'ActivityLog

### Dashboard Super Admin :

- **Super Admin > Facturation**
  - Vue de toutes les factures générées
  - Filtres par statut, organisation, dates
  - Statistiques globales

---

## 💡 Améliorations futures

- [ ] Notification email au super-admin si erreurs
- [ ] Retry automatique en cas d'échec
- [ ] Dashboard de monitoring CRON
- [ ] Export CSV des factures générées
- [ ] Intégration comptabilité (export FEC)
- [ ] Prélèvement SEPA automatique

---

## 📞 Support

En cas de problème avec la facturation automatique :

1. Vérifier les logs du CRON job
2. Consulter l'ActivityLog
3. Vérifier les variables d'environnement
4. Tester manuellement avec curl
5. Contacter le support technique si nécessaire
