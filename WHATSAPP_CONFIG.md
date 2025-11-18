# 📱 Configuration WhatsApp pour LAIA SKIN

## Copiez ces informations depuis Meta Business Suite

### 1️⃣ Où trouver les informations dans Meta Business :

**Access Token :**
- Allez dans : WhatsApp > API Setup > Access Tokens
- Cliquez sur "Add phone number" si nécessaire
- Puis "Generate new token" 
- Copiez le token qui commence par EAA...

**Phone Number ID :**
- Dans WhatsApp > API Setup
- Section "From" 
- Sous votre numéro de téléphone
- C'est un nombre à 15-16 chiffres

**Business Account ID :**
- C'est le numéro dans votre URL : 449312204128781

---

## 2️⃣ Remplacez ces lignes dans le fichier .env.local :

```
WHATSAPP_ACCESS_TOKEN=COLLEZ_VOTRE_TOKEN_ICI
WHATSAPP_PHONE_NUMBER_ID=COLLEZ_ID_NUMERO_ICI  
WHATSAPP_BUSINESS_ACCOUNT_ID=449312204128781
```

---

## 3️⃣ Pour tester :

1. Allez sur http://localhost:3001/admin
2. Cliquez sur l'onglet "WhatsApp"
3. Utilisez le panneau de test pour envoyer un message à votre numéro

---

## ❓ Problèmes courants :

**"Token invalide"** 
→ Vérifiez que vous avez bien copié tout le token (il est très long)

**"Phone number not registered"**
→ Il faut d'abord enregistrer votre numéro 0683717050 dans Meta Business

**"Message non reçu"**
→ Vérifiez que le destinataire a accepté de recevoir des messages WhatsApp Business

---

## 📞 Votre numéro : 0683717050

Ce numéro doit être vérifié dans Meta Business Suite avant de pouvoir envoyer des messages.