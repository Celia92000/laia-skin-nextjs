# 🔧 Comment ajouter WhatsApp aux assets de votre System User

## ❌ Problème actuel
Vous avez:
- ✅ Instagram (@laia.skin) - Contrôle total
- ✅ Facebook (Célia IVORRA) - Contrôle total  
- ❌ **WhatsApp manquant**

## 📱 Solution: Ajouter WhatsApp Business Account

### Méthode 1: Via Business Settings (Recommandé)

1. **Allez dans Business Settings**:
   ```
   https://business.facebook.com/settings/system-users
   ```

2. **Sélectionnez votre System User** (Célia IVORRA)

3. **Cliquez sur "Add Assets"** ou "Ajouter des actifs"

4. **Dans la fenêtre qui s'ouvre**:
   - Sélectionnez l'onglet **"WhatsApp Accounts"** (pas Instagram, pas Facebook)
   - Si vous ne voyez pas cet onglet, cherchez **"Apps"** d'abord

5. **Sélectionnez votre WhatsApp Business Account**:
   - Il devrait s'appeler quelque chose comme "LAIA Skin Institut WhatsApp"
   - Ou afficher le numéro +33 6 83 71 70 50

6. **Permissions à donner**:
   - ✅ **Manage WhatsApp** (Gérer WhatsApp)
   - ✅ **View WhatsApp** (Voir WhatsApp)
   - Ou simplement **"Full Control"** (Contrôle total)

### Méthode 2: Via l'App Facebook

1. **Allez sur votre App**:
   ```
   https://developers.facebook.com/apps/
   ```
   Sélectionnez votre app LAIA Skin Institut

2. **Dans le menu gauche**:
   - WhatsApp → Configuration
   - Ou WhatsApp → Getting Started

3. **System User Access**:
   - Cherchez "System User Access" ou "Accès utilisateur système"
   - Ajoutez Célia IVORRA
   - Donnez les permissions WhatsApp

### Méthode 3: Si WhatsApp n'apparaît nulle part

**Vérifiez d'abord que WhatsApp est activé**:

1. **Dans votre App Facebook**:
   - Produits → Ajouter un produit
   - Cherchez "WhatsApp"
   - Cliquez "Configurer"

2. **Créez/Liez votre WhatsApp Business Account**:
   - WhatsApp → Démarrage rapide
   - Suivez les étapes pour créer ou lier un compte WhatsApp Business

3. **Une fois WhatsApp configuré**, retournez ajouter l'asset au System User

## 🔍 Où voir si WhatsApp est bien ajouté?

Une fois ajouté, vous devriez voir dans la liste des assets:

```
Instagram
@laia.skin
Contrôle total

Facebook  
Célia IVORRA
Contrôle total

WhatsApp Business Account ← NOUVEAU
+33 6 83 71 70 50
Contrôle total
```

## 🎯 Après avoir ajouté WhatsApp

1. **Générez un nouveau token**:
   - System Users → Célia IVORRA
   - Generate Token
   - **IMPORTANT**: Cochez les permissions WhatsApp:
     - ✅ whatsapp_business_messaging
     - ✅ whatsapp_business_management
     - ✅ business_management

2. **Le nouveau token aura accès à**:
   - Instagram ✅
   - Facebook ✅
   - WhatsApp ✅

## 💡 Si vous ne trouvez pas WhatsApp Business Account

Cela peut signifier que:

1. **Le compte WhatsApp n'est pas créé**:
   - Allez sur: https://business.facebook.com/wa/manage/home/
   - Créez un nouveau WhatsApp Business Account
   - Ajoutez votre numéro +33 6 83 71 70 50

2. **Le compte existe mais n'est pas lié à votre Business Manager**:
   - Business Settings → Accounts → WhatsApp Business Accounts
   - Cliquez "Add" ou "Request Access"
   - Entrez l'ID du compte ou demandez l'accès

## 🚨 Solution alternative rapide

Si vous êtes bloqué, créez un token temporaire directement depuis WhatsApp:

1. **Allez sur**:
   ```
   https://developers.facebook.com/apps/[VOTRE_APP_ID]/whatsapp-business/wa-dev-console/
   ```

2. **API Access**:
   - Temporary access token → Generate
   - Ce token aura automatiquement les bonnes permissions
   - Valide 24h seulement mais permet de tester

## ✅ Résultat attendu

Après configuration correcte, le test devrait montrer:
```
Permissions actives:
✅ whatsapp_business_messaging
✅ whatsapp_business_management
✅ business_management
✅ public_profile
```

Et non pas seulement:
```
✅ public_profile (actuellement)
```