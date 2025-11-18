# 📧 Configuration de Resend pour les emails personnalisés

## 🚀 Étapes pour configurer Resend (GRATUIT - 100 emails/jour)

### 1. Créer un compte Resend
1. Allez sur https://resend.com
2. Cliquez sur "Sign up" (inscription gratuite)
3. Confirmez votre email

### 2. Obtenir votre clé API
1. Une fois connecté, allez dans le Dashboard
2. Cliquez sur "API Keys" dans le menu
3. Cliquez sur "Create API Key"
4. Donnez un nom (ex: "LAIA SKIN")
5. Copiez la clé qui commence par `re_`

### 3. Configurer dans votre projet
1. Ouvrez le fichier `.env.local`
2. Ajoutez cette ligne :
```
RESEND_API_KEY=re_VOTRE_CLE_ICI
```
3. Remplacez `re_VOTRE_CLE_ICI` par votre vraie clé

### 4. Redémarrer le serveur
```bash
# Arrêtez le serveur (Ctrl+C)
# Redémarrez
npm run dev
```

## ✅ Test
1. Allez sur http://localhost:3001/admin
2. Onglet "Emailing" > "Composer"
3. Sélectionnez un client
4. Écrivez un message personnalisé
5. Envoyez !

## 🎯 Avantages de Resend
- ✅ **100 emails gratuits par jour**
- ✅ **Emails vraiment personnalisés** (pas de template fixe)
- ✅ **HTML professionnel** avec votre design
- ✅ **Statistiques** d'ouverture et de clic
- ✅ **Pas de limite de templates**

## 📊 Comparaison

| Service | Gratuit | Templates | Personnalisation |
|---------|---------|-----------|------------------|
| EmailJS | 200/mois | 2 max (gratuit) | Limitée |
| Resend | 100/jour | Illimité | Totale |
| Gandi SMTP | Inclus | Illimité | Totale |

## 🔧 Si vous voulez utiliser votre domaine
Plus tard, vous pourrez :
1. Vérifier votre domaine dans Resend
2. Envoyer depuis `contact@laiaskininstitut.fr`
3. Avoir une meilleure délivrabilité

## ⚠️ Important
- Les emails de test utilisent `onboarding@resend.dev`
- C'est normal et gratuit
- Les emails arrivent quand même !

## 💡 Alternative : Gandi SMTP
Si vous préférez utiliser votre email Gandi directement :
- Utilisez nodemailer avec vos identifiants Gandi
- Configuration plus complexe mais 100% avec votre domaine