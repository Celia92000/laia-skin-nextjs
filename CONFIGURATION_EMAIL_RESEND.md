# Configuration Email Resend - SPF/DKIM

## 🎯 Objectif
Configurer les enregistrements DNS SPF et DKIM pour éviter que les emails LAIA Connect soient marqués comme spam.

---

## 📧 Domaine d'envoi actuel

**Variable d'environnement** : `RESEND_FROM_EMAIL`

Exemple : `contact@laiaconnect.fr` ou `noreply@laiaconnect.fr`

---

## 🔧 Étapes de Configuration

### 1️⃣ Se connecter à Resend Dashboard

1. Aller sur https://resend.com/login
2. Se connecter avec le compte LAIA Connect
3. Aller dans **Domains** (menu gauche)

### 2️⃣ Ajouter le domaine

1. Cliquer sur **Add Domain**
2. Entrer le domaine : `laiaconnect.fr`
3. Cliquer sur **Add**

### 3️⃣ Récupérer les enregistrements DNS

Resend va afficher les enregistrements DNS à ajouter. Ils ressembleront à ceci :

#### **SPF Record (TXT)**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### **DKIM Record (TXT)**
```
Type: TXT
Name: resend._domainkey
Value: [Longue clé DKIM fournie par Resend]
TTL: 3600
```

#### **DKIM Record 2 (CNAME) - Alternative**
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600
```

#### **DMARC Record (TXT) - Recommandé**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@laiaconnect.fr
TTL: 3600
```

---

## 📝 Configuration DNS (chez votre registrar)

### Où configurer ?
Allez chez votre **registrar de domaine** (OVH, Gandi, Cloudflare, etc.) :

1. Se connecter à votre compte
2. Aller dans **Gestion DNS** pour `laiaconnect.fr`
3. Ajouter les enregistrements DNS fournis par Resend

### Exemple avec Cloudflare :

1. **Dashboard Cloudflare** > Sélectionner `laiaconnect.fr`
2. **DNS** > **Records**
3. Cliquer sur **Add Record**
4. Ajouter chaque enregistrement :

**SPF :**
- Type : `TXT`
- Name : `@`
- Content : `v=spf1 include:_spf.resend.com ~all`
- TTL : `Auto`
- Proxy : `DNS only` (cliquer sur l'icône nuage orange pour le désactiver)

**DKIM :**
- Type : `TXT`
- Name : `resend._domainkey`
- Content : `[Coller la clé DKIM de Resend]`
- TTL : `Auto`
- Proxy : `DNS only`

**DMARC :**
- Type : `TXT`
- Name : `_dmarc`
- Content : `v=DMARC1; p=none; rua=mailto:dmarc@laiaconnect.fr`
- TTL : `Auto`

---

## ⏱️ Propagation DNS

**Attention** : La propagation DNS peut prendre de **30 minutes à 48 heures**.

### Vérifier la propagation :

1. **Sur Resend Dashboard** : Le domaine affichera "Verified" une fois les enregistrements détectés
2. **Via outil en ligne** : https://mxtoolbox.com/SuperTool.aspx
   - Entrer `laiaconnect.fr`
   - Vérifier SPF, DKIM, DMARC

### Commandes terminal (Linux/Mac) :

```bash
# Vérifier SPF
dig TXT laiaconnect.fr | grep spf

# Vérifier DKIM
dig TXT resend._domainkey.laiaconnect.fr

# Vérifier DMARC
dig TXT _dmarc.laiaconnect.fr
```

---

## 🧪 Test d'envoi

Une fois le domaine vérifié dans Resend, tester l'envoi d'un email :

```typescript
// Test via API
await getResend().emails.send({
  from: 'noreply@laiaconnect.fr',
  to: 'votre-email@test.com',
  subject: 'Test SPF/DKIM',
  html: '<p>Si vous recevez cet email sans spam, c\'est que SPF/DKIM fonctionnent !</p>'
});
```

### Vérifier le résultat :

1. Recevoir l'email dans votre boîte de réception (pas spam ✅)
2. Ouvrir l'email
3. **Afficher les en-têtes** (Show Original / Afficher la source)
4. Vérifier :
   - `spf=pass`
   - `dkim=pass`
   - `dmarc=pass`

---

## 📊 Configuration DMARC (Politique)

Une fois SPF/DKIM fonctionnels, renforcer DMARC :

**Étape 1** - Surveillance (actuel) :
```
v=DMARC1; p=none; rua=mailto:dmarc@laiaconnect.fr
```

**Étape 2** - Quarantaine (après 1 mois) :
```
v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@laiaconnect.fr
```

**Étape 3** - Rejet (après 3 mois) :
```
v=DMARC1; p=reject; rua=mailto:dmarc@laiaconnect.fr
```

---

## ⚠️ Problèmes courants

### Email toujours en spam
1. Vérifier que SPF/DKIM sont bien `pass` dans les en-têtes
2. Vérifier la réputation du domaine : https://senderscore.org
3. Attendre 7-14 jours pour que la réputation se construise
4. Envoyer des volumes progressifs (ne pas envoyer 1000 emails le 1er jour)

### Domaine non vérifié dans Resend
1. Attendre 24-48h pour propagation DNS
2. Vérifier les enregistrements DNS avec `dig`
3. Contacter le support Resend si bloqué

### Emails retournés (bounce)
1. Vérifier que l'adresse email existe
2. Vérifier que la boîte n'est pas pleine
3. Ajouter un MX record si le domaine doit recevoir des emails

---

## 📧 Configuration Email de Réception (Optionnel)

Si vous voulez recevoir des emails sur `contact@laiaconnect.fr` :

### MX Records (chez votre hébergeur email) :

**Exemple avec Google Workspace :**
```
Type: MX
Name: @
Priority: 1
Value: aspmx.l.google.com
TTL: 3600
```

**Exemple avec OVH Mail :**
```
Type: MX
Name: @
Priority: 1
Value: mx0.mail.ovh.net
TTL: 3600
```

---

## ✅ Checklist Finale

- [ ] Domaine ajouté dans Resend
- [ ] SPF record ajouté dans DNS
- [ ] DKIM record ajouté dans DNS
- [ ] DMARC record ajouté dans DNS
- [ ] Attendre propagation DNS (24-48h)
- [ ] Vérifier statut "Verified" dans Resend
- [ ] Envoyer email de test
- [ ] Vérifier en-têtes (spf=pass, dkim=pass)
- [ ] Monitorer rapports DMARC pendant 1 mois
- [ ] Passer DMARC en mode `quarantine` puis `reject`

---

## 📚 Ressources

- **Resend Docs** : https://resend.com/docs
- **SPF Checker** : https://mxtoolbox.com/spf.aspx
- **DKIM Checker** : https://mxtoolbox.com/dkim.aspx
- **DMARC Checker** : https://mxtoolbox.com/dmarc.aspx
- **Email Header Analyzer** : https://mxtoolbox.com/EmailHeaders.aspx

---

*Document créé le 2025-01-12*
*LAIA Connect - Configuration Email Production*
