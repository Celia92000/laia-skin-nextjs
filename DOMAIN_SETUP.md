# Configuration du domaine laiaconnect.fr

## 🎯 Architecture des domaines

### Domaines principaux
- **laiaconnect.fr** → Landing page / Marketing (Next.js route `/platform`)
- **app.laiaconnect.fr** → Super Admin LAIA (gestion de la plateforme)

### Multi-tenant (wildcard)
- **{institut}.laiaconnect.fr** → Chaque client (ex: laiaskin.laiaconnect.fr)
- Exemples :
  - `laiaskin.laiaconnect.fr` → Laia Skin Institut
  - `beaute-paris.laiaconnect.fr` → Beauté Paris
  - `spa-lyon.laiaconnect.fr` → Spa Lyon

---

## 📋 Étape 1 : Configuration DNS chez Gandi

### Connectez-vous à Gandi

1. Allez sur [https://admin.gandi.net](https://admin.gandi.net)
2. Connectez-vous avec vos identifiants
3. Sélectionnez le domaine **laiaconnect.fr**
4. Allez dans **DNS Records**

### Ajouter les enregistrements DNS

Supprimez les enregistrements par défaut et ajoutez :

```
# Domaine principal + wildcard vers Vercel
Type    Nom                TTL      Valeur
-----------------------------------------------------
A       @                  300      76.76.21.21
A       *                  300      76.76.21.21
CNAME   www                300      cname.vercel-dns.com.
CNAME   app                300      cname.vercel-dns.com.

# Email (optionnel - si vous voulez contact@laiaconnect.fr)
MX      @                  300      10 mail.gandi.net.
TXT     @                  300      "v=spf1 include:_mailcust.gandi.net ?all"
```

**Explications** :
- `@` = domaine racine (laiaconnect.fr)
- `*` = wildcard (tous les sous-domaines : *.laiaconnect.fr)
- `app` = sous-domaine dédié au super admin
- `76.76.21.21` = IP de Vercel pour les domaines A records
- `cname.vercel-dns.com` = CNAME Vercel pour les sous-domaines

### ⏱️ Propagation DNS
Les changements DNS peuvent prendre **5 minutes à 48 heures**. Généralement : 15-30 minutes.

Vérifier la propagation : [https://dnschecker.org](https://dnschecker.org)

---

## 📋 Étape 2 : Configuration Vercel

### 2.1 Ajouter les domaines dans Vercel

```bash
# Via CLI Vercel
vercel domains add laiaconnect.fr
vercel domains add www.laiaconnect.fr
vercel domains add app.laiaconnect.fr
vercel domains add "*.laiaconnect.fr"
```

**OU via l'interface Vercel :**

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **laia-skin-nextjs**
3. Allez dans **Settings** → **Domains**
4. Ajoutez les domaines suivants (un par un) :
   - `laiaconnect.fr`
   - `www.laiaconnect.fr`
   - `app.laiaconnect.fr`
   - `*.laiaconnect.fr` ← **Important pour le multi-tenant**

5. Pour chaque domaine, Vercel va :
   - Vérifier la configuration DNS
   - Générer un certificat SSL automatiquement (Let's Encrypt)
   - Activer HTTPS

### 2.2 Configuration du domaine principal

Dans Vercel, définissez **laiaconnect.fr** comme domaine de production principal.

---

## 📋 Étape 3 : Configuration Next.js

### 3.1 Mettre à jour .env.local

```bash
# Dans /home/celia/laia-github-temp/laia-skin-nextjs/.env.local

# Domaine de production
NEXT_PUBLIC_APP_URL="https://laiaconnect.fr"

# Domaine Super Admin
NEXT_PUBLIC_SUPER_ADMIN_URL="https://app.laiaconnect.fr"

# Pattern wildcard pour les clients
NEXT_PUBLIC_TENANT_DOMAIN="laiaconnect.fr"
```

### 3.2 Mettre à jour .env.example

Ajoutez ces variables dans `.env.example` pour la documentation :

```bash
# URL de l'application (domaine principal)
NEXT_PUBLIC_APP_URL="https://laiaconnect.fr"

# URL Super Admin
NEXT_PUBLIC_SUPER_ADMIN_URL="https://app.laiaconnect.fr"

# Domaine pour multi-tenant
NEXT_PUBLIC_TENANT_DOMAIN="laiaconnect.fr"
```

### 3.3 Déployer sur Vercel

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs

# Vérifier que tout fonctionne en local
npm run build

# Déployer en production
vercel --prod
```

**OU** via Git :
```bash
git add .
git commit -m "Configure laiaconnect.fr domain"
git push origin main
# Vercel déploie automatiquement
```

---

## 📋 Étape 4 : Configuration des Variables d'Environnement sur Vercel

### Via l'interface Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez ces variables pour **Production** :

```
NEXT_PUBLIC_APP_URL = https://laiaconnect.fr
NEXT_PUBLIC_SUPER_ADMIN_URL = https://app.laiaconnect.fr
NEXT_PUBLIC_TENANT_DOMAIN = laiaconnect.fr
```

3. **Redéployez** le projet pour appliquer les changements

### Via CLI

```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Entrer : https://laiaconnect.fr

vercel env add NEXT_PUBLIC_SUPER_ADMIN_URL production
# Entrer : https://app.laiaconnect.fr

vercel env add NEXT_PUBLIC_TENANT_DOMAIN production
# Entrer : laiaconnect.fr
```

---

## 📋 Étape 5 : Tester le Multi-Tenant

### 5.1 Créer une organisation de test

1. Connectez-vous au Super Admin : `https://app.laiaconnect.fr/super-admin`
2. Allez dans **Organisations** → **Nouvelle organisation**
3. Créez une organisation avec :
   - **Nom** : Test Institut
   - **Slug** : test-institut
   - **Sous-domaine** : test-institut
   - **Plan** : Solo (essai gratuit)

### 5.2 Accéder au site client

Une fois créée, vous pourrez accéder à :
- `https://test-institut.laiaconnect.fr` → Site vitrine du client
- `https://test-institut.laiaconnect.fr/admin` → Admin du client
- `https://test-institut.laiaconnect.fr/espace-client` → Espace client

---

## 🎨 Personnalisation par organisation

Chaque organisation peut avoir :
- **Son propre domaine custom** (ex: beaute-paris.fr → redirige vers beaute-paris.laiaconnect.fr)
- **Sa propre config** dans `SiteConfig` (nom, logo, couleurs, etc.)
- **Ses propres utilisateurs** isolés dans la BDD
- **Ses propres services** et prestations

---

## 🔒 Sécurité SSL/HTTPS

Vercel gère automatiquement :
- ✅ Certificats SSL (Let's Encrypt)
- ✅ Renouvellement automatique
- ✅ HTTPS obligatoire (redirection HTTP → HTTPS)
- ✅ HTTP/2 et HTTP/3

---

## 📊 URLs finales

| URL | Description | Utilisateurs |
|-----|-------------|--------------|
| `https://laiaconnect.fr` | Landing page marketing | Prospects |
| `https://laiaconnect.fr/platform` | Page produit LAIA Connect | Prospects |
| `https://app.laiaconnect.fr` | Super Admin LAIA | Vous (Super Admin) |
| `https://{slug}.laiaconnect.fr` | Site client | Chaque institut client |

---

## 🚀 Checklist finale

Avant de lancer en production :

### DNS & Domaines
- [ ] DNS configurés chez Gandi (A + CNAME + wildcard)
- [ ] Domaines ajoutés dans Vercel (4 domaines)
- [ ] SSL actif sur tous les domaines (cadenas vert 🔒)
- [ ] Propagation DNS complète (tester avec dnschecker.org)

### Configuration Next.js
- [ ] Variables d'environnement mises à jour dans Vercel
- [ ] `.env.local` mis à jour en local
- [ ] Redéploiement effectué
- [ ] Middleware multi-tenant testé

### Tests
- [ ] `https://laiaconnect.fr` → Landing page fonctionne
- [ ] `https://app.laiaconnect.fr/super-admin` → Connexion Super Admin OK
- [ ] `https://test-institut.laiaconnect.fr` → Site client test OK
- [ ] Créer/modifier une organisation → Fonctionne
- [ ] Isolation des données entre organisations → Vérifié

### Email (optionnel)
- [ ] Configurer contact@laiaconnect.fr chez Gandi
- [ ] Configurer Resend avec le domaine custom
- [ ] Vérifier les SPF/DKIM records

---

## 🆘 Troubleshooting

### "Domain not found" sur Vercel
→ Vérifier que les DNS A et CNAME pointent bien vers Vercel
→ Attendre 30 min pour la propagation DNS

### "SSL Certificate Error"
→ Vercel génère le certificat automatiquement sous 1h
→ Forcer le renouvellement dans Vercel Settings → Domains

### Wildcard ne fonctionne pas
→ Vérifier que `*.laiaconnect.fr` est ajouté dans Vercel Domains
→ Vérifier le middleware Next.js (détection du sous-domaine)

### Organisation inaccessible
→ Vérifier que le `subdomain` dans la BDD correspond au sous-domaine utilisé
→ Vérifier que l'organisation est `status: ACTIVE`

---

## 📞 Support

En cas de problème :
- Documentation Vercel : [https://vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- Support Gandi : [https://www.gandi.net/fr/contact](https://www.gandi.net/fr/contact)
- Documentation LAIA : Voir `/docs` dans le projet

---

**Dernière mise à jour** : 29 octobre 2025
**Domaine** : laiaconnect.fr (Gandi)
**Hébergement** : Vercel
