# 🚨 Plan de Reprise d'Activité (PRA) - LAIA

**Date de création** : 2025-01-19
**Version** : 1.0
**Responsable** : Célia (contact@laiaconnect.fr)

---

## 📋 Table des Matières

1. [Objectifs](#objectifs)
2. [Contacts d'Urgence](#contacts-durgence)
3. [Indicateurs Critiques](#indicateurs-critiques)
4. [Scénarios de Sinistres](#scénarios-de-sinistres)
5. [Procédures de Récupération](#procédures-de-récupération)
6. [Backups et Restauration](#backups-et-restauration)
7. [Communication de Crise](#communication-de-crise)
8. [Tests et Maintenance](#tests-et-maintenance)

---

## 🎯 Objectifs

### RTO (Recovery Time Objective)
**Temps maximum acceptable de panne** :
- **Services critiques** (réservations, paiements) : **4 heures**
- **Services importants** (espace client, admin) : **24 heures**
- **Services secondaires** (blog, produits) : **72 heures**

### RPO (Recovery Point Objective)
**Perte de données maximale acceptable** :
- **Réservations et paiements** : **0 minute** (transactions synchrones)
- **Données clients** : **24 heures** (backups quotidiens Supabase)
- **Contenu statique** (blog, produits) : **7 jours** (backups hebdomadaires)

---

## 📞 Contacts d'Urgence

### Équipe Interne
| Rôle | Nom | Contact | Disponibilité |
|------|-----|---------|---------------|
| **Responsable Technique** | Célia | contact@laiaconnect.fr | 24/7 |
| **Support Clients** | Célia | contact@laiaskininstitut.fr | 9h-19h |

### Fournisseurs Critiques
| Service | Contact | Statut |
|---------|---------|--------|
| **Vercel** (Hébergement) | https://vercel.com/support | https://status.vercel.com |
| **Supabase** (BDD) | https://supabase.com/support | https://status.supabase.com |
| **Upstash** (Redis) | https://upstash.com/discord | https://status.upstash.com |
| **Stripe** (Paiements) | https://support.stripe.com | https://status.stripe.com |
| **Resend** (Emails) | support@resend.com | https://status.resend.com |

### Partenaires Techniques
| Type | Nom | Contact |
|------|-----|---------|
| **Audit Sécurité** | Synacktiv | contact@synacktiv.com |
| **Support GitHub** | GitHub Support | https://support.github.com |

---

## 📊 Indicateurs Critiques

### KPIs à Surveiller en Temps Réel

1. **Disponibilité du site**
   - URL : https://laiaskininstitut.fr
   - Monitoring : Vercel Analytics + UptimeRobot (à configurer)
   - Alerte si : Down > 2 minutes

2. **Base de données Supabase**
   - Connexions actives : < 100 (plan Pro)
   - Temps de réponse : < 100ms
   - Alerte si : Connexions > 80 ou temps > 500ms

3. **Paiements Stripe**
   - Taux de succès : > 95%
   - Alerte si : Échec > 5%

4. **Emails Resend**
   - Taux de livraison : > 98%
   - Alerte si : Bounces > 2%

---

## 💥 Scénarios de Sinistres

### Scénario 1 : 🔴 Panne Vercel (Hébergement)

**Symptômes** :
- Site inaccessible (erreur 500/503)
- Dashboard Vercel montre "Deployment Failed"

**Impact** :
- **Criticité** : CRITIQUE
- **Services affectés** : Tous (site vitrine + admin + API)
- **Clients impactés** : 100%

**Procédure** :
1. ✅ Vérifier https://status.vercel.com
2. ✅ Consulter les logs : `vercel logs --prod`
3. ✅ Rollback vers déploiement précédent : Dashboard Vercel → Deployments → "Promote to Production"
4. ✅ Si panne générale Vercel : Activer page de maintenance statique (voir ci-dessous)
5. ✅ Communiquer sur réseaux sociaux

**Temps de résolution estimé** : 15-30 minutes

---

### Scénario 2 : 🟠 Corruption Base de Données Supabase

**Symptômes** :
- Erreurs Prisma "Connection timeout"
- Dashboard Supabase inaccessible
- Données incohérentes

**Impact** :
- **Criticité** : CRITIQUE
- **Services affectés** : Réservations, paiements, authentification
- **Clients impactés** : 100%

**Procédure** :
1. ✅ Vérifier https://status.supabase.com
2. ✅ Accéder au dashboard Supabase → Database → Backups
3. ✅ Restaurer le backup le plus récent :
   ```bash
   # Télécharger le backup
   # Restaurer via SQL Editor dans Supabase
   ```
4. ✅ Vérifier l'intégrité avec le script de vérification :
   ```bash
   npx tsx scripts/check-database-integrity.ts
   ```
5. ✅ Tester une réservation test
6. ✅ Notifier les clients si perte de données > 1 heure

**Temps de résolution estimé** : 1-2 heures
**RPO** : 24 heures max (backup quotidien)

---

### Scénario 3 : 🟡 Fuite de Clés API

**Symptômes** :
- Clé API commitée dans Git par erreur
- Alerte GitHub "Secret scanning"
- Activité suspecte sur compte Stripe/Resend

**Impact** :
- **Criticité** : HAUTE
- **Services affectés** : Paiements, emails
- **Risque** : Fraude financière

**Procédure** :
1. ✅ **IMMÉDIATEMENT** : Révoquer la clé compromise
   - Stripe : Dashboard → Developers → API keys → Roll key
   - Resend : Dashboard → API keys → Delete
   - Supabase : Dashboard → Settings → API → Reset
2. ✅ Supprimer le commit exposé :
   ```bash
   # Si pas encore pushé
   git reset --hard HEAD~1

   # Si déjà pushé (ATTENTION : casse l'historique)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" HEAD
   git push --force
   ```
3. ✅ Générer de nouvelles clés
4. ✅ Mettre à jour `.env.local` et Vercel Environment Variables
5. ✅ Vérifier les transactions suspectes (48h précédentes)
6. ✅ Notifier Stripe si fraude détectée

**Temps de résolution estimé** : 30 minutes
**Coût potentiel** : 0€-500€ selon fraude

---

### Scénario 4 : 🟢 Attaque DDoS

**Symptômes** :
- Trafic anormal (> 10 000 req/min)
- Rate limiting déclenché massivement
- Lenteur généralisée

**Impact** :
- **Criticité** : MOYENNE
- **Services affectés** : Tous (performances dégradées)
- **Clients impactés** : 100%

**Procédure** :
1. ✅ Vérifier Vercel Analytics : Anomalie de trafic
2. ✅ Identifier les IPs attaquantes :
   ```bash
   vercel logs --prod | grep "429" | awk '{print $1}' | sort | uniq -c | sort -nr
   ```
3. ✅ Bloquer les IPs via Vercel Firewall :
   - Dashboard Vercel → Security → Firewall Rules
4. ✅ Augmenter temporairement les limites Upstash si légitime
5. ✅ Activer Cloudflare DDoS Protection (si nécessaire)

**Temps de résolution estimé** : 1-4 heures

---

### Scénario 5 : 🔵 Perte de Repository GitHub

**Symptômes** :
- Repository supprimé accidentellement
- Compte GitHub compromis

**Impact** :
- **Criticité** : HAUTE
- **Services affectés** : Développement, déploiements futurs
- **Clients impactés** : 0% (immédiat), 100% (long terme)

**Procédure** :
1. ✅ **IMMÉDIATEMENT** : Contacter GitHub Support
   - https://support.github.com
   - Demander restauration (possible sous 90 jours)
2. ✅ Restaurer depuis backup local :
   ```bash
   # Si vous avez un clone local récent
   cd /chemin/vers/votre/projet
   git remote -v # Vérifier l'URL du remote

   # Créer un nouveau repository sur GitHub
   git remote set-url origin https://github.com/nouveau-repo.git
   git push -u origin main
   ```
3. ✅ Reconfigurer Vercel :
   - Dashboard Vercel → Project Settings → Git → Reconnect
4. ✅ Reconfigurer les webhooks et secrets

**Temps de résolution estimé** : 2-8 heures
**Prévention** : Backup local quotidien automatique

---

## 💾 Backups et Restauration

### Stratégie de Sauvegarde

#### 1. Base de Données Supabase
- **Fréquence** : Quotidienne (automatique, plan Pro)
- **Rétention** : 7 jours
- **Localisation** : Serveurs Supabase (AWS EU-West-3)
- **Procédure de restauration** :
  ```sql
  -- Dans Supabase SQL Editor
  -- 1. Télécharger le backup depuis Dashboard → Database → Backups
  -- 2. Exécuter le fichier .sql
  ```

#### 2. Code Source (GitHub)
- **Fréquence** : À chaque commit
- **Rétention** : Illimitée (historique Git)
- **Backup local recommandé** :
  ```bash
  # Script à exécuter quotidiennement
  #!/bin/bash
  cd /home/celia/laia-github-temp/laia-skin-nextjs
  git pull
  tar -czf ~/backups/laia-$(date +%Y%m%d).tar.gz .
  # Garder seulement 30 derniers jours
  find ~/backups -name "laia-*.tar.gz" -mtime +30 -delete
  ```

#### 3. Fichiers Uploadés (Cloudinary)
- **Fréquence** : Automatique (stockage cloud)
- **Rétention** : Permanente
- **Backup** : Télécharger via API si besoin :
  ```bash
  # Script de backup Cloudinary
  npx tsx scripts/backup-cloudinary.ts
  ```

#### 4. Variables d'Environnement
- **Localisation** : `.env.local` (local) + Vercel Dashboard
- **Backup** :
  ```bash
  # Exporter les variables Vercel
  vercel env pull .env.backup
  # Chiffrer avec GPG
  gpg -c .env.backup
  # Stocker dans un coffre-fort (1Password, Bitwarden)
  ```

---

## 📢 Communication de Crise

### Template Email - Panne Majeure

**Sujet** : [URGENT] Incident technique en cours - LAIA

```
Bonjour,

Nous rencontrons actuellement un incident technique affectant [SERVICE].

📊 Informations :
- Début de l'incident : [HEURE]
- Services impactés : [LISTE]
- Temps de résolution estimé : [DURÉE]

✅ Ce qui fonctionne :
- [Services opérationnels]

❌ Ce qui ne fonctionne pas :
- [Services en panne]

🔧 Actions en cours :
- [Description des actions de résolution]

Nous vous tiendrons informés toutes les 30 minutes.

Merci de votre patience,
L'équipe LAIA
```

### Template Réseaux Sociaux

```
🚨 INCIDENT TECHNIQUE

Nous rencontrons actuellement des difficultés techniques.
Nos équipes travaillent activement à la résolution.

⏱️ Résolution estimée : [DURÉE]

Suivez les mises à jour ici 👇
```

### Canaux de Communication
1. **Email** : Liste de diffusion clients (export depuis Supabase)
2. **Instagram** : @laia.skin
3. **Page de statut** : status.laiaskininstitut.fr (à créer)
4. **SMS** (urgent) : Via Brevo API

---

## 🧪 Tests et Maintenance

### Planning de Tests

| Test | Fréquence | Dernière Exécution | Prochaine |
|------|-----------|-------------------|-----------|
| **Restauration BDD** | Trimestriel | - | 2025-04-19 |
| **Rollback Vercel** | Mensuel | - | 2025-02-19 |
| **Révocation clés API** | Trimestriel | - | 2025-04-19 |
| **Backup local** | Hebdomadaire | - | Chaque lundi |

### Procédure de Test de Restauration BDD

```bash
# 1. Créer une copie de test
# Dans Supabase : Database → Backups → Download latest

# 2. Créer un projet Supabase de test
# test-laia-recovery.supabase.co

# 3. Restaurer le backup
# SQL Editor → Coller le fichier .sql

# 4. Vérifier l'intégrité
npx tsx scripts/check-database-integrity.ts

# 5. Mesurer le temps de restauration
# Objectif : < 30 minutes
```

---

## 📝 Checklist Post-Incident

Après chaque incident, compléter cette checklist :

- [ ] Incident documenté dans un fichier `incidents/YYYY-MM-DD-description.md`
- [ ] RTO et RPO respectés ? Si non, pourquoi ?
- [ ] Communication clients effectuée ?
- [ ] Causes racines identifiées (Root Cause Analysis)
- [ ] Actions correctives définies
- [ ] Plan de prévention mis à jour
- [ ] Équipe débriefée (Post-Mortem)
- [ ] Documentation mise à jour

---

## 🔐 Annexes

### Script de Vérification d'Intégrité BDD

Créer `scripts/check-database-integrity.ts` :

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIntegrity() {
  console.log('🔍 Vérification intégrité base de données...\n');

  try {
    // Compter les enregistrements critiques
    const [users, reservations, organizations] = await Promise.all([
      prisma.user.count(),
      prisma.reservation.count(),
      prisma.organization.count(),
    ]);

    console.log('✅ Tables principales :');
    console.log(`   - Utilisateurs : ${users}`);
    console.log(`   - Réservations : ${reservations}`);
    console.log(`   - Organisations : ${organizations}\n`);

    // Vérifier les contraintes
    const orphanReservations = await prisma.reservation.count({
      where: { userId: null },
    });

    if (orphanReservations > 0) {
      console.log(`⚠️  ${orphanReservations} réservations sans utilisateur`);
    } else {
      console.log('✅ Aucune réservation orpheline');
    }

    // Vérifier les dates
    const futureReservations = await prisma.reservation.count({
      where: { date: { gte: new Date() } },
    });

    console.log(`✅ ${futureReservations} réservations futures\n`);

    console.log('✅ Base de données intègre !');
  } catch (error) {
    console.error('❌ Erreur de vérification :', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkIntegrity();
```

### Page de Maintenance Statique

Créer `public/maintenance.html` :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maintenance en cours - LAIA</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #fdfbf7, #f8f6f0);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      max-width: 500px;
      padding: 40px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 { color: #d4b5a0; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; }
    .icon { font-size: 64px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>Maintenance en cours</h1>
    <p>
      Nous effectuons actuellement une maintenance pour améliorer votre expérience.
    </p>
    <p>
      Le site sera de nouveau disponible dans quelques instants.
    </p>
    <p style="margin-top: 30px; font-size: 14px; color: #999;">
      En cas d'urgence : contact@laiaskininstitut.fr
    </p>
  </div>
</body>
</html>
```

---

## 📅 Historique des Révisions

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 2025-01-19 | Célia | Création initiale |

---

**Document confidentiel - Usage interne uniquement**
