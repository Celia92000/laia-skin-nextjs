# Système d'Analyse IA du Feed Social Media et Génération de Suggestions

## Vue d'ensemble

Ce système utilise l'intelligence artificielle pour analyser votre feed Instagram/Facebook et générer automatiquement des suggestions de contenu personnalisées basées sur votre style unique.

## Architecture

### 1. Modèles Prisma

#### ContentAnalysis
Stocke les analyses du feed social media :
- `toneOfVoice` : Ton de voix détecté (friendly, professional, casual)
- `topHashtags` : Hashtags les plus performants
- `avgEngagement` : Engagement moyen (likes + commentaires)
- `bestPostTypes` : Types de contenu qui fonctionnent le mieux
- `bestPostTimes` : Meilleurs horaires de publication
- `topPosts` : Exemples des posts les plus performants

#### AISuggestion
Stocke les suggestions générées par IA :
- `category` : Catégorie du contenu (conseils, avant-après, etc.)
- `contentType` : Type de publication (post, reel, story)
- `title` : Titre accrocheur
- `content` : Contenu complet du post
- `hashtags` : Hashtags suggérés
- `trendingNote` : Note sur la tendance

### 2. API Routes

#### `/api/admin/social-media/analyze-feed`

**POST** - Analyse le feed Instagram/Facebook

**Paramètres** :
```json
{
  "platform": "instagram" // ou "facebook"
}
```

**Fonctionnalités** :
- Récupère les 30 derniers posts via l'API Meta Graph
- Analyse le tone of voice (détection automatique)
- Extrait les hashtags les plus utilisés
- Calcule l'engagement moyen
- Identifie les types de contenu performants
- Analyse les meilleurs horaires de publication
- Sauvegarde l'analyse en base de données

**Réponse** :
```json
{
  "success": true,
  "analysis": {
    "id": "...",
    "platform": "instagram",
    "toneOfVoice": "friendly",
    "topHashtags": ["#beauty", "#skincare", ...],
    "avgEngagement": 127,
    "bestPostTypes": ["REEL", "CAROUSEL_ALBUM", "IMAGE"],
    "bestPostTimes": ["14:00", "18:00", "09:00"],
    "topPosts": [...],
    "totalPostsAnalyzed": 30,
    "analyzedAt": "2025-01-23T..."
  }
}
```

**GET** - Récupère la dernière analyse

**Query params** :
- `platform` : "instagram" ou "facebook" (optionnel, défaut: instagram)

#### `/api/admin/social-media/generate-suggestions`

**POST** - Génère des suggestions de contenu via OpenAI GPT-4

**Paramètres** :
```json
{
  "contentType": "post", // ou "reel", "story"
  "category": "conseils", // prestations, avant-apres, etc.
  "platform": "instagram" // optionnel
}
```

**Fonctionnalités** :
- Récupère la dernière analyse du feed
- Crée un prompt personnalisé avec le style de l'organisation
- Appelle OpenAI GPT-4 Turbo
- Parse et sauvegarde les suggestions
- Retourne 3 idées de contenu optimisées

**Réponse** :
```json
{
  "success": true,
  "suggestions": [
    {
      "id": "...",
      "title": "Titre accrocheur",
      "content": "Contenu complet du post...",
      "hashtags": "#beauty #skincare ...",
      "trendingNote": "Tendance K-Beauty 2024",
      "category": "conseils",
      "contentType": "post"
    },
    ...
  ]
}
```

**GET** - Récupère les suggestions sauvegardées

**Query params** :
- `category` : Filtrer par catégorie
- `contentType` : Filtrer par type de contenu
- `limit` : Nombre de suggestions (défaut: 10)

### 3. Interface Utilisateur

#### SocialMediaHub.tsx

**Nouveau bouton "Analyser mon feed Instagram"** :
- Onglet "Conseils"
- Appel de l'API d'analyse
- Affichage des résultats dans une modal détaillée

**Modal d'analyse** affiche :
- Tone of voice détecté
- Engagement moyen
- Top hashtags
- Types de contenu performants
- Meilleurs horaires de publication
- Top 5 des meilleurs posts

