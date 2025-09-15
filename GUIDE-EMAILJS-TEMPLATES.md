# 📧 Guide de Configuration des Templates EmailJS

## 🔑 Identifiants EmailJS
- **Public Key**: QK6MriGN3B0UqkIoS
- **Private Key**: h7fQFgB9ggrbiE6iUcybo

## 📋 Templates à créer dans EmailJS

### 1. **template_confirmation** - Confirmation de réservation
**Variables à configurer :**
- `{{to_email}}` - Email du destinataire
- `{{client_name}}` - Nom du client
- `{{date}}` - Date du RDV
- `{{time}}` - Heure du RDV
- `{{services}}` - Liste des services
- `{{total_price}}` - Prix total
- `{{reservation_id}}` - ID de réservation

**HTML à copier :** `/email-templates/confirmation-reservation.html`

---

### 2. **template_review** - Demande d'avis avec programme fidélité
**Variables à configurer :**
- `{{to_email}}` - Email du destinataire
- `{{client_name}}` - Nom du client
- `{{service_name}}` - Nom du service
- `{{review_link}}` - Lien vers le formulaire d'avis
- `{{loyalty_progress}}` - Progression fidélité (ex: "Vous avez 2 séances sur 3")
- `{{next_reward}}` - Prochaine récompense (ex: "Plus qu'1 séance pour -10%")

**HTML à copier :** `/email-templates/review-request-loyalty.html`

---

### 3. **template_reminder_48h** - Rappel 48h avant RDV
**Variables à configurer :**
- `{{to_email}}` - Email du destinataire
- `{{client_name}}` - Nom du client
- `{{date}}` - Date du RDV (format long)
- `{{time}}` - Heure du RDV
- `{{services}}` - Liste des services
- `{{duration}}` - Durée totale

**HTML à copier :** `/email-templates/rappel-rdv-48h.html`

---

### 4. **template_birthday** - Email d'anniversaire
**Variables à configurer :**
- `{{to_email}}` - Email du destinataire
- `{{client_name}}` - Nom du client
- `{{current_month}}` - Code du mois (JAN, FEB, MAR, etc.)

**HTML à copier :** `/email-templates/anniversaire-client.html`

---

## ⏰ Planning des envois automatiques (Vercel Cron)

| Heure | Type d'email | Déclencheur |
|-------|--------------|-------------|
| 9h00 | Anniversaires | Clients dont c'est l'anniversaire |
| 10h00 | Rappel 48h | RDV dans 2 jours |
| 14h00 | Rappel J-1 | RDV demain |
| 15h00 | Demande d'avis | 3 jours après le soin |

## 🚀 Étapes de configuration

### 1. Connexion à EmailJS
1. Allez sur [EmailJS Dashboard](https://dashboard.emailjs.com)
2. Connectez-vous avec vos identifiants

### 2. Création des templates
Pour chaque template :
1. Cliquez sur "Email Templates" → "Create New Template"
2. Donnez le nom exact (ex: `template_confirmation`)
3. Copiez le HTML depuis le fichier correspondant dans `/email-templates/`
4. Configurez les variables avec `{{variable_name}}`
5. Testez l'envoi

### 3. Configuration du service
1. Dans "Email Services", vérifiez que vous avez un service nommé `default_service`
2. Si non, créez-le et connectez votre compte email (Gmail, Outlook, etc.)

### 4. Variables d'environnement Vercel
Ajoutez dans les settings Vercel :
```
EMAILJS_PUBLIC_KEY=QK6MriGN3B0UqkIoS
EMAILJS_PRIVATE_KEY=h7fQFgB9ggrbiE6iUcybo
CRON_SECRET=laia_skin_cron_secret_2025
```

## 📊 Suivi des envois

### Dashboard EmailJS
- Voir l'historique des emails envoyés
- Statistiques d'ouverture
- Gestion des échecs d'envoi

### Admin LAIA SKIN
- Onglet "Emailing" → "Historique & Rapports"
- Statistiques par type d'email
- Taux d'ouverture et de clics

## 🎁 Codes promo anniversaire

Les codes sont générés automatiquement :
- Format : `BIRTHDAY` + mois en 3 lettres
- Exemples : `BIRTHDAYJAN`, `BIRTHDAYFEB`, `BIRTHDAYMAR`
- Validité : Tout le mois d'anniversaire
- Réduction : -20% sur un soin

## ❓ Support

En cas de problème :
1. Vérifiez les logs dans Vercel Functions
2. Consultez l'historique EmailJS
3. Testez manuellement via l'admin

## 📝 Notes importantes

- Les emails sont envoyés uniquement aux réservations confirmées
- Les rappels ne sont pas envoyés pour les RDV annulés
- Les emails d'anniversaire nécessitent la date de naissance renseignée
- Le programme de fidélité se base sur le `LoyaltyProfile` du client