import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const articles = [
    {
      slug: 'hydrafacial-revolution-soin-visage',
      title: 'HydraFacial : La Révolution du Soin du Visage',
      excerpt: 'Découvrez pourquoi l\'HydraFacial est devenu le soin préféré des célébrités et comment il peut transformer votre peau en une seule séance.',
      content: `
# L'HydraFacial : Bien Plus qu'un Simple Soin du Visage

L'HydraFacial a révolutionné le monde de l'esthétique en combinant plusieurs technologies avancées en un seul traitement. Contrairement aux soins traditionnels, cette approche brevetée offre des résultats immédiats sans temps de récupération.

## Qu'est-ce qui rend l'HydraFacial unique ?

### La Technologie Vortex
Le secret de l'HydraFacial réside dans sa technologie Vortex brevetée. Ce système crée un tourbillon qui :
- Nettoie en profondeur sans agresser
- Exfolie délicatement les cellules mortes
- Extrait les impuretés efficacement
- Hydrate intensément avec des sérums personnalisés

## Les 6 Étapes Clés du Traitement

1. **Détoxification** : Drainage lymphatique pour préparer la peau
2. **Nettoyage & Exfoliation** : Élimination des cellules mortes
3. **Peeling Doux** : Mélange d'acides pour renouveler la peau
4. **Extraction** : Aspiration douce des impuretés
5. **Hydratation** : Infusion de sérums actifs
6. **Protection** : Application de LED et protection solaire

## Les Bénéfices Immédiats

Dès la fin du traitement, vous constaterez :
- Une peau visiblement plus lumineuse
- Des pores resserrés
- Une hydratation en profondeur
- Un teint unifié
- Une texture de peau lisse

## Pour Qui ?

L'HydraFacial convient à tous les types de peaux et tous les âges. Il est particulièrement efficace pour :
- Les peaux déshydratées
- Les teints ternes
- Les pores dilatés
- Les premières rides
- L'acné légère à modérée

## Fréquence Recommandée

Pour des résultats optimaux, nous recommandons :
- **Cure intensive** : 1 séance par semaine pendant 4 semaines
- **Entretien** : 1 séance par mois
- **Boost ponctuel** : Avant un événement important

## Conclusion

L'HydraFacial n'est pas qu'une tendance, c'est une véritable révolution dans les soins du visage. Avec des résultats immédiats et sans éviction sociale, c'est le traitement parfait pour celles et ceux qui veulent une peau éclatante sans compromis.
      `,
      category: 'Soins du visage',
      author: 'Célia - LAIA SKIN Institut',
      readTime: '5 min',
      featured: true,
      published: true,
      mainImage: '/services/hydro-cleaning.jpg',
      tags: JSON.stringify(['HydraFacial', 'Soin visage', 'Hydratation', 'Anti-âge', 'Technologie']),
      metaTitle: 'HydraFacial : La Révolution du Soin du Visage | Blog LAIA SKIN',
      metaDescription: 'Découvrez tout sur l\'HydraFacial, le soin révolutionnaire qui transforme votre peau. Technologie, bénéfices et conseils d\'experte.',
    },
    {
      slug: 'bb-glow-teint-parfait-sans-maquillage',
      title: 'BB Glow : Le Secret d\'un Teint Parfait Sans Maquillage',
      excerpt: 'Imaginez vous réveiller chaque matin avec une peau parfaite, sans avoir besoin de fond de teint. C\'est la promesse du BB Glow.',
      content: `
# BB Glow : La Révolution du "No Makeup Look"

Le BB Glow est bien plus qu'un simple traitement esthétique. C'est une véritable liberation pour toutes celles qui rêvent d'une peau parfaite au naturel.

## Comprendre le BB Glow

### Qu'est-ce que le BB Glow ?
Le BB Glow combine deux techniques puissantes :
- **Le microneedling** : stimulation de la régénération cellulaire
- **Les pigments semi-permanents** : uniformisation du teint

Cette synergie crée un effet "fond de teint" naturel qui dure plusieurs mois.

## Le Processus en Détail

### Préparation de la Peau
Une préparation minutieuse est essentielle :
1. Nettoyage en profondeur
2. Analyse du type de peau
3. Sélection de la teinte adaptée
4. Application d'anesthésiant topique

### Le Traitement
Le traitement se déroule en plusieurs phases :
- Application du sérum BB Glow
- Passages multiples avec le dermapen
- Infusion des pigments dans les couches superficielles
- Finition avec un masque apaisant

## Les Résultats Attendus

### Immédiatement Après
- Teint unifié et lumineux
- Peau hydratée en profondeur
- Effet "bonne mine" naturel

### À Long Terme (3-6 mois)
- Réduction des taches pigmentaires
- Amélioration de la texture
- Stimulation du collagène
- Gain de temps au quotidien

## Les Avantages du BB Glow

1. **Gain de temps** : Plus besoin de fond de teint quotidien
2. **Confiance en soi** : Belle peau 24/7
3. **Naturel** : Résultat subtil et naturel
4. **Durabilité** : Effets durant plusieurs mois
5. **Sécurité** : Pigments testés et approuvés

## Le Protocole Idéal

Pour des résultats optimaux :
- **Phase initiale** : 3-5 séances espacées de 2 semaines
- **Entretien** : 1 séance tous les 3-4 mois
- **Soins à domicile** : Routine adaptée pour prolonger les effets

## Témoignages

*"Je n'ai plus besoin de maquillage pour aller au sport ou à la plage. C'est une vraie libération !"* - Marie, 34 ans

*"Mon teint est uniforme et lumineux, même au réveil. Je me sens belle au naturel."* - Sophie, 28 ans

## Conclusion

Le BB Glow est la solution idéale pour celles qui veulent une peau parfaite sans effort. C'est un investissement dans votre beauté et votre confiance en vous.
      `,
      category: 'Traitements innovants',
      author: 'Célia - LAIA SKIN Institut',
      readTime: '7 min',
      featured: true,
      published: true,
      mainImage: '/services/bb-glow.jpg',
      tags: JSON.stringify(['BB Glow', 'Maquillage semi-permanent', 'Teint parfait', 'Microneedling']),
      metaTitle: 'BB Glow : Le Secret d\'un Teint Parfait | Blog LAIA SKIN',
      metaDescription: 'Tout savoir sur le BB Glow, le traitement révolutionnaire pour un teint parfait sans maquillage. Guide complet par LAIA SKIN Institut.',
    },
    {
      slug: 'routine-skincare-automne-hiver',
      title: 'Routine Skincare Automne-Hiver : Protégez Votre Peau',
      excerpt: 'Le changement de saison nécessite d\'adapter sa routine beauté. Découvrez nos conseils d\'experte pour une peau éclatante même en hiver.',
      content: `
# Adapter Sa Routine Skincare pour l'Automne-Hiver

Les changements de température et d'humidité affectent directement notre peau. Il est crucial d'adapter sa routine pour maintenir une peau saine et éclatante.

## Les Défis de la Saison Froide

### Ce qui change pour votre peau
- **Déshydratation accrue** : L'air froid et sec aspire l'humidité
- **Sensibilité augmentée** : Les variations de température fragilisent
- **Teint terne** : Le renouvellement cellulaire ralentit
- **Rougeurs** : Les capillaires sont plus réactifs

## La Routine Matinale Idéale

### 1. Nettoyage Doux (2 min)
Optez pour un nettoyant crémeux ou une huile nettoyante :
- Préserve le film hydrolipidique
- Élimine les impuretés sans agresser
- Prépare la peau aux soins

### 2. Tonique Hydratant (30 sec)
Choisissez un tonique sans alcool :
- Rééquilibre le pH
- Apporte une première hydratation
- Prépare l'absorption des sérums

### 3. Sérum Vitaminé (1 min)
La vitamine C est votre alliée :
- Protection antioxydante
- Éclat du teint
- Stimulation du collagène

### 4. Crème Hydratante Riche (1 min)
Une texture plus riche qu'en été :
- Barrière protectrice renforcée
- Hydratation longue durée
- Confort immédiat

### 5. Protection Solaire (30 sec)
Même en hiver, indispensable :
- SPF 30 minimum
- Protection contre le vieillissement
- Prévention des taches

## La Routine du Soir

### Double Nettoyage (3 min)
1. Démaquillant à l'huile
2. Nettoyant doux

### Exfoliation Douce (2x/semaine)
- Enzymes ou acides doux
- Élimination des cellules mortes
- Amélioration de l'absorption

### Masque Nourrissant (1x/semaine)
- Masque à l'acide hyaluronique
- Ou masque aux huiles végétales
- 15-20 minutes de pause bien-être

### Sérum Réparateur
- Rétinol ou bakuchiol
- Peptides
- Niacinamide

### Crème de Nuit Régénérante
- Texture riche et nourrissante
- Actifs anti-âge
- Réparation nocturne

## Les Soins Professionnels Recommandés

### HydraFacial Mensuel
Maintient l'hydratation optimale et l'éclat

### LED Thérapie Bi-Hebdomadaire
Stimule la production de collagène et apaise

### Microneedling Trimestriel
Renouvellement cellulaire et fermeté

## Les Ingrédients Stars de l'Hiver

1. **Acide Hyaluronique** : Hydratation intense
2. **Céramides** : Renforcement de la barrière
3. **Squalane** : Nutrition sans effet gras
4. **Vitamine E** : Protection et réparation
5. **Niacinamide** : Apaisement et éclat

## Conseils Lifestyle

### Hydratation Interne
- 2L d'eau par jour minimum
- Tisanes hydratantes
- Aliments riches en oméga-3

### Humidification de l'Air
- Humidificateur dans la chambre
- Plantes vertes
- Bol d'eau sur le radiateur

### Protection Physique
- Écharpe sur le visage par grand froid
- Gants pour protéger les mains
- Baume à lèvres toujours sur soi

## Conclusion

Une routine adaptée est la clé d'une belle peau en automne-hiver. N'hésitez pas à consulter pour un diagnostic personnalisé et des soins professionnels complémentaires.
      `,
      category: 'Conseils beauté',
      author: 'Célia - LAIA SKIN Institut',
      readTime: '8 min',
      featured: false,
      published: true,
      mainImage: '/images/placeholder.jpg',
      tags: JSON.stringify(['Routine skincare', 'Automne', 'Hiver', 'Conseils', 'Hydratation']),
      metaTitle: 'Routine Skincare Automne-Hiver | Conseils LAIA SKIN',
      metaDescription: 'Guide complet pour adapter votre routine skincare à l\'automne-hiver. Conseils d\'experte pour une peau éclatante malgré le froid.',
    }
  ]

  for (const article of articles) {
    await prisma.blogPost.create({
      data: article
    })
  }

  console.log(`✅ ${articles.length} articles de blog créés`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })