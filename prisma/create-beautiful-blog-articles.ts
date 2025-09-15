import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("✨ Création d'articles de blog élégants et lisibles...")

  // Supprimer les anciens articles
  await prisma.blogPost.deleteMany({})
  console.log("✅ Articles précédents supprimés")

  const articles = [
    {
      slug: "secrets-peau-parfaite-routine-coreenne",
      title: "Les 5 Secrets d'une Peau Parfaite selon la K-Beauty",
      excerpt: "Découvrez les rituels beauté coréens qui ont conquis le monde et comment les adapter à votre quotidien.",
      content: `
Vous avez certainement remarqué la peau éclatante et lumineuse des Coréennes. Leur secret ? Une approche holistique de la beauté qui privilégie la prévention et la douceur.

## 1. Le Double Nettoyage : La Base de Tout

Le principe est simple mais révolutionnaire : nettoyer d'abord avec une huile, puis avec un nettoyant à base d'eau. L'huile dissout le maquillage et le sébum, l'eau élimine les impuretés restantes.

**Pourquoi ça change tout ?** Votre peau est parfaitement propre sans être agressée. Les pores respirent, les soins pénètrent mieux.

## 2. L'Hydratation en Couches

Les Coréennes appliquent leurs soins en plusieurs couches légères plutôt qu'une seule couche épaisse. Cette technique du "layering" permet une hydratation profonde et durable.

**Le rituel :** Toner, essence, sérum, crème. Chaque couche prépare la suivante.

## 3. La Protection Solaire Religieuse

En Corée, sortir sans SPF est impensable, même en hiver. Le soleil est responsable de 80% du vieillissement visible de la peau.

**Le conseil d'expert :** Choisissez un SPF 30 minimum, léger et agréable à porter quotidiennement.

## 4. Les Masques en Tissu : Le Soin Cocooning

2 à 3 fois par semaine, offrez-vous 20 minutes de détente avec un masque en tissu. Gorgé de sérum, il hydrate intensément et apaise la peau.

## 5. La Philosophie "Skin First"

La vraie beauté vient d'une peau saine. Les Coréennes investissent dans les soins plutôt que dans le maquillage. Le résultat ? Un teint naturellement lumineux qui ne nécessite que peu de fond de teint.

---

### Comment Adopter ces Rituels ?

Pas besoin de révolutionner toute votre routine d'un coup. Commencez par un changement à la fois.

**Notre conseil :** Testez d'abord le double nettoyage pendant une semaine. Vous verrez rapidement la différence !

Si vous souhaitez découvrir ces techniques avec des produits professionnels et des conseils personnalisés, notre soin **Hydro'Cleaning** s'inspire directement de ces rituels coréens. En une séance, retrouvez cette peau de "glass skin" tant convoitée.

*Prête à révéler votre éclat naturel ? Réservez votre consultation beauté personnalisée.*
      `,
      category: "Conseils Beauté",
      author: "LAIA SKIN",
      readTime: "5",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80",
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80"
      ]),
      tags: JSON.stringify(["k-beauty", "routine", "conseils", "hydratation", "peau parfaite"]),
      metaTitle: "5 Secrets K-Beauty pour une Peau Parfaite | LAIA SKIN",
      metaDescription: "Découvrez les rituels beauté coréens : double nettoyage, layering, protection solaire. Conseils pratiques pour une peau lumineuse."
    },
    {
      slug: "pourquoi-ma-peau-vieillit-comprendre-pour-mieux-agir",
      title: "Pourquoi Ma Peau Vieillit ? Comprendre pour Mieux Agir",
      excerpt: "Les vraies causes du vieillissement cutané expliquées simplement, et surtout, comment ralentir le processus.",
      content: `
Le vieillissement de la peau n'est pas une fatalité. En comprenant ce qui se passe vraiment, vous pouvez agir efficacement pour préserver votre jeunesse.

## Ce Qui Se Passe Vraiment Dans Votre Peau

### Après 25 ans : Le Déclin du Collagène

Dès 25 ans, votre peau produit 1% de collagène en moins chaque année. Le collagène, c'est ce qui donne à votre peau sa fermeté et son élasticité. Sans lui, les premières ridules apparaissent.

### Après 30 ans : Le Ralentissement Cellulaire

Le renouvellement cellulaire passe de 28 jours à 40 jours. Résultat ? Le teint devient terne, les taches s'installent, la texture devient irrégulière.

### Après 40 ans : La Perte de Volume

L'acide hyaluronique, qui retient l'eau dans la peau, diminue de moitié. La peau se déshydrate, les rides se creusent, l'ovale du visage perd sa définition.

## Les Ennemis Cachés de Votre Peau

**Le soleil** : Responsable de 80% du vieillissement visible. Même par temps nuageux, les UV traversent et endommagent vos cellules.

**Le stress** : Il augmente le cortisol qui détruit littéralement le collagène. Une mauvaise semaine au bureau se lit sur votre visage.

**Le sucre** : Il provoque la glycation, un processus qui rigidifie les fibres de collagène. Votre peau perd sa souplesse.

**La pollution** : Les particules fines créent un stress oxydatif qui accélère le vieillissement de 20%.

## Les Solutions Qui Marchent Vraiment

### 1. La Stimulation du Collagène

Il existe des techniques qui relancent naturellement la production de collagène. La micro-stimulation contrôlée, par exemple, peut augmenter la production de 400% en quelques mois.

### 2. L'Hydratation Profonde

Pas seulement en surface. Il faut des techniques qui permettent aux actifs hydratants de pénétrer en profondeur, là où ils sont vraiment utiles.

### 3. La Protection Quotidienne

SPF tous les jours, antioxydants le matin, réparation la nuit. C'est un travail d'équipe.

## Mon Conseil Personnel

Le vieillissement est naturel, mais son accélération ne l'est pas. La clé est d'agir tôt avec douceur et régularité, plutôt que d'attendre et devoir recourir à des méthodes drastiques.

Si vous sentez que votre peau a besoin d'un coup de pouce, notre soin signature **Hydro'Naissance** combine justement hydratation profonde et stimulation du collagène. C'est comme offrir une cure de jouvence à votre peau.

*Envie d'en savoir plus sur l'état de votre peau ? Réservez votre diagnostic personnalisé offert.*
      `,
      category: "Anti-Âge",
      author: "LAIA SKIN",
      readTime: "6",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1609207807107-e8ec2120f9de?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"
      ]),
      tags: JSON.stringify(["anti-âge", "collagène", "vieillissement", "prévention", "conseils"]),
      metaTitle: "Pourquoi Ma Peau Vieillit ? Solutions Anti-Âge | LAIA SKIN",
      metaDescription: "Comprendre le vieillissement cutané : collagène, rides, taches. Découvrez les vraies solutions anti-âge qui fonctionnent."
    },
    {
      slug: "acne-adulte-enfin-des-solutions-qui-marchent",
      title: "Acné Adulte : Enfin des Solutions qui Marchent",
      excerpt: "Vous pensiez en avoir fini avec l'acné après l'adolescence ? Découvrez pourquoi elle revient et comment s'en débarrasser.",
      content: `
L'acné adulte touche 40% des femmes après 25 ans. Si vous en faites partie, vous n'êtes pas seule, et surtout, ce n'est pas une fatalité.

## Pourquoi l'Acné Revient à l'Âge Adulte ?

### Les Hormones en Montagnes Russes

Règles, grossesse, ménopause, stress... Les fluctuations hormonales stimulent les glandes sébacées. Résultat : pores bouchés et boutons, souvent sur le menton et la mâchoire.

### Le Stress du Quotidien

Le stress augmente la production de cortisol qui stimule la production de sébum. C'est le cercle vicieux : stress → boutons → plus de stress → plus de boutons.

### Les Mauvais Réflexes

Trop nettoyer, utiliser des produits agressifs, toucher constamment son visage... Ces gestes empirent l'inflammation.

## Ce Qui Ne Marche Pas (et Pourquoi)

**Assécher à tout prix** : La peau se défend en produisant encore plus de sébum. C'est l'effet rebond garanti.

**Les gommages agressifs** : Ils irritent et propagent les bactéries. L'acné empire.

**Percer les boutons** : Cicatrices, taches, infection... Vraiment pas une bonne idée.

## Les Vraies Solutions

### 1. Nettoyer en Douceur

Un nettoyage doux mais efficace est essentiel. L'idéal ? Des techniques qui nettoient en profondeur sans agresser, comme l'hydradermabrasion.

### 2. Réguler Sans Assécher

Il faut rééquilibrer la peau, pas la punir. Des actifs comme la niacinamide régulent le sébum tout en apaisant.

### 3. La Lumière Qui Soigne

La lumière bleue détruit les bactéries responsables de l'acné. C'est prouvé, sans effet secondaire, et les résultats sont visibles en quelques semaines.

## Mon Protocole Anti-Acné

Après des années à traiter des peaux acnéiques, voici ce qui fonctionne vraiment :

**Semaine 1-2** : Nettoyer et apaiser
**Semaine 3-4** : Réguler et traiter
**Semaine 5-6** : Réparer et prévenir

## Le Conseil Qui Change Tout

Arrêtez de voir votre peau comme un ennemi à combattre. Voyez-la comme un organe qui a besoin d'aide. La douceur et la patience donnent toujours de meilleurs résultats que l'acharnement.

Si vous êtes fatiguée de lutter seule contre l'acné, notre protocole **LED Thérapie** spécial acné combine lumière bleue antibactérienne et rouge anti-inflammatoire. En 6 séances, retrouvez une peau nette et apaisée.

*Besoin d'un plan d'action personnalisé ? Réservez votre consultation acné.*
      `,
      category: "Problèmes de Peau",
      author: "LAIA SKIN",
      readTime: "5",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1599847783449-86b16aec133a?w=800&q=80",
        "https://images.unsplash.com/photo-1587383378486-83e7933f1732?w=800&q=80"
      ]),
      tags: JSON.stringify(["acné", "peau", "solutions", "LED", "conseils"]),
      metaTitle: "Acné Adulte : Solutions Efficaces | LAIA SKIN",
      metaDescription: "Acné adulte : causes, erreurs à éviter et vraies solutions. Découvrez notre protocole anti-acné efficace."
    },
    {
      slug: "teint-terne-retrouver-eclat-en-3-etapes",
      title: "Teint Terne ? 3 Étapes pour Retrouver votre Éclat",
      excerpt: "Votre peau manque de lumière ? Découvrez comment raviver votre éclat naturel avec des gestes simples mais efficaces.",
      content: `
Un teint terne, c'est comme un voile gris sur votre beauté naturelle. La bonne nouvelle ? Quelques ajustements suffisent pour retrouver cette luminosité qui vous manque.

## Pourquoi Votre Teint Manque d'Éclat ?

**Les cellules mortes s'accumulent** : Elles forment une couche opaque qui empêche la lumière de se refléter. Votre peau paraît grise et fatiguée.

**La microcirculation ralentit** : Moins d'oxygène, moins de nutriments. Les toxines s'accumulent, le teint devient terne et les cernes se creusent.

**La déshydratation** : Une peau déshydratée ne reflète pas la lumière. Elle paraît mate, sans vie.

## Étape 1 : Exfolier avec Intelligence

Oubliez les gommages à gros grains qui irritent. L'exfoliation moderne est douce et efficace.

### Le Bon Rythme

- **Peau normale** : 2 fois par semaine
- **Peau sensible** : 1 fois par semaine
- **Peau grasse** : 3 fois par semaine

### La Technique Pro

L'exfoliation enzymatique dissout les cellules mortes sans frotter. C'est doux, efficace, et convient même aux peaux sensibles.

## Étape 2 : Relancer la Circulation

Un teint lumineux, c'est un teint bien irrigué. Voici comment réveiller votre microcirculation :

### Le Massage du Matin

3 minutes suffisent. Mouvements circulaires du centre vers l'extérieur. Insistez sur les pommettes pour un effet bonne mine immédiat.

### L'Eau Froide

Terminez votre routine par un rinçage à l'eau froide. Effet tenseur et coup d'éclat garantis.

### Le Sport

30 minutes d'activité physique = joues roses et teint frais. C'est le meilleur blush naturel.

## Étape 3 : Hydrater en Profondeur

L'hydratation, c'est la clé d'un teint lumineux. Mais attention, il ne s'agit pas seulement d'appliquer une crème.

### La Règle des 3H

- **Humidifier** : Appliquez vos soins sur peau humide
- **Hydrater** : Sérum puis crème adaptée
- **Hermétiser** : Une goutte d'huile pour sceller l'hydratation

### L'Ingrédient Star

L'acide hyaluronique retient 1000 fois son poids en eau. C'est votre allié pour une peau rebondie et lumineuse.

## Le Coup d'Éclat Express

Besoin de résultats immédiats ? Voici mon astuce secrète :

1. Nettoyez votre visage
2. Appliquez un masque hydratant (15 min)
3. Massez avec une huile sèche
4. Vaporisez une brume hydratante

Résultat : Un teint frais et lumineux en 20 minutes.

## Pour Aller Plus Loin

Si malgré ces conseils votre teint reste terne, il est peut-être temps d'un soin professionnel. Notre **Hydro'Cleaning** nettoie en profondeur, exfolie en douceur et hydrate intensément. En une séance, retrouvez cet éclat que vous pensiez perdu.

*Envie d'un teint lumineux durable ? Découvrez nos soins éclat sur-mesure.*
      `,
      category: "Conseils Beauté",
      author: "LAIA SKIN",
      readTime: "7",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1505944270255-72b8c68c6a70?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=800&q=80",
        "https://images.unsplash.com/photo-1544068054-3632d46407cc?w=800&q=80"
      ]),
      tags: JSON.stringify(["teint terne", "éclat", "conseils", "hydratation", "exfoliation"]),
      metaTitle: "Teint Terne : 3 Étapes pour Retrouver l'Éclat | LAIA SKIN",
      metaDescription: "Teint terne et fatigué ? Découvrez 3 étapes simples pour retrouver un teint lumineux : exfoliation, circulation, hydratation."
    },
    {
      slug: "cicatrices-acne-nouveaux-espoirs",
      title: "Cicatrices d'Acné : Les Nouveaux Espoirs",
      excerpt: "Les cicatrices d'acné ne sont plus une fatalité. Découvrez les dernières avancées qui changent la donne.",
      content: `
Si vous vivez avec des cicatrices d'acné, vous savez combien elles peuvent affecter la confiance en soi. Mais aujourd'hui, des solutions efficaces existent vraiment.

## Comprendre pour Mieux Traiter

### Les Types de Cicatrices

**Les cicatrices en creux** : Comme des petits trous dans la peau. Elles résultent d'une perte de collagène après un bouton inflammatoire.

**Les cicatrices en relief** : Des bosses qui dépassent. La peau a produit trop de collagène en cicatrisant.

**Les taches pigmentaires** : Ces marques brunes ou rouges ne sont pas vraiment des cicatrices, mais des traces post-inflammatoires.

## Pourquoi C'est Si Difficile à Traiter ?

Les cicatrices sont des zones où la structure normale de la peau a été remplacée par du tissu fibreux. C'est comme essayer de réparer un pull troué : il faut recréer la maille.

## Les Solutions Qui Font la Différence

### La Stimulation du Collagène

La clé pour combler les cicatrices en creux ? Relancer la production de collagène exactement là où il manque. Les techniques de micro-stimulation contrôlée peuvent réduire la profondeur des cicatrices de 50 à 70%.

### Comment ça marche ?

En créant des micro-canaux dans la peau, on déclenche un processus de réparation naturel. La peau produit du nouveau collagène qui comble progressivement les creux.

### L'Exfoliation Progressive

Pour les cicatrices superficielles et les taches, l'exfoliation régulière fait des miracles. Mais attention, il faut y aller progressivement pour ne pas irriter.

### La Lumière Réparatrice

La LED rouge stimule la régénération cellulaire et améliore la texture de la peau. C'est doux, sans douleur, et les résultats s'accumulent séance après séance.

## Mon Approche en 3 Phases

**Phase 1 : Préparer** (2 semaines)
On apaise, on hydrate, on prépare la peau aux traitements.

**Phase 2 : Traiter** (8-12 semaines)
On stimule la régénération avec des techniques adaptées à votre type de cicatrices.

**Phase 3 : Maintenir**
On consolide les résultats et on prévient l'apparition de nouvelles marques.

## Les Erreurs à Éviter

- **Vouloir aller trop vite** : La peau a besoin de temps pour se régénérer
- **Multiplier les traitements agressifs** : Ça irrite plus que ça n'aide
- **Négliger la protection solaire** : Le soleil fonce les cicatrices

## L'Espoir Est Réel

Je vois régulièrement des transformations incroyables. Des clients qui n'osaient plus sortir sans fond de teint retrouvent confiance en leur peau nue.

Si vous êtes prêt(e) à dire adieu à vos cicatrices, notre soin **Renaissance** utilise la technologie Dermapen pour stimuler la régénération naturelle de votre peau. Les résultats sont progressifs mais durables.

*Première consultation offerte pour évaluer vos cicatrices et créer votre plan de traitement personnalisé.*
      `,
      category: "Problèmes de Peau",
      author: "LAIA SKIN",
      readTime: "6",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1588181138129-aae9e31427dc?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1593449025039-142e609e9781?w=800&q=80",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80"
      ]),
      tags: JSON.stringify(["cicatrices", "acné", "dermapen", "solutions", "régénération"]),
      metaTitle: "Cicatrices d'Acné : Solutions Efficaces | LAIA SKIN",
      metaDescription: "Cicatrices d'acné : comprendre et traiter efficacement. Découvrez les dernières techniques de régénération cutanée."
    },
    {
      slug: "bb-glow-maquillage-reveiller-sans-fond-teint",
      title: "BB Glow : Se Réveiller Maquillée, Mythe ou Réalité ?",
      excerpt: "Le BB Glow promet un teint parfait 24h/24. Découvrez ce qui se cache vraiment derrière cette technique coréenne.",
      content: `
Imaginez vous réveiller chaque matin avec un teint parfait, sans avoir besoin de fond de teint. C'est la promesse du BB Glow, mais qu'en est-il vraiment ?

## Le BB Glow, C'est Quoi Exactement ?

Le BB Glow est né en Corée, pays du "glass skin" et de la peau parfaite. L'idée ? Infuser des pigments semi-permanents dans les couches superficielles de la peau pour créer un effet "bonne mine" qui dure plusieurs semaines.

C'est comme avoir une BB crème intégrée à votre peau. Plus besoin de l'appliquer chaque matin !

## Comment Ça Marche ?

### La Technique

À l'aide de micro-aiguilles très fines (0,5mm maximum), on fait pénétrer un sérum teinté dans l'épiderme. Ce sérum contient :

- Des pigments adaptés à votre carnation
- De l'acide hyaluronique pour l'hydratation
- Des vitamines pour nourrir la peau
- Des peptides pour stimuler le collagène

### Le Déroulé d'une Séance

**Consultation** : On détermine la teinte parfaite pour votre peau
**Préparation** : Nettoyage et légère anesthésie
**Application** : 30 minutes de traitement tout en douceur
**Finition** : Masque apaisant et protection

Total : 1 heure pour 4 à 8 semaines de teint parfait.

## Les Vrais Résultats

### Ce que le BB Glow FAIT

✓ Unifie le teint
✓ Camoufle les petites imperfections
✓ Donne un effet "bonne mine" naturel
✓ Hydrate en profondeur
✓ Stimule le renouvellement cellulaire

### Ce que le BB Glow NE FAIT PAS

✗ Ne couvre pas comme un fond de teint couvrant
✗ Ne cache pas les cicatrices profondes
✗ Ne dure pas 6 mois (maximum 8 semaines)
✗ Ne remplace pas les soins quotidiens

## Pour Qui ?

**Idéal pour :**
- Celles qui veulent simplifier leur routine
- Les peaux ternes qui manquent d'éclat
- Les petites imperfections et rougeurs diffuses
- Un événement spécial (mariage, vacances...)

**À éviter si :**
- Vous avez de l'acné active
- Votre peau est très réactive
- Vous êtes enceinte ou allaitez

## Mon Avis Honnête

Le BB Glow n'est pas magique, mais c'est un vrai coup de pouce pour la confiance en soi. Mes clientes adorent ce côté "je me réveille déjà jolie".

L'effet est subtil et naturel. On ne dirait pas que vous êtes maquillée, juste que vous avez naturellement bonne mine.

## Les Questions Fréquentes

**"Ça fait mal ?"**
C'est comme des petits picotements, vraiment supportable.

**"Je peux me maquiller après ?"**
Oui, après 24h. Mais vous n'en aurez plus vraiment besoin !

**"Combien de séances ?"**
3 séances espacées de 2 semaines pour un résultat optimal.

## L'Alternative Naturelle

Si le BB Glow vous tente mais que vous hésitez, commencez par un **Hydro'Cleaning**. Ce soin nettoie, hydrate et donne un coup d'éclat immédiat. C'est moins durable mais tout aussi efficace pour avoir bonne mine.

*Curieuse d'essayer le BB Glow ? Réservez votre consultation pour voir si c'est fait pour vous.*
      `,
      category: "Techniques Innovantes",
      author: "LAIA SKIN",
      readTime: "8",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1588365761154-c1dc7523f861?w=800&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        "https://images.unsplash.com/photo-1560750133-c5d4ef4de911?w=800&q=80"
      ]),
      tags: JSON.stringify(["bb glow", "maquillage semi-permanent", "teint", "innovation", "k-beauty"]),
      metaTitle: "BB Glow : Teint Parfait Sans Maquillage | LAIA SKIN",
      metaDescription: "BB Glow : découvrez cette technique coréenne pour un teint parfait qui dure. Avantages, résultats, pour qui ?"
    }
  ]

  // Créer les nouveaux articles
  for (const article of articles) {
    const created = await prisma.blogPost.create({
      data: {
        ...article,
        publishedAt: new Date()
      }
    })
    console.log(`✅ Article créé : ${created.title}`)
  }

  console.log("\n🎉 Articles de blog élégants créés avec succès !")
  console.log("\nCaractéristiques des nouveaux articles :")
  console.log("✨ Plus aérés et lisibles")
  console.log("✨ Ton conversationnel et accessible")
  console.log("✨ Structure claire avec sous-titres")
  console.log("✨ Conseils pratiques applicables")
  console.log("✨ Mention naturelle des soins à la fin")
  console.log("✨ Pas de jargon technique excessif")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())