#### DragDropCalendar.tsx

**Génération automatique de suggestions** :
- Lors de la sélection d'une catégorie dans le formulaire de création de post
- Appel automatique de l'API de génération
- Affichage de 3 suggestions personnalisées
- Possibilité de cliquer sur une suggestion pour remplir le formulaire

**Fallback** :
- En cas d'erreur API, utilisation de suggestions hardcodées
- Assure une expérience utilisateur fluide même sans OpenAI

## Configuration

### 1. Variables d'environnement

Ajoutez dans votre fichier `.env` :

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

Pour obtenir une clé OpenAI :
1. Créez un compte sur https://platform.openai.com
2. Allez dans "API Keys"
3. Créez une nouvelle clé API
4. Copiez la clé dans votre .env

### 2. Configuration Instagram/Facebook

Les tokens Instagram/Facebook doivent être configurés dans l'onglet "Paramètres" de l'interface admin.

### 3. Migration de la base de données

Exécutez la migration SQL :

```bash
# Connectez-vous à votre base de données PostgreSQL
psql -U postgres -d votre_base_de_donnees -f MIGRATION_AI_CONTENT.sql
```

Ou si vous utilisez Prisma :

```bash
npx prisma generate
```

## Utilisation

### 1. Analyser votre feed

1. Allez dans "Gestion des Réseaux Sociaux" > Onglet "Conseils"
2. Cliquez sur "Analyser mon feed Instagram"
3. Attendez quelques secondes (analyse de 30 posts)
4. Consultez les résultats détaillés dans la modal

**Note** : Il est recommandé de faire une analyse par jour maximum pour éviter les appels API excessifs.

### 2. Générer des suggestions de contenu

1. Dans le calendrier, glissez-déposez un type de contenu (Post, Reel ou Story)
2. Sélectionnez une catégorie dans le formulaire
3. Les suggestions IA apparaissent automatiquement
4. Cliquez sur une suggestion pour l'utiliser
5. Personnalisez si nécessaire et publiez

### 3. Cache et performances

- Les analyses sont sauvegardées en base de données
- Les suggestions sont générées à la demande mais sauvegardées
- Vous pouvez récupérer les anciennes suggestions via l'API GET

## Coûts OpenAI

- **Modèle utilisé** : GPT-4 Turbo Preview
- **Coût estimé par génération** : ~0.01$ - 0.03$ (3 suggestions)
- **Recommandation** : Utilisez avec modération pour contrôler les coûts

## Limitations et considérations

1. **Rate Limits Instagram/Facebook** :
   - Respectez les limites de l'API Meta Graph
   - 1 analyse par jour recommandée

2. **OpenAI API** :
   - Nécessite une clé API valide et des crédits
   - Temps de réponse : 3-10 secondes

3. **Multi-tenancy** :
   - Chaque organisation a ses propres analyses
   - Les suggestions sont isolées par organizationId

4. **Sécurité** :
   - Les tokens API sont chiffrés en base de données
   - Authentification requise pour toutes les routes

## Améliorations futures possibles

1. Analyse automatique périodique (cron job quotidien)
2. Support de plus de plateformes (TikTok, LinkedIn)
3. A/B testing de suggestions
4. Historique et comparaison d'analyses
5. Suggestions basées sur les tendances du moment
6. Export des analyses en PDF
7. Intégration avec Canva pour création visuelle

## Dépannage

### "Token Instagram non configuré"
→ Configurez vos tokens dans "Paramètres" > "Intégrations"

### "OpenAI API key non configurée"
→ Ajoutez `OPENAI_API_KEY` dans votre fichier `.env`

### "Aucun post trouvé à analyser"
→ Vérifiez que votre compte Instagram a des posts récents et que le token est valide

### Suggestions hardcodées au lieu d'IA
→ Vérifiez les logs de la console pour l'erreur OpenAI

## Support

Pour toute question ou problème :
- Consultez les logs de la console (F12)
- Vérifiez les variables d'environnement
- Assurez-vous que les migrations sont appliquées

---

**Développé pour LAIA Connect Platform**
Version 1.0 - Janvier 2025
