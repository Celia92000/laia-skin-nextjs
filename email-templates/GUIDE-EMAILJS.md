# 📧 Guide de configuration EmailJS pour LAIA SKIN

## 🔐 Vos identifiants EmailJS
- **Public Key** : QK6MriGN3B0UqkIoS
- **Private Key** : h7fQFgB9ggrbiE6iUcybo
- **Dashboard** : https://dashboard.emailjs.com/

## 📝 Templates à créer (4 au total)

### 1️⃣ Template de confirmation de réservation

**Nom du template** : `template_confirmation`

**Variables à configurer dans EmailJS** :
- `{{client_name}}` - Nom du client
- `{{date}}` - Date du rendez-vous
- `{{time}}` - Heure du rendez-vous  
- `{{services}}` - Liste des soins réservés
- `{{total_price}}` - Prix total
- `{{reservation_id}}` - Numéro de réservation

**Fichier HTML** : `confirmation-reservation.html`

### 2️⃣ Template de demande d'avis avec fidélité

**Nom du template** : `template_review`

**Variables à configurer dans EmailJS** :
- `{{client_name}}` - Nom du client
- `{{service_name}}` - Nom du soin effectué
- `{{review_link}}` - Lien pour donner son avis
- `{{loyalty_progress}}` - Progression dans le programme (ex: "Vous avez 2 séances sur 3")
- `{{next_reward}}` - Prochaine récompense (ex: "Plus qu'1 séance pour obtenir -10%")

**Fichier HTML** : `review-request-loyalty.html`

### 3️⃣ Template de rappel 48h avant RDV

**Nom du template** : `template_reminder_48h`

**Variables à configurer dans EmailJS** :
- `{{client_name}}` - Nom du client
- `{{date}}` - Date du rendez-vous (format long)
- `{{time}}` - Heure du rendez-vous
- `{{services}}` - Liste des soins
- `{{duration}}` - Durée totale du/des soins

**Fichier HTML** : `rappel-rdv-48h.html`

### 4️⃣ Template d'anniversaire

**Nom du template** : `template_birthday`

**Variables à configurer dans EmailJS** :
- `{{client_name}}` - Nom du client
- `{{current_month}}` - Code du mois (JAN, FEB, MAR, etc.)

**Fichier HTML** : `anniversaire-client.html`

## 🚀 Comment configurer les templates

### Étape 1 : Connexion à EmailJS
1. Allez sur https://dashboard.emailjs.com/
2. Connectez-vous avec votre compte

### Étape 2 : Créer le service email
1. Cliquez sur "Email Services"
2. Choisissez votre fournisseur (Gmail, Outlook, etc.)
3. Nommez-le `default_service`
4. Suivez les instructions pour connecter votre email

### Étape 3 : Créer les templates

#### Pour chaque template :
1. Allez dans "Email Templates"
2. Cliquez sur "Create New Template"
3. Donnez le nom exact (`template_confirmation` ou `template_review`)
4. Dans l'éditeur :
   - **Subject** : 
     - Confirmation : "✨ Votre réservation chez LAIA SKIN est confirmée"
     - Avis : "{{client_name}}, comment s'est passé votre soin ?"
   - **Content** : Copiez le contenu HTML du fichier correspondant
   - **Reply To** : contact@laiaskin.fr
   - **From Name** : LAIA SKIN Institut

### Étape 4 : Tester les templates
1. Cliquez sur "Test It" dans chaque template
2. Remplissez les variables de test
3. Envoyez un email de test à votre adresse

## 🔄 Automatisation Vercel

Les crons sont configurés pour s'exécuter automatiquement :
- **Anniversaires** : Tous les jours à 9h
- **Rappels 48h** : Tous les jours à 10h (2 jours avant le RDV)
- **Rappels J-1** : Tous les jours à 14h (veille du RDV)
- **Demandes d'avis** : Tous les jours à 15h (3 jours après le soin)

## ⚙️ Variables d'environnement

Déjà configurées dans `.env.local` :
```
EMAILJS_PUBLIC_KEY=QK6MriGN3B0UqkIoS
EMAILJS_PRIVATE_KEY=h7fQFgB9ggrbiE6iUcybo
CRON_SECRET=laia_skin_cron_secret_2025
```

## 📊 Programme de fidélité

Le système calcule automatiquement :
- **3 séances** → -10% sur le prochain soin
- **5 séances** → -15% sur le prochain soin
- **1er forfait** → -20% sur le forfait
- **2 forfaits** → 1 soin OFFERT

## 🎯 Points importants

1. **Ne pas modifier** les noms des templates (`template_confirmation`, `template_review`)
2. **Garder** les variables avec les doubles accolades `{{variable}}`
3. **Tester** chaque template avant utilisation
4. Les emails partent automatiquement après validation d'une réservation

## 📞 Support

Si vous avez des questions :
- Documentation EmailJS : https://www.emailjs.com/docs/
- Variables dans le code : `/src/lib/emailjs-service.ts`
- API des crons : `/src/app/api/cron/`