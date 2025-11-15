# 🌐 Guide : Configurer votre domaine personnalisé

Vous souhaitez utiliser votre propre nom de domaine au lieu du sous-domaine LAIA Connect ?
Exemple : `www.votre-institut.fr` au lieu de `votre-institut.laia-connect.fr`

---

## 📋 Prérequis

- ✅ Avoir acheté un nom de domaine (chez OVH, Gandi, Google Domains, etc.)
- ✅ Avoir accès à la gestion DNS de votre domaine
- ✅ Votre institut configuré sur LAIA Connect avec un slug unique

---

## 🎯 Étape 1 : Contacter le support LAIA

**Avant toute configuration DNS**, contactez-nous pour activer votre domaine personnalisé :

📧 **Email** : support@laia-connect.fr
💬 **WhatsApp** : [Votre numéro support]

**Informations à fournir :**
- Votre nom de domaine (ex: `beaute-zen.fr`)
- Votre slug actuel (ex: `beaute-zen-paris`)
- Souhaitez-vous `www.beaute-zen.fr` ou `beaute-zen.fr` (ou les deux) ?

⏱️ **Délai** : Activation sous 24h ouvrées

---

## 🔧 Étape 2 : Configuration DNS (après validation LAIA)

Une fois que nous aurons validé votre demande, vous devrez ajouter ces enregistrements DNS :

### **Option A : Utiliser www.votre-domaine.fr (Recommandé)**

Connectez-vous à votre interface DNS et ajoutez :

```
Type  | Nom       | Valeur
------|-----------|--------------------------------
CNAME | www       | votre-slug.laia-connect.fr
A     | @         | 76.76.21.21 (redirection vers www)
```

### **Option B : Utiliser votre-domaine.fr (sans www)**

```
Type  | Nom       | Valeur
------|-----------|--------------------------------
A     | @         | 76.76.21.21
AAAA  | @         | 2606:4700:4700::1111
CNAME | www       | votre-slug.laia-connect.fr
```

---

## 📝 Guides par registrar

### **OVH**
1. Connectez-vous à votre compte OVH
2. Allez dans `Web Cloud` > `Noms de domaine`
3. Sélectionnez votre domaine
4. Onglet `Zone DNS`
5. Cliquez sur `Ajouter une entrée`
6. Ajoutez les enregistrements ci-dessus

📖 [Documentation OVH](https://docs.ovh.com/fr/domains/editer-ma-zone-dns/)

---

### **Gandi**
1. Connectez-vous à votre compte Gandi
2. Allez dans `Mes Domaines`
3. Cliquez sur votre domaine
4. Onglet `Enregistrements DNS`
5. Ajoutez les enregistrements

📖 [Documentation Gandi](https://docs.gandi.net/fr/dns/zone/edit.html)

---

### **Google Domains**
1. Connectez-vous à Google Domains
2. Sélectionnez votre domaine
3. Menu `DNS` dans la barre latérale
4. Descendez à "Enregistrements personnalisés"
5. Ajoutez les enregistrements

📖 [Documentation Google Domains](https://support.google.com/domains/answer/3290309)

---

### **Cloudflare**
1. Connectez-vous à Cloudflare
2. Sélectionnez votre domaine
3. Onglet `DNS`
4. Cliquez sur `Add record`
5. Ajoutez les enregistrements
6. ⚠️ **Important** : Désactivez le proxy Cloudflare (icône nuage gris) pour le CNAME

📖 [Documentation Cloudflare](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)

---

## ⏱️ Délais de propagation

Après configuration DNS :
- **Minimum** : 15 minutes
- **Moyen** : 2-4 heures
- **Maximum** : 48 heures

💡 **Astuce** : Vérifiez la propagation sur [whatsmydns.net](https://www.whatsmydns.net/)

---

## ✅ Vérification

Une fois la propagation terminée, votre site sera accessible sur :
- ✅ `www.votre-domaine.fr` (si configuré)
- ✅ `votre-domaine.fr` (si configuré)
- ✅ `votre-slug.laia-connect.fr` (toujours actif)

---

## 🔒 HTTPS / SSL

Le certificat SSL (HTTPS) sera automatiquement généré par LAIA Connect dans les 15 minutes suivant la propagation DNS.

🔐 Votre site sera sécurisé : `https://www.votre-domaine.fr`

---

## ❓ Problèmes fréquents

### Mon site ne s'affiche pas après 48h

1. Vérifiez que les enregistrements DNS sont bien configurés
2. Utilisez [whatsmydns.net](https://www.whatsmydns.net/) pour vérifier la propagation
3. Contactez le support LAIA : support@laia-connect.fr

### J'ai "Erreur de certificat SSL"

- Le certificat est en cours de génération (15-30 min après propagation)
- Attendez 1 heure et actualisez

### Mon ancien site s'affiche encore

- Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)
- Essayez en navigation privée

---

## 💡 Besoin d'aide ?

Notre équipe support est là pour vous accompagner :

📧 **Email** : support@laia-connect.fr
💬 **Chat** : Depuis votre dashboard LAIA
📞 **Téléphone** : [Votre numéro]
⏰ **Horaires** : Lun-Ven 9h-18h

---

**🎉 Votre site sur votre propre domaine, c'est plus professionnel !**
