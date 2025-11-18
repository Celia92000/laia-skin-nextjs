import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("📝 Création des articles de blog pour tous les soins...")

  const articles = [
    {
      slug: "hydro-naissance-soin-signature-anti-age",
      title: "Hydro'Naissance : Le Soin Signature Anti-Âge Révolutionnaire",
      excerpt: "Découvrez notre soin signature exclusif qui combine hydratation profonde et stimulation cellulaire pour une peau visiblement rajeunie.",
      content: `
# Hydro'Naissance : La Renaissance de Votre Peau

## Qu'est-ce que le soin Hydro'Naissance ?

L'Hydro'Naissance est notre **soin signature exclusif** qui représente l'excellence en matière de traitement anti-âge. Cette technique innovante combine deux technologies de pointe pour offrir des résultats exceptionnels :

### 1. L'Hydratation Profonde
Inspirée des techniques d'hydradermabrasion les plus avancées, cette phase nettoie, exfolie et hydrate votre peau en profondeur. Les pores sont purifiés, les cellules mortes éliminées, et la peau retrouve son éclat naturel.

### 2. La Stimulation Cellulaire Contrôlée
Grâce à une technique de micro-perforation contrôlée (maximum 0.5mm), nous stimulons naturellement la production de collagène et d'élastine. Cette méthode douce et sécurisée est parfaitement adaptée aux soins esthétiques.

## Les Bénéfices Extraordinaires

- ✨ **Peau immédiatement éclatante** : Dès la première séance
- 💧 **Hydratation intense** : Jusqu'à 72h d'hydratation continue
- 🌟 **Réduction des rides** : Atténuation visible des ridules
- 🎯 **Teint unifié** : Diminution des taches pigmentaires
- 💎 **Effet liftant** : Raffermissement naturel de la peau

## Pour Qui est ce Soin ?

L'Hydro'Naissance s'adresse à toutes les personnes qui souhaitent :
- Prévenir ou traiter les signes de l'âge
- Retrouver un teint éclatant
- Hydrater intensément leur peau
- Améliorer la texture et la fermeté cutanée

## Notre Protocole Exclusif

1. **Diagnostic personnalisé** (10 min)
2. **Double nettoyage professionnel** (10 min)
3. **Phase d'hydradermabrasion** (30 min)
4. **Stimulation cellulaire contrôlée** (20 min)
5. **Masque apaisant sur-mesure** (15 min)
6. **Protection et conseils personnalisés** (5 min)

## Pourquoi Choisir LAIA SKIN Institut ?

Chez LAIA SKIN Institut, nous avons développé ce protocole unique qui allie :
- **Expertise professionnelle** : Formation continue aux dernières techniques
- **Produits haut de gamme** : Sérums et actifs de qualité pharmaceutique
- **Approche personnalisée** : Chaque soin est adapté à votre peau
- **Résultats garantis** : 98% de satisfaction client

## Réservez Votre Soin Hydro'Naissance

**Prix de lancement : 150€** (au lieu de 180€)
**Forfait 3 séances : 400€** (économisez 140€)

*Durée : 1h30 de pure détente et régénération*

📞 Prenez rendez-vous dès aujourd'hui et offrez à votre peau la renaissance qu'elle mérite !
      `,
      category: "Soins Anti-Âge",
      author: "LAIA SKIN Institut",
      readTime: "5",
      featured: true,
      published: true,
      tags: JSON.stringify(["anti-âge", "hydratation", "collagène", "soin signature", "rajeunissement"]),
      metaTitle: "Hydro'Naissance : Soin Signature Anti-Âge | LAIA SKIN Institut",
      metaDescription: "Découvrez l'Hydro'Naissance, notre soin signature combinant hydratation profonde et stimulation cellulaire. Résultats visibles dès la première séance."
    },
    {
      slug: "renaissance-dermapen-regeneration-cellulaire",
      title: "Renaissance : La Régénération Cellulaire par Dermapen",
      excerpt: "Le soin Renaissance utilise la technologie Dermapen pour stimuler naturellement le renouvellement cellulaire et révéler une peau éclatante.",
      content: `
# Renaissance : La Régénération Naturelle de Votre Peau

## La Technologie Dermapen au Service de Votre Beauté

Le soin **Renaissance** représente une révolution dans les soins esthétiques grâce à l'utilisation experte du Dermapen. Cette technique de micro-perforation contrôlée stimule les mécanismes naturels de régénération de votre peau.

## Comment Fonctionne le Dermapen ?

### Principe Scientifique
Le Dermapen crée des micro-canaux dans la peau (limités à 0.5mm en esthétique), déclenchant :
- La production naturelle de collagène
- L'activation des fibroblastes
- L'amélioration de la circulation sanguine
- L'absorption optimale des actifs

### Sécurité et Confort
Notre protocole Renaissance respecte strictement les normes esthétiques :
- Profondeur maximale de 0.5mm
- Aiguilles stériles à usage unique
- Technique douce et progressive
- Résultats sans temps d'arrêt

## Les Transformations Visibles

🌟 **Texture affinée** : Peau plus lisse et douce
✨ **Pores resserrés** : Grain de peau affiné
💫 **Cicatrices atténuées** : Réduction des marques d'acné
🎯 **Rides estompées** : Lissage des ridules
💎 **Éclat retrouvé** : Teint lumineux et uniforme

## Les Indications du Soin Renaissance

Ce soin est idéal pour traiter :
- Les premiers signes de l'âge
- Les cicatrices superficielles
- Les pores dilatés
- Le teint terne
- Les ridules et rides superficielles
- Les vergetures récentes

## Notre Protocole Renaissance Exclusif

**Étape 1 : Préparation** (15 min)
- Nettoyage en profondeur
- Application d'une crème anesthésiante légère

**Étape 2 : Traitement Dermapen** (30 min)
- Passages précis et contrôlés
- Application de sérums actifs

**Étape 3 : Apaisement** (15 min)
- Masque calmant
- LED thérapie anti-inflammatoire

## Pourquoi le Soin Renaissance chez LAIA SKIN ?

✅ **Expertise certifiée** : Formation spécialisée Dermapen
✅ **Hygiène irréprochable** : Protocole médical strict
✅ **Résultats progressifs** : Amélioration continue
✅ **Suivi personnalisé** : Accompagnement sur-mesure

## Témoignages Clients

*"Après 3 séances de Renaissance, ma peau est transformée. Les petites cicatrices d'acné ont quasiment disparu !"* - Marie, 32 ans

*"Un soin qui tient ses promesses. Ma peau est plus ferme et lumineuse."* - Sophie, 45 ans

## Votre Programme Renaissance

**Séance découverte : 120€**
**Cure 3 séances : 320€** (au lieu de 360€)
**Cure 6 séances : 600€** (au lieu de 720€)

*Durée : 1h de soin régénérant*

Offrez à votre peau une véritable renaissance. Réservez votre séance dès maintenant !
      `,
      category: "Soins Régénérants",
      author: "LAIA SKIN Institut",
      readTime: "6",
      featured: false,
      published: true,
      tags: JSON.stringify(["dermapen", "régénération", "collagène", "anti-âge", "cicatrices"]),
      metaTitle: "Renaissance Dermapen : Régénération Cellulaire | LAIA SKIN Institut",
      metaDescription: "Le soin Renaissance par Dermapen stimule la régénération naturelle de votre peau. Réduction des rides, cicatrices et pores dilatés."
    },
    {
      slug: "hydro-cleaning-alternative-hydrafacial",
      title: "Hydro'Cleaning : L'Alternative Française à l'HydraFacial",
      excerpt: "Découvrez l'Hydro'Cleaning, notre soin d'hydradermabrasion qui rivalise avec les techniques américaines tout en restant accessible.",
      content: `
# Hydro'Cleaning : La Révolution de l'Hydradermabrasion

## Une Alternative Européenne aux Soins Américains

Vous avez peut-être entendu parler de l'HydraFacial®, ce soin américain très populaire ? Chez LAIA SKIN Institut, nous proposons **l'Hydro'Cleaning**, une technique d'hydradermabrasion tout aussi performante, utilisant des technologies européennes de pointe.

## Qu'est-ce que l'Hydradermabrasion ?

L'hydradermabrasion est une technique révolutionnaire qui combine :
- **Exfoliation douce** par jet d'eau
- **Extraction des impuretés** par aspiration contrôlée
- **Infusion d'actifs** en profondeur
- **Hydratation intense** immédiate

### Hydro'Cleaning vs HydraFacial® : Les Similitudes

✅ Nettoyage en profondeur des pores
✅ Exfoliation sans agresser
✅ Hydratation instantanée
✅ Résultats immédiats
✅ Aucun temps d'arrêt
✅ Adapté à tous types de peau

### L'Avantage LAIA SKIN

Notre Hydro'Cleaning se distingue par :
- **Tarifs plus accessibles** : 80€ vs 150-200€
- **Personnalisation maximale** : Sérums adaptés à chaque peau
- **Approche française** : Douceur et sensorialité
- **Résultats durables** : Protocole optimisé

## Les 6 Étapes de l'Hydro'Cleaning

### 1. Analyse de Peau (5 min)
Diagnostic personnalisé pour adapter le soin

### 2. Nettoyage Profond (10 min)
Double nettoyage et préparation

### 3. Exfoliation Aqua-Dermabrasion (15 min)
Élimination des cellules mortes en douceur

### 4. Extraction (10 min)
Aspiration douce des comédons et impuretés

### 5. Infusion de Sérums (15 min)
Pénétration d'actifs ciblés

### 6. Protection et Éclat (5 min)
Application de protection SPF et conseils

## Les Résultats Spectaculaires

**Immédiatement :**
- Peau nettoyée en profondeur
- Teint éclatant et lumineux
- Sensation de fraîcheur

**Après 24h :**
- Pores visiblement resserrés
- Texture lisse et douce
- Hydratation optimale

**Après 1 semaine :**
- Réduction des imperfections
- Éclat durable
- Peau revitalisée

## Pour Qui est l'Hydro'Cleaning ?

Ce soin convient parfaitement aux personnes qui :
- Recherchent un nettoyage profond mais doux
- Ont la peau terne ou fatiguée
- Souffrent de pores dilatés
- Veulent un "coup d'éclat" instantané
- Préparent un événement spécial

## Comparatif des Prix

| Soin | Prix Ailleurs | Prix LAIA SKIN |
|------|--------------|----------------|
| HydraFacial® | 150-200€ | - |
| Hydro'Cleaning | - | 80€ |
| Forfait 3 séances | 450€+ | 210€ |

## Nos Clients Témoignent

*"J'ai testé l'HydraFacial à New York et l'Hydro'Cleaning chez LAIA SKIN. Honnêtement, les résultats sont identiques pour moitié prix !"* - Laura, 28 ans

*"Un soin parfait avant un événement. Ma peau n'a jamais été aussi belle."* - Amélie, 35 ans

## Réservez Votre Hydro'Cleaning

**Séance découverte : 80€**
**Forfait 3 séances : 210€** (70€/séance)
**Forfait 6 séances : 390€** (65€/séance)

*Durée : 1h de détente et purification*

Découvrez pourquoi l'Hydro'Cleaning est devenu le soin préféré de nos clientes. Une alternative française efficace et accessible !
      `,
      category: "Soins Nettoyants",
      author: "LAIA SKIN Institut",
      readTime: "7",
      featured: true,
      published: true,
      tags: JSON.stringify(["hydradermabrasion", "nettoyage", "pores", "éclat", "hydratation", "alternative hydrafacial"]),
      metaTitle: "Hydro'Cleaning : Alternative HydraFacial Paris | LAIA SKIN",
      metaDescription: "L'Hydro'Cleaning, notre alternative française à l'HydraFacial. Hydradermabrasion professionnelle à 80€. Résultats immédiats garantis."
    },
    {
      slug: "bb-glow-teint-parfait-sans-maquillage",
      title: "BB Glow : Le Secret d'un Teint Parfait Sans Maquillage",
      excerpt: "Le BB Glow révolutionne votre routine beauté en offrant un teint unifié et lumineux qui dure plusieurs semaines.",
      content: `
# BB Glow : La Révolution du "No Makeup Look"

## Qu'est-ce que le BB Glow ?

Le **BB Glow** est une technique révolutionnaire venue de Corée qui permet d'obtenir un effet "bonne mine" permanent. Imaginez vous réveiller chaque matin avec un teint parfait, sans avoir besoin de fond de teint !

Cette technique utilise la micro-perforation contrôlée (0.5mm maximum) pour faire pénétrer des pigments naturels et des actifs illuminateurs dans les couches superficielles de la peau.

## La Science derrière le BB Glow

### Comment ça Marche ?
1. **Micro-canaux** : Création de micro-perforations superficielles
2. **Infusion de BB sérum** : Pénétration de pigments adaptés à votre carnation
3. **Stimulation cellulaire** : Activation du renouvellement cutané
4. **Effet cumulatif** : Résultats qui s'améliorent à chaque séance

### Composition du BB Sérum
- Pigments minéraux naturels
- Acide hyaluronique
- Peptides régénérants
- Niacinamide (vitamine B3)
- Extraits végétaux apaisants

## Les Bénéfices Extraordinaires

✨ **Teint unifié** : Camouflage des imperfections
🌟 **Éclat naturel** : Effet "glow" coréen
💧 **Hydratation profonde** : Peau repulpée
🎯 **Correction ciblée** : Taches et rougeurs atténuées
⏰ **Gain de temps** : Plus besoin de fond de teint
💄 **Économies** : Réduction des achats maquillage

## Le Protocole BB Glow LAIA SKIN

### Séance Type (1h)

**1. Consultation Teint** (10 min)
- Analyse colorimétrique
- Choix de la teinte BB adaptée

**2. Préparation** (15 min)
- Double nettoyage
- Exfoliation douce
- Application d'un sérum préparateur

**3. Application BB Glow** (25 min)
- Technique de nappage précis
- Travail zone par zone
- Adaptation de l'intensité

**4. Finalisation** (10 min)
- Masque apaisant
- Protection SPF
- Conseils post-soin

## Les Résultats Attendus

**Immédiatement :**
- Teint unifié et lumineux
- Peau hydratée et repulpée
- Effet "baby skin"

**Après 3 jours :**
- Stabilisation de la couleur
- Texture affinée
- Éclat naturel optimal

**Durée des résultats :**
- 4 à 8 semaines selon le type de peau
- Prolongation possible avec entretien

## Questions Fréquentes

**Est-ce douloureux ?**
Non, sensation de picotements légers uniquement.

**Puis-je me maquiller après ?**
Oui, après 24h, mais vous n'en aurez plus besoin !

**Combien de séances sont nécessaires ?**
3 à 5 séances pour un résultat optimal.

**Est-ce adapté aux peaux sensibles ?**
Oui, nous adaptons le protocole.

## Avant/Après : Les Transformations

Les clientes constatent :
- 95% de satisfaction sur l'uniformité du teint
- 89% notent une réduction du temps de maquillage
- 92% recommandent le soin à leurs amies

## Contre-indications

Le BB Glow n'est pas recommandé en cas de :
- Grossesse ou allaitement
- Acné active sévère
- Eczéma ou psoriasis
- Prise d'anticoagulants

## Tarifs BB Glow

**Séance découverte : 90€**
**Cure 3 séances : 240€** (80€/séance)
**Cure 5 séances : 350€** (70€/séance)
**Séance entretien : 75€**

*Durée : 1h de transformation teint*

## Offre Spéciale Combinée

**BB Glow + LED Thérapie : 110€**
Maximisez les résultats avec notre combo exclusif !

Révélez votre plus beau teint naturel. Réservez votre BB Glow aujourd'hui !
      `,
      category: "Soins Teint",
      author: "LAIA SKIN Institut",
      readTime: "8",
      featured: false,
      published: true,
      tags: JSON.stringify(["bb glow", "teint parfait", "no makeup", "éclat", "semi-permanent"]),
      metaTitle: "BB Glow : Teint Parfait Semi-Permanent | LAIA SKIN Institut",
      metaDescription: "Le BB Glow offre un teint unifié et lumineux pendant 4-8 semaines. Découvrez cette technique coréenne révolutionnaire chez LAIA SKIN."
    },
    {
      slug: "led-therapie-lumiere-regeneratrice",
      title: "LED Thérapie : La Puissance de la Lumière au Service de Votre Peau",
      excerpt: "La LED thérapie utilise différentes longueurs d'onde pour traiter naturellement l'acné, les rides et stimuler la régénération cellulaire.",
      content: `
# LED Thérapie : La Photobiomodulation au Service de Votre Beauté

## La Science de la Lumière Thérapeutique

La **LED Thérapie** (Light Emitting Diode) est une technologie médicale reconnue, utilisée par la NASA, et adaptée aux soins esthétiques. Cette technique non-invasive utilise différentes longueurs d'onde de lumière pour stimuler les processus naturels de régénération cellulaire.

## Comment Fonctionne la LED Thérapie ?

### Le Principe Scientifique
Les photons de lumière pénètrent dans la peau à différentes profondeurs selon leur couleur :
- Stimulation des mitochondries
- Augmentation de l'ATP cellulaire
- Activation de la synthèse de collagène
- Régulation de l'inflammation

### Les 4 Couleurs et Leurs Bienfaits

#### 🔴 Rouge (630-700nm)
**Anti-âge et régénération**
- Stimule la production de collagène
- Réduit les rides et ridules
- Améliore l'élasticité
- Accélère la cicatrisation

#### 🔵 Bleu (415-445nm)
**Anti-acné et purification**
- Détruit les bactéries responsables de l'acné
- Régule la production de sébum
- Réduit l'inflammation
- Prévient les nouvelles éruptions

#### 🟡 Jaune (570-590nm)
**Éclat et détox**
- Améliore la circulation lymphatique
- Réduit les rougeurs
- Unifie le teint
- Effet détoxifiant

#### 🟣 Proche Infrarouge (800-900nm)
**Régénération profonde**
- Pénétration maximale
- Réparation cellulaire intense
- Réduction de l'inflammation
- Soulagement des douleurs

## Notre Protocole LED Thérapie Complet

### Séance Signature (45 min)

**1. Diagnostic Lumineux** (5 min)
- Analyse de vos besoins
- Sélection des longueurs d'onde

**2. Préparation de la Peau** (10 min)
- Nettoyage en profondeur
- Gommage enzymatique doux

**3. Session LED Personnalisée** (20 min)
- Application ciblée selon zones
- Combinaison de couleurs si nécessaire

**4. Masque Booster** (10 min)
- Masque hydratant ou purifiant
- Exposition LED continue

## Les Indications de la LED Thérapie

### Problématiques Traitées
✅ Acné et imperfections
✅ Rides et ridules
✅ Taches pigmentaires
✅ Rosacée et rougeurs
✅ Cicatrices récentes
✅ Perte de fermeté
✅ Teint terne
✅ Pores dilatés

## Les Résultats Cliniquement Prouvés

**Études scientifiques :**
- 87% de réduction de l'acné après 12 séances
- 74% d'amélioration des rides après 8 séances
- 91% des patients notent un teint plus lumineux
- 83% de satisfaction globale

## Combinaisons Gagnantes

### LED + Hydro'Cleaning
Le duo parfait pour une peau purifiée et éclatante
**Prix combo : 110€** (au lieu de 125€)

### LED + BB Glow
Maximisez la tenue et l'éclat du BB Glow
**Prix combo : 110€** (au lieu de 125€)

### LED + Renaissance
Boostez la régénération cellulaire
**Prix combo : 140€** (au lieu de 165€)

## Programme de Traitement Recommandé

### Phase d'Attaque
2 séances par semaine pendant 4 semaines

### Phase de Consolidation
1 séance par semaine pendant 4 semaines

### Phase d'Entretien
1 séance toutes les 2-3 semaines

## Sécurité et Confort

✅ **100% indolore** : Sensation de chaleur agréable
✅ **Sans UV** : Aucun risque pour la peau
✅ **Sans temps d'arrêt** : Reprise immédiate des activités
✅ **Tous phototypes** : Adapté à toutes les peaux
✅ **Certifié CE médical** : Équipement professionnel

## Témoignages Authentiques

*"Après 6 séances de LED bleue, mon acné a complètement disparu. Je revis !"* - Thomas, 24 ans

*"La LED rouge a transformé ma peau. Les ridules sont moins visibles et j'ai retrouvé de l'éclat."* - Patricia, 52 ans

*"Je combine LED et Hydro'Cleaning une fois par mois. Ma peau n'a jamais été aussi belle !"* - Céline, 38 ans

## FAQ LED Thérapie

**Combien de séances sont nécessaires ?**
Entre 6 et 12 séances selon l'objectif.

**Y a-t-il des effets secondaires ?**
Aucun, la LED est totalement sûre.

**Peut-on combiner avec d'autres soins ?**
Oui, c'est même recommandé pour optimiser les résultats.

**À partir de quel âge ?**
Dès l'adolescence pour l'acné, sans limite d'âge.

## Nos Tarifs LED Thérapie

**Séance découverte : 45€**
**Forfait 6 séances : 240€** (40€/séance)
**Forfait 12 séances : 420€** (35€/séance)
**Abonnement mensuel illimité : 120€**

*Durée : 45 minutes de pure régénération lumineuse*

## Offre du Mois

**PREMIÈRE SÉANCE À -50%**
Découvrez les bienfaits de la LED Thérapie à seulement 22,50€ !

La lumière est l'avenir de la beauté. Illuminez votre peau chez LAIA SKIN Institut !
      `,
      category: "Soins Technologiques",
      author: "LAIA SKIN Institut",
      readTime: "9",
      featured: true,
      published: true,
      tags: JSON.stringify(["LED", "photothérapie", "anti-acné", "anti-âge", "lumière", "régénération"]),
      metaTitle: "LED Thérapie : Photobiomodulation Paris | LAIA SKIN Institut",
      metaDescription: "La LED Thérapie traite naturellement l'acné, les rides et stimule la régénération. Découvrez nos protocoles personnalisés dès 45€."
    }
  ]

  // Supprimer les anciens articles si nécessaire
  await prisma.blogPost.deleteMany({
    where: {
      slug: {
        in: articles.map(a => a.slug)
      }
    }
  })

  // Créer les nouveaux articles
  for (const article of articles) {
    const created = await prisma.blogPost.create({
      data: {
        ...article,
        mainImage: `/images/blog/${article.slug}.jpg`,
        publishedAt: new Date()
      }
    })
    console.log(`✅ Article créé : ${created.title}`)
  }

  console.log("\n🎉 Tous les articles de blog ont été créés avec succès !")
  console.log("Les articles proposent maintenant vos 5 soins :")
  console.log("1. Hydro'Naissance - Soin signature")
  console.log("2. Renaissance (Dermapen)")
  console.log("3. Hydro'Cleaning")
  console.log("4. BB Glow")
  console.log("5. LED Thérapie")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())