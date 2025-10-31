# ⚡ Copie Rapide Variables - 10 minutes chrono

## ✅ Déjà fait automatiquement

Les 3 variables spécifiques institut ont été ajoutées au projet `laia-skin-nextjs` :
- ✅ `NEXT_PUBLIC_SITE_TYPE=institut`
- ✅ `NEXT_PUBLIC_APP_URL=https://laiaskininstitut.fr`
- ✅ `NEXT_PUBLIC_TENANT_DOMAIN=laiaskininstitut.fr`

---

## 📋 À faire : Copier 26 variables (10 min)

### **Méthode la plus rapide**

1. **Ouvre 2 onglets** :

   **Onglet 1 (SOURCE)** :
   https://vercel.com/celia92000s-projects/laia-skin-institut-as92/settings/environment-variables

   **Onglet 2 (DESTINATION)** :
   https://vercel.com/celia92000s-projects/laia-skin-nextjs/settings/environment-variables

2. **Pour chaque variable** dans la liste ci-dessous :
   - Dans **Onglet 1** : Clique sur `•••` → **Edit** → **Copie la Value** (Ctrl+C)
   - Dans **Onglet 2** : **Add** → Colle le **Name** → Colle la **Value** (Ctrl+V)
   - Coche **✅ Production ✅ Preview ✅ Development**
   - Clique **Save**

---

## 📝 Liste des 26 variables à copier

Copie dans cet ordre (du plus important au moins important) :

### **🔐 Base de données (2)** - PRIORITÉ 1
```
1. DATABASE_URL
2. DIRECT_URL
```

### **🔑 Sécurité (2)** - PRIORITÉ 1
```
3. JWT_SECRET
4. ENCRYPTION_KEY
```

### **☁️ Supabase (2)** - PRIORITÉ 1
```
5. NEXT_PUBLIC_SUPABASE_URL
6. NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### **📧 Email (7)** - PRIORITÉ 2
```
7. RESEND_API_KEY
8. EMAIL_FROM
9. EMAIL_API_KEY
10. BREVO_API_KEY
11. BREVO_FROM_EMAIL
12. BREVO_FROM_NAME
13. VERIFIED_EMAIL_DOMAIN
```

### **💬 WhatsApp (6)** - PRIORITÉ 2
```
14. WHATSAPP_PROVIDER
15. NEXT_PUBLIC_WHATSAPP_NUMBER
16. WHATSAPP_ACCESS_TOKEN
17. WHATSAPP_PHONE_NUMBER_ID
18. WHATSAPP_BUSINESS_ACCOUNT_ID
19. WHATSAPP_WEBHOOK_VERIFY_TOKEN
20. WHATSAPP_API_VERSION
```

### **💳 Stripe (4)** - PRIORITÉ 2
```
21. STRIPE_SECRET_KEY
22. STRIPE_PUBLISHABLE_KEY
23. STRIPE_WEBHOOK_SECRET
24. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### **⚙️ Autres (2)** - PRIORITÉ 3
```
25. NEXT_PUBLIC_API_URL
26. CRON_SECRET
```

---

## ✅ Vérification rapide

Une fois fini, vérifie que tu as bien **29 variables au total** dans le projet `laia-skin-nextjs` :
- 3 spécifiques institut (déjà faites ✅)
- 26 copiées depuis le projet SaaS

---

## 🚀 Prochaine étape

Une fois les variables copiées, dis-moi "c'est fait" et je configurerai les domaines automatiquement !

---

**⏱️ Temps estimé : 10 minutes**

**💡 Astuce** : Tu peux garder un Notepad ouvert pour copier-coller temporairement si besoin.
