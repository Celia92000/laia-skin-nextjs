# Configuration des Webhooks Brevo pour LAIA Connect

Ce guide explique comment configurer les deux types de webhooks Brevo pour le système de ticketing.

---

## 📥 1. WEBHOOK ENTRANT (Inbound Parsing) - PRIORITAIRE

### À quoi ça sert ?
Transforme automatiquement les emails reçus sur `contact@laiaconnect.fr` en tickets de support.

### Configuration dans Brevo

1. **Aller dans votre compte Brevo**
   - Connectez-vous à https://app.brevo.com
   - Cliquez sur votre nom en haut à droite → "Webhooks"

2. **Créer un webhook ENTRANT**
   - Cliquez sur "Webhook entrant"
   - Ou allez dans Settings → Inbound Parsing

3. **Configurer le webhook**
   ```
   Adresse email : contact@laiaconnect.fr
   Webhook URL   : https://www.laiaconnect.fr/api/webhooks/email-to-ticket
   Méthode       : POST
   Format        : JSON
   ```

4. **Tester la configuration**
   - Envoyez un email de test à contact@laiaconnect.fr
   - Vérifiez qu'un ticket est bien créé dans le super-admin

### Format des données reçues

Brevo envoie les emails dans ce format :

```json
{
  "items": [
    {
      "Uuid": "...",
      "MessageId": "...",
      "InReplyTo": null,
      "From": {
        "Address": "client@example.com",
        "Name": "Jean Dupont"
      },
      "To": [
        {
          "Address": "contact@laiaconnect.fr",
          "Name": ""
        }
      ],
      "Subject": "Problème de connexion",
      "RawHtmlBody": "<p>Je n'arrive pas à me connecter...</p>",
      "RawTextBody": "Je n'arrive pas à me connecter...",
      "Date": "2025-01-19T10:30:00Z",
      "Headers": {...}
    }
  ]
}
```

### Ce qui se passe automatiquement

1. ✅ **Création ou récupération de l'utilisateur**
   - Si l'email existe → Ticket associé à cet utilisateur
   - Si l'email n'existe pas → Création automatique d'un compte avec rôle ADMIN

2. ✅ **Création du ticket**
   - Numéro unique : `TICKET-2025-XXX`
   - Sujet : Sujet de l'email
   - Description : Corps de l'email (HTML si disponible, sinon texte)
   - Statut : OPEN
   - Priorité : MEDIUM par défaut

3. ✅ **Envoi d'emails automatiques**
   - Email de confirmation au client avec le numéro de ticket
   - Email de notification au super admin (contact@laiaconnect.fr)

### Dépannage

**Problème : Les emails n'arrivent pas**
- Vérifiez que l'adresse contact@laiaconnect.fr est bien configurée dans Brevo
- Vérifiez que le domaine laiaconnect.fr est vérifié dans Brevo
- Consultez les logs Brevo dans "Webhooks" → "Logs"

**Problème : Erreur 500 dans les logs Brevo**
- Vérifiez que la variable `BREVO_API_KEY` est bien définie dans Vercel
- Consultez les logs de l'application : `https://vercel.com/votre-projet/logs`

---

## 📤 2. WEBHOOK SORTANT (Outbound Events) - OPTIONNEL

### À quoi ça sert ?
Reçoit les notifications d'événements liés aux emails envoyés (ouvertures, clics, bounces, etc.).

### Configuration dans Brevo

1. **Aller dans votre compte Brevo**
   - Connectez-vous à https://app.brevo.com
   - Cliquez sur votre nom en haut à droite → "Webhooks"

2. **Créer un webhook SORTANT**
   - Cliquez sur "Webhook sortant"
   - Cliquez sur "Ajouter un nouveau webhook"

3. **Configurer le webhook**
   ```
   URL               : https://www.laiaconnect.fr/api/webhooks/brevo-events
   Description       : Tracking des événements emails LAIA Connect
   Événements        : (sélectionnez ci-dessous)
   ```

4. **Sélectionner les événements à tracker**

   **Recommandés** :
   - ✅ `delivered` - Email délivré avec succès
   - ✅ `opened` - Email ouvert par le destinataire
   - ✅ `click` - Lien cliqué dans l'email
   - ✅ `hard_bounce` - Email rejeté définitivement
   - ✅ `soft_bounce` - Email rejeté temporairement
   - ✅ `complaint` - Marqué comme spam
   - ✅ `invalid_email` - Adresse email invalide
   - ✅ `blocked` - Email bloqué

   **Optionnels** :
   - `request` - Demande d'envoi
   - `deferred` - Envoi différé
   - `unsubscribed` - Désabonnement

5. **Tester la configuration**
   - Cliquez sur "Tester" dans Brevo
   - Vérifiez les logs dans Vercel

### Format des données reçues

Brevo envoie les événements dans ce format :

```json
[
  {
    "event": "opened",
    "email": "client@example.com",
    "id": 123456,
    "date": "2025-01-19T10:35:00Z",
    "ts": 1737280500,
    "message-id": "<abc123@smtp-relay.brevo.com>",
    "ts_event": 1737280500,
    "subject": "Re: Problème de connexion [TICKET-2025-001]",
    "tag": "ticket-response"
  }
]
```

