# Configuration du Webhook Email-to-Ticket avec Brevo

## 📧 Configuration de l'analyse des emails entrants (Inbound Parsing)

### Étape 1 : Accéder à la configuration Brevo

1. Connectez-vous à [Brevo Dashboard](https://app.brevo.com)
2. Allez dans **Settings** (Paramètres) > **Inbound parsing** (Analyse des emails entrants)
3. Cliquez sur **Add a new route** (Ajouter une nouvelle route)

### Étape 2 : Configurer la route pour contact@laiaconnect.fr

Remplissez les champs suivants :

| Champ | Valeur |
|-------|--------|
| **Email address** | `contact@laiaconnect.fr` |
| **Webhook URL** | `https://www.laiaconnect.fr/api/webhooks/email-to-ticket` |
| **Format** | JSON |
| **Method** | POST |

### Étape 3 : Vérifier la configuration

Brevo devrait afficher :
```
✅ Route active pour contact@laiaconnect.fr
→ Webhook: https://www.laiaconnect.fr/api/webhooks/email-to-ticket
```

### Étape 4 : Tester le webhook

1. Envoyez un email de test à `contact@laiaconnect.fr`
2. Vérifiez dans le super-admin (`/super-admin/tickets`) qu'un nouveau ticket a été créé
3. Vérifiez que vous avez reçu un email de confirmation

## 🔍 Format des données reçues de Brevo

Brevo envoie les emails au format JSON suivant :

```json
{
  "items": [
    {
      "Uuid": "unique-id",
      "MessageId": "message-id",
      "InReplyTo": null,
      "From": {
        "Address": "client@example.com",
        "Name": "Nom du Client"
      },
      "To": [
        {
          "Address": "contact@laiaconnect.fr",
          "Name": "LAIA Connect"
        }
      ],
      "Cc": [],
      "Bcc": [],
      "Subject": "Question sur mon abonnement",
      "Date": "2025-11-19T10:30:00Z",
      "Sender": {
        "Address": "client@example.com",
        "Name": "Nom du Client"
      },
      "RawTextBody": "Bonjour,\n\nJ'ai une question...",
      "RawHtmlBody": "<p>Bonjour,</p><p>J'ai une question...</p>",
      "Attachments": []
    }
  ]
}
```

## ✅ Ce qui se passe automatiquement

### 1. Création du ticket
- Un ticket est créé automatiquement dans le système
- Numéro de ticket généré (ex: `TICKET-2025-001`)
- Catégorie et priorité détectées automatiquement

### 2. Création de l'utilisateur (si nécessaire)
- Si l'email n'existe pas dans la base, un compte est créé
- Un lead est également créé pour le suivi commercial

### 3. Emails de confirmation
- **Client** : Reçoit un email avec le numéro de ticket
- **Super-admin** : Reçoit une notification de nouveau ticket

### 4. Gestion des réponses
- Le client peut répondre directement à l'email
- Sa réponse sera ajoutée au ticket existant (si envoyée dans les 5 minutes)
- Le numéro de ticket doit être conservé dans l'objet

## 🔧 Dépannage

### Le webhook ne reçoit pas les emails

1. **Vérifiez la configuration dans Brevo**
   - L'URL du webhook est correcte
   - Le format est bien JSON
   - La route est active

2. **Vérifiez les logs du serveur**
   ```bash
   # Rechercher les logs du webhook
   grep "Email entrant reçu" /var/log/app.log
   ```

3. **Testez manuellement le webhook**
   ```bash
   curl -X POST https://www.laiaconnect.fr/api/webhooks/email-to-ticket \
     -H "Content-Type: application/json" \
     -d '{
       "items": [{
         "From": {"Address": "test@example.com", "Name": "Test User"},
         "Subject": "Test ticket",
         "RawTextBody": "Ceci est un test",
         "To": [{"Address": "contact@laiaconnect.fr"}]
       }]
     }'
   ```

### Les tickets ne sont pas créés

1. Vérifiez que la base de données est accessible
2. Vérifiez les logs d'erreur dans le super-admin
3. Vérifiez que l'environnement Vercel a la variable `BREVO_API_KEY`

### Les emails de confirmation ne sont pas envoyés

1. Vérifiez la configuration Brevo dans `.env.local` :
   ```bash
   BREVO_API_KEY=xkeysib-...
   BREVO_FROM_EMAIL=contact@laiaconnect.fr
   BREVO_FROM_NAME=LAIA Connect
   ```

2. Testez l'envoi d'email via Brevo :
   ```bash
   curl -X POST https://api.brevo.com/v3/smtp/email \
     -H "api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "sender": {"email": "contact@laiaconnect.fr"},
       "to": [{"email": "your@email.com"}],
       "subject": "Test",
       "htmlContent": "<p>Test</p>"
     }'
   ```

## 📊 Monitoring

### Dashboard Brevo

Allez dans **Statistics** > **Inbound parsing** pour voir :
- Nombre d'emails reçus
- Nombre d'emails traités
- Erreurs éventuelles

### Super-Admin LAIA Connect

Allez dans `/super-admin/tickets` pour voir :
- Tickets créés depuis les emails
- Source : colonne `emailSource` contient l'email d'origine

## 🔐 Sécurité

### Headers de sécurité Brevo

Brevo envoie des headers pour vérifier l'authenticité :
- `X-Brevo-Event-Id` : ID unique de l'événement
- `User-Agent` : `Brevo-Webhook`

### Validation recommandée (optionnel)

Vous pouvez ajouter une validation dans le webhook :

```typescript
// Vérifier que la requête vient bien de Brevo
const userAgent = request.headers.get('user-agent')
if (!userAgent?.includes('Brevo')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## 📞 Support

En cas de problème :
- **Documentation Brevo** : https://developers.brevo.com/docs/inbound-parsing
- **Support Brevo** : support@brevo.com
- **Logs LAIA Connect** : `/super-admin/logs`
