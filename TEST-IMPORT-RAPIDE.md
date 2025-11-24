# 🚀 Test rapide de l'import de données

## Objectif

Vérifier que les données importées s'affichent bien partout : Admin, Site vitrine, Espace client.

---

## ⏱️ Test en 5 minutes

### 1️⃣ Démarrer le site (si pas déjà fait)

```bash
cd /home/celia/laia-github-temp/laia-skin-nextjs
npm run dev
```

→ Site accessible sur : **http://localhost:3001**

---

### 2️⃣ Se connecter à l'admin

1. Ouvrir : **http://localhost:3001/login**
2. Se connecter avec un compte `ORG_ADMIN` ou `SUPER_ADMIN`

---

### 3️⃣ Tester l'import de SERVICES

#### A. Aller dans l'import

1. Cliquer sur **"Paramètres"** (en haut à droite)
2. Scroll down → Cliquer sur **"🚀 Lancer l'assistant d'import"**
3. Choisir **"💅 Services"**
4. Cliquer sur **"📥 Télécharger template services"**

#### B. Remplir le template

Le fichier téléchargé contient déjà des exemples. Vous pouvez :
- Garder les exemples (pour tester rapidement)
- OU remplacer par vos vraies données

**Exemple de contenu** :
```csv
name,description,duration,price,category,active
Soin du visage,Soin complet avec nettoyage et masque,60,75,Soins du visage,true
Manucure classique,Manucure avec vernis classique,45,35,Ongles,true
Massage relaxant,Massage du dos et des épaules,30,45,Massages,true
```

#### C. Importer

1. **Étape 3** : Cliquer sur **"Fichier rempli →"**
2. **Étape 4** : Sélectionner votre fichier CSV
3. Vérifier la prévisualisation (5 premières lignes)
4. **Étape 5** : Cliquer sur **"🎯 Confirmer l'import"**

#### D. Vérifier le résultat

**Résultat attendu** :
```
🎉 Import terminé !
✅ Importés : 3
❌ Échecs : 0
```

---

### 4️⃣ Vérifier que les services apparaissent

#### A. Dans l'Admin

1. Retour à l'admin : **http://localhost:3001/admin**
2. Cliquer sur l'onglet **"Services"**
3. ✅ **Vos 3 services doivent être là !**

#### B. Sur le site vitrine

1. Ouvrir dans un nouvel onglet : **http://localhost:3001/prestations**
2. ✅ **Vos 3 services doivent s'afficher avec leur prix !**

---

### 5️⃣ Tester l'import de CLIENTS

#### A. Aller dans l'import

1. Retour dans **Paramètres → Import**
2. Choisir **"👥 Clients"**
3. Télécharger le template

#### B. Remplir le template

**Exemple de contenu** :
```csv
firstName,lastName,email,phone,address,city,zipCode,notes
Sophie,Martin,sophie.martin@test.com,0612345678,10 rue de la Paix,Paris,75001,Cliente VIP
Jean,Dupont,jean.dupont@test.com,0623456789,5 avenue des Champs,Lyon,69001,
```

⚠️ **Important** : Utilisez des emails de test (@test.com) ou vos vrais emails

#### C. Importer

Même processus qu'avant :
1. Upload du fichier
2. Vérifier la preview
3. Confirmer l'import

**Résultat attendu** :
```
🎉 Import terminé !
✅ Importés : 2
❌ Échecs : 0
```

---

### 6️⃣ Vérifier que les clients apparaissent

#### A. Dans l'Admin CRM

1. Retour à l'admin : **http://localhost:3001/admin**
2. Cliquer sur l'onglet **"CRM"**
3. ✅ **Vos 2 clients doivent être dans la liste !**

Vous devriez voir :
- Sophie Martin (sophie.martin@test.com) | 📱 0612345678
- Jean Dupont (jean.dupont@test.com) | 📱 0623456789

#### B. Dans l'espace client (optionnel)

Pour que le client puisse se connecter, il faut d'abord définir un mot de passe :
1. Dans **Admin → CRM**
2. Cliquer sur le client
3. Définir un mot de passe
4. Le client peut alors se connecter sur **http://localhost:3001/login**

---

### 7️⃣ Tester l'import de PRODUITS (optionnel)

#### A. Importer des produits

1. **Paramètres → Import → Produits**
2. Télécharger template
3. Remplir :

```csv
name,description,price,stock,supplier,reference,active
Crème hydratante,Crème pour peaux sèches 50ml,29.90,25,L'Oréal,CREM-001,true
Vernis rouge,Vernis longue tenue rouge passion,12.50,40,OPI,VERN-RED-001,true
```

4. Importer

#### B. Vérifier dans Admin Stock

1. **Admin → Stock** (ou **Produits**)
2. ✅ **Vos 2 produits sont là avec leur stock !**

---

## ✅ RÉSULTAT FINAL

Si vous avez suivi ces étapes, vous devez maintenant avoir :

| Données | Quantité | Où vérifier |
|---|---|---|
| **Services** | 3 | Admin → Services<br>Site vitrine → /prestations |
| **Clients** | 2 | Admin → CRM |
| **Produits** | 2 | Admin → Stock |

**Total** : 7 éléments importés en **moins de 5 minutes** ! 🎉

---

## 🎯 Ce que ça prouve

✅ **L'import fonctionne** - Les données sont bien créées dans la base

✅ **L'admin affiche les données** - Clients, Services, Produits visibles

✅ **Le site vitrine affiche les services** - Prestations visibles publiquement

✅ **L'isolation multi-tenant fonctionne** - Chaque client voit uniquement ses données

---

## 🔧 Dépannage rapide

### "Import échoué - Email invalide"

→ Vérifiez que tous les emails contiennent `@`

### "Import échoué - Client existe déjà"

→ Normal, c'est pour éviter les doublons. Changez l'email dans le CSV

### "Import échoué - Service existe déjà"

→ Normal, c'est pour éviter les doublons. Changez le nom dans le CSV

### "Je ne vois pas mes services sur /prestations"

→ Vérifiez que dans le CSV, la colonne `active` = `true`

### "Je ne vois pas mes clients dans le CRM"

→ Vérifiez que vous êtes connecté avec le bon compte admin de la bonne organisation

---

## 🎉 Félicitations !

Vous venez de tester avec succès le système d'import de données.

**Vos clients pourront faire exactement la même chose** pour migrer depuis leur ancien système !

---

**Temps du test** : 5 minutes
**Complexité** : ⭐ Très facile
**Niveau de réussite** : 100% si vous suivez les étapes