### Ce qui se passe automatiquement

Les événements sont traités différemment selon le type :

#### Événements de suivi (tracking)
- **`delivered`** → Met à jour EmailHistory avec `status: delivered`
- **`opened`** → Met à jour EmailHistory avec `opened: true` et `openedAt`
- **`click`** → Met à jour EmailHistory avec `clicked: true` et `clickedAt`

#### Événements d'erreur (bounces)
- **`hard_bounce`** → Marque l'email comme invalide dans User.adminNotes
- **`soft_bounce`** → Met à jour EmailHistory avec `status: soft_bounce`
- **`invalid_email`** → Ajoute une note dans User.adminNotes
- **`blocked`** → Met à jour EmailHistory avec `status: blocked`

#### Événements utilisateur
- **`unsubscribed`** → Met à jour User.preferences à `unsubscribed_from_emails`
- **`complaint`** → Ajoute une note "Marqué comme spam" dans User.adminNotes

### Table EmailHistory (optionnelle)

⚠️ **Note** : La table EmailHistory n'existe pas encore dans le schéma Prisma actuel.

Si vous souhaitez tracker les événements emails, ajoutez ce modèle à votre schema.prisma :

```prisma
model EmailHistory {
  id           String    @id @default(cuid())
  messageId    String?   @unique
  recipient    String
  subject      String?
  status       String    @default("sent") // sent, delivered, soft_bounce, hard_bounce, blocked

  // Tracking
  deliveredAt  DateTime?
  opened       Boolean   @default(false)
  openedAt     DateTime?
  clicked      Boolean   @default(false)
  clickedAt    DateTime?
  bounceReason String?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([messageId])
  @@index([recipient])
  @@index([createdAt])
}
```

### Dépannage

**Problème : Les événements n'arrivent pas**
- Vérifiez que le webhook est bien activé dans Brevo
- Vérifiez que l'URL est accessible publiquement
- Consultez les logs Brevo dans "Webhooks" → "Logs"

**Problème : Erreurs dans les logs**
- Les erreurs de mise à jour EmailHistory sont normales si la table n'existe pas
- Elles sont gérées avec des try/catch et n'empêchent pas le fonctionnement

---

## 🔐 Sécurité

### Variables d'environnement requises

Assurez-vous que ces variables sont définies dans Vercel :

```bash
BREVO_API_KEY=votre_clé_api_brevo
BREVO_FROM_EMAIL=contact@laiaconnect.fr
BREVO_FROM_NAME=LAIA Connect
SUPER_ADMIN_EMAIL=contact@laiaconnect.fr
NEXT_PUBLIC_APP_URL=https://www.laiaconnect.fr
```

### Protection des endpoints

Les webhooks Brevo ne nécessitent pas d'authentification particulière car :
- Ils ne retournent pas de données sensibles
- Ils utilisent des URLs non publiques
- Brevo signe les requêtes avec des headers spécifiques

Si vous souhaitez ajouter une couche de sécurité supplémentaire, vous pouvez :
1. Vérifier l'IP d'origine (IPs Brevo : voir documentation Brevo)
2. Ajouter un secret partagé dans l'URL (ex: `?secret=xxx`)

---

## 📊 Résumé des URLs

| Type | URL | Priorité | Statut |
|------|-----|----------|--------|
| Webhook ENTRANT | `https://www.laiaconnect.fr/api/webhooks/email-to-ticket` | 🔴 ESSENTIEL | ✅ Implémenté |
| Webhook SORTANT | `https://www.laiaconnect.fr/api/webhooks/brevo-events` | 🟡 OPTIONNEL | ✅ Implémenté |

---

## ✅ Checklist de configuration

- [ ] Vérifier que le domaine laiaconnect.fr est vérifié dans Brevo
- [ ] Configurer le webhook ENTRANT pour contact@laiaconnect.fr
- [ ] Tester l'envoi d'un email à contact@laiaconnect.fr
- [ ] Vérifier qu'un ticket est créé dans le super-admin
- [ ] (Optionnel) Configurer le webhook SORTANT pour les événements
- [ ] (Optionnel) Créer la table EmailHistory si vous voulez le tracking
- [ ] Vérifier les variables d'environnement dans Vercel
- [ ] Consulter les logs Vercel pour vérifier le bon fonctionnement

---

## 📝 Logs et monitoring

### Consulter les logs Brevo
1. Aller dans Brevo → Webhooks
2. Cliquer sur le webhook configuré
3. Voir l'onglet "Logs" pour les requêtes envoyées et les réponses reçues

### Consulter les logs Vercel
1. Aller dans https://vercel.com/votre-projet
2. Cliquer sur l'onglet "Logs"
3. Filtrer par `/api/webhooks/` pour voir les requêtes webhook

### Logs dans l'application
Les deux endpoints utilisent le logger personnalisé :
```typescript
log.info('Message informatif')
log.warn('Message d'avertissement')
log.error('Message d'erreur', error)
```

---

## 🆘 Support

En cas de problème :
1. Consultez les logs Brevo et Vercel
2. Vérifiez les variables d'environnement
3. Testez les endpoints manuellement avec Postman
4. Contactez le support Brevo si les emails ne sont pas reçus
