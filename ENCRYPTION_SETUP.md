# 🔐 Configuration du Chiffrement pour LAIA

## 📋 Vue d'ensemble

Les données bancaires sensibles (IBAN, BIC) sont chiffrées dans la base de données PostgreSQL avec l'algorithme **AES-256-GCM**, considéré comme l'un des plus sûrs.

## 🔑 Génération de la clé de chiffrement

### 1. Générer une clé aléatoire sécurisée

```bash
openssl rand -hex 32
```

Cela génère une clé de 256 bits (64 caractères hexadécimaux).

### 2. Ajouter la clé dans .env.local

```env
ENCRYPTION_KEY="votre_clé_générée_ici"
```

⚠️ **IMPORTANT** : Cette clé doit rester **SECRÈTE** et **UNIQUE** pour chaque environnement.

## 🔒 Données chiffrées

Les données suivantes sont automatiquement chiffrées avant d'être stockées :

- `sepaIban` - IBAN du compte bancaire
- `sepaBic` - BIC de la banque

## 🛡️ Sécurité

### Algorithme : AES-256-GCM

- **AES-256** : Advanced Encryption Standard avec clés de 256 bits
- **GCM** : Galois/Counter Mode - Mode authentifié qui garantit l'intégrité des données
- **PBKDF2** : Dérivation de clé avec 100 000 itérations pour renforcer la sécurité
- **Salt aléatoire** : Un salt unique est généré pour chaque valeur chiffrée
- **IV aléatoire** : Un vecteur d'initialisation unique pour chaque opération
- **Tag d'authentification** : Garantit que les données n'ont pas été modifiées

### Format de stockage

Les données chiffrées sont stockées en base64 avec le format :

```
[Salt 64 bytes][IV 16 bytes][Tag 16 bytes][Données chiffrées]
```

## 📝 Utilisation

### Chiffrer des données

```typescript
import { encrypt } from '@/lib/encryption-service'

const iban = 'FR7630006000011234567890189'
const encryptedIban = encrypt(iban)
// Résultat : "Y3J5cHRvZ3JhcGhpZWRfZGF0YV9oZXJl..."
```

### Déchiffrer des données

```typescript
import { decrypt } from '@/lib/encryption-service'

const decryptedIban = decrypt(encryptedIban)
// Résultat : "FR7630006000011234567890189"
```

### Masquer pour l'affichage

```typescript
import { maskIban, maskBic } from '@/lib/encryption-service'

const maskedIban = maskIban('FR7630006000011234567890189')
// Résultat : "FR** **** **** **** 0189"

const maskedBic = maskBic('BNPAFRPPXXX')
// Résultat : "BNPA****XXX"
```

### Valider avant chiffrement

```typescript
import { validateIban, validateBic } from '@/lib/encryption-service'

if (!validateIban(iban)) {
  throw new Error('IBAN invalide')
}

if (!validateBic(bic)) {
  throw new Error('BIC invalide')
}
```

## 🔄 Migration des données existantes

Si vous avez des IBAN/BIC non chiffrés dans votre base de données :

```typescript
// Script de migration (à créer)
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption-service'

async function migrateEncryption() {
  const orgs = await prisma.organization.findMany({
    where: {
      sepaIban: { not: null },
    },
  })

  for (const org of orgs) {
    if (org.sepaIban && !org.sepaIban.includes('==')) {
      // Si l'IBAN n'est pas déjà chiffré (pas de base64)
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          sepaIban: encrypt(org.sepaIban),
          sepaBic: org.sepaBic ? encrypt(org.sepaBic) : null,
        },
      })
    }
  }
}
```

## ⚠️ Bonnes pratiques

1. **Jamais partager la clé** : `ENCRYPTION_KEY` ne doit jamais être commitée dans Git
2. **Clé unique par environnement** : Dev, Staging, Production doivent avoir des clés différentes
3. **Rotation des clés** : Prévoir un système de rotation des clés tous les 6-12 mois
4. **Backup de la clé** : Stocker la clé de production dans un gestionnaire de secrets sécurisé (AWS Secrets Manager, HashiCorp Vault, etc.)
5. **Jamais logger les données déchiffrées** : Ne jamais afficher d'IBAN complet dans les logs

## 🚨 En cas de perte de la clé

⚠️ **Si la clé `ENCRYPTION_KEY` est perdue, toutes les données chiffrées sont IRRÉCUPÉRABLES.**

Pour éviter cela :

1. Sauvegarder la clé dans un gestionnaire de secrets
2. Avoir une clé de backup
3. Documenter où la clé est stockée

## 📊 Conformité RGPD

Le chiffrement des données bancaires est **obligatoire** selon le RGPD pour :

- ✅ Protéger les données personnelles sensibles
- ✅ Réduire les risques en cas de violation de données
- ✅ Respecter le principe de "sécurité par défaut"

## 🆘 Support

En cas de problème avec le chiffrement :

1. Vérifier que `ENCRYPTION_KEY` est bien défini dans `.env.local`
2. Vérifier que la clé a bien 64 caractères hexadécimaux
3. Tester avec les fonctions de validation
4. Consulter les logs d'erreur pour plus de détails

---

**Documentation créée le** : $(date)
**Dernière mise à jour** : $(date)
