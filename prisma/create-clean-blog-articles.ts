import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("📝 Création d'articles de blog aérés et élégants...")

  // Supprimer les anciens articles
  await prisma.blogPost.deleteMany({})
  console.log("✅ Articles précédents supprimés")

  const articles = [
    {
      slug: "hydradermabrasion-technique-douce",
      title: "L'Hydradermabrasion : La Technique Douce qui Transforme",
      excerpt: "Découvrez comment l'eau peut nettoyer et hydrater votre peau en profondeur.",
      content: `
L'hydradermabrasion, c'est la rencontre entre l'eau et la technologie.

Une technique qui respecte votre peau tout en la transformant.

&nbsp;

## Comment ça fonctionne ?

Imaginez un tourbillon d'eau qui nettoie vos pores en douceur.

Pas de frottement.

Pas d'agression.

Juste de l'eau qui purifie.

&nbsp;

## Les 3 actions simultanées

**1. Le nettoyage**

L'eau pénètre dans chaque pore.

Elle dissout les impuretés.

&nbsp;

**2. L'aspiration**

Un vortex doux aspire les saletés.

Sans douleur.

Sans irritation.

&nbsp;

**3. L'hydratation**

Des sérums nutritifs sont infusés.

Directement là où la peau en a besoin.

&nbsp;

## Les résultats ? Immédiats.

Dès la fin de la séance :

• Pores visiblement plus nets

• Peau douce comme de la soie

• Teint éclatant et lumineux

• Hydratation qui dure 72h

&nbsp;

## Pour toutes les peaux

**Peau grasse ?**
Les pores sont purifiés sans assécher.

**Peau sèche ?**
L'hydratation est maximale.

**Peau sensible ?**
Aucune irritation, que de la douceur.

&nbsp;

## Notre version : Hydro'Cleaning

Chez LAIA SKIN, nous avons perfectionné cette technique.

60 minutes de pure transformation.

Sans douleur.

Sans éviction sociale.

&nbsp;

**Prix : 80€**

**Forfait 3 séances : 210€**

&nbsp;

*Votre peau mérite cette douceur.*
      `,
      category: "Techniques",
      author: "LAIA SKIN",
      readTime: "3",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1487412840599-d0e5537f5c52?w=800&q=80",
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80"
      ]),
      tags: JSON.stringify(["hydradermabrasion", "nettoyage", "hydratation"]),
      metaTitle: "Hydradermabrasion : La Technique Douce | LAIA SKIN",
      metaDescription: "L'hydradermabrasion nettoie et hydrate en douceur. Découvrez cette technique révolutionnaire chez LAIA SKIN."
    },
    {
      slug: "dermapen-regeneration-naturelle",
      title: "Dermapen : La Régénération Naturelle de Votre Peau",
      excerpt: "Comment de micro-stimulations peuvent réveiller la jeunesse de votre peau.",
      content: `
Le Dermapen ne combat pas le vieillissement.

Il réveille la jeunesse qui sommeille dans votre peau.

&nbsp;

## Le principe est simple

12 micro-aiguilles ultra-fines.

Des micro-perforations invisibles.

Votre peau réagit.

Elle se régénère.

&nbsp;

## Ce qui se passe dans votre peau

**Jour 1-3**
La peau détecte les micro-lésions.
Elle lance le processus de réparation.

&nbsp;

**Semaine 1**
Production massive de collagène.
Les cellules se multiplient.

&nbsp;

**Mois 1-3**
Le nouveau collagène se structure.
La peau se raffermit visiblement.

&nbsp;

**Résultat final**
+400% de collagène en 6 mois.
Une peau transformée naturellement.

&nbsp;

## Ce que ça traite vraiment bien

**Les cicatrices d'acné**
70% d'amélioration en moyenne.

**Les rides fines**
Elles s'estompent progressivement.

**Les pores dilatés**
Ils se resserrent visiblement.

**La texture irrégulière**
Elle devient lisse et uniforme.

&nbsp;

## La sécurité avant tout

✓ Profondeur limitée à 0.5mm

✓ Conforme aux normes esthétiques

✓ Aiguilles stériles à usage unique

✓ Adapté à tous les types de peau

&nbsp;

## L'expérience chez nous

**Sensation :** Légers picotements

**Durée :** 60 minutes tout compris

**Rougeurs :** 24-48h, comme un coup de soleil

**Maquillage :** Possible après 24h

&nbsp;

## Notre soin Renaissance

Le Dermapen professionnel.

Pour une vraie régénération.

&nbsp;

**Prix : 120€**

**Forfait 3 séances : 320€**

&nbsp;

*La jeunesse de votre peau n'attend que d'être réveillée.*
      `,
      category: "Régénération",
      author: "LAIA SKIN",
      readTime: "4",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
      ]),
      tags: JSON.stringify(["dermapen", "collagène", "régénération"]),
      metaTitle: "Dermapen : Régénération Naturelle | LAIA SKIN",
      metaDescription: "Le Dermapen stimule naturellement votre collagène. Découvrez cette technique de régénération chez LAIA SKIN."
    },
    {
      slug: "led-therapie-lumiere-guerit",
      title: "LED Thérapie : La Lumière qui Guérit",
      excerpt: "De la NASA à votre peau, découvrez le pouvoir thérapeutique de la lumière.",
      content: `
La NASA l'a découvert par hasard.

En cultivant des plantes dans l'espace.

La lumière LED accélérait leur croissance.

&nbsp;

Puis ils ont testé sur les astronautes.

Les plaies cicatrisaient 50% plus vite.

La révolution était née.

&nbsp;

## Comment la lumière soigne-t-elle ?

C'est de la pure physique.

Les photons pénètrent la peau.

Les cellules les absorbent.

Elles produisent plus d'énergie.

&nbsp;

Simple.

Efficace.

Sans effet secondaire.

&nbsp;

## Chaque couleur a son pouvoir

**🔵 Bleu : L'anti-acné**

Détruit les bactéries.

Régule le sébum.

-77% d'acné en 12 séances.

&nbsp;

**🔴 Rouge : L'anti-âge**

Stimule le collagène.

Réduit les rides.

+35% de fermeté.

&nbsp;

**🟡 Jaune : L'éclat**

Unifie le teint.

Réduit les rougeurs.

Effet bonne mine immédiat.

&nbsp;

## Une séance, c'est comment ?

Vous êtes allongée.

Détendue.

La lumière baigne votre visage.

&nbsp;

Aucune sensation.

Juste de la chaleur douce.

20 minutes de pure régénération.

&nbsp;

## Les résultats

**Semaine 1**
La peau est apaisée.

**Semaine 4**
Les imperfections diminuent.

**Semaine 12**
Transformation visible.

&nbsp;

## Zéro contrainte

Pas de douleur.

Pas d'éviction sociale.

Pas d'effet secondaire.

&nbsp;

Juste de la lumière qui soigne.

&nbsp;

## Notre protocole LED Thérapie

45 minutes de soin complet.

Avec préparation et masque.

&nbsp;

**Prix : 45€**

**Forfait 6 séances : 240€**

&nbsp;

*La lumière est l'avenir de votre peau.*
      `,
      category: "Innovation",
      author: "LAIA SKIN",
      readTime: "4",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80",
        "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80"
      ]),
      tags: JSON.stringify(["LED", "photothérapie", "NASA"]),
      metaTitle: "LED Thérapie : La Lumière qui Guérit | LAIA SKIN",
      metaDescription: "Découvrez la LED thérapie, validée par la NASA. Anti-acné, anti-âge, éclat. 45€ chez LAIA SKIN."
    },
    {
      slug: "bb-glow-teint-parfait-semaines",
      title: "BB Glow : Un Teint Parfait Pendant des Semaines",
      excerpt: "La technique coréenne pour se réveiller maquillée naturellement.",
      content: `
Imaginez.

Vous ouvrez les yeux.

Votre teint est déjà parfait.

&nbsp;

Pas de cernes visibles.

Pas de rougeurs.

Pas de taches.

&nbsp;

C'est la promesse du BB Glow.

&nbsp;

## D'où vient cette technique ?

De Corée du Sud.

Le pays de la "glass skin".

Où la peau parfaite est un art.

&nbsp;

Les Coréennes voulaient simplifier.

Avoir bonne mine sans maquillage quotidien.

Le BB Glow est né.

&nbsp;

## Comment ça marche ?

Des pigments semi-permanents.

Adaptés à votre carnation.

Infusés dans l'épiderme.

&nbsp;

Avec des micro-aiguilles ultra-fines.

0.5mm seulement.

Sans douleur.

&nbsp;

## Ce n'est pas du maquillage permanent

C'est plus subtil.

Plus naturel.

Plus temporaire.

&nbsp;

**Durée : 4 à 8 semaines**

Puis ça s'estompe naturellement.

Sans démarcation.

&nbsp;

## Les vrais avantages

• Gain de temps chaque matin

• Confiance en soi au réveil

• Parfait pour les vacances

• Économies de fond de teint

• Teint unifié 24h/24

&nbsp;

## Pour qui ?

Celles qui veulent simplifier.

Celles qui manquent de temps.

Celles qui veulent être naturellement belles.

&nbsp;

**À éviter si :**

Acné active.

Peau très réactive.

Grossesse ou allaitement.

&nbsp;

## Le protocole idéal

**3 séances**

Espacées de 2 semaines.

Pour un résultat optimal.

&nbsp;

## L'honnêteté avant tout

Le BB Glow n'est pas magique.

Il ne cache pas tout.

Il ne remplace pas les soins.

&nbsp;

Mais il donne ce petit plus.

Cette confiance.

Ce teint lumineux au naturel.

&nbsp;

## Notre BB Glow

Sérums certifiés.

Hygiène irréprochable.

Résultats garantis.

&nbsp;

**Prix : 90€**

**Forfait 3 séances : 240€**

&nbsp;

*Pour celles qui veulent se réveiller belles.*
      `,
      category: "K-Beauty",
      author: "LAIA SKIN",
      readTime: "5",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80"
      ]),
      tags: JSON.stringify(["bb glow", "k-beauty", "teint parfait"]),
      metaTitle: "BB Glow : Teint Parfait Semi-Permanent | LAIA SKIN",
      metaDescription: "Le BB Glow offre 4-8 semaines de teint unifié. Technique coréenne disponible chez LAIA SKIN."
    },
    {
      slug: "hydro-naissance-excellence-combinee",
      title: "Hydro'Naissance : L'Excellence Combinée",
      excerpt: "Notre soin signature qui réunit le meilleur de deux mondes.",
      content: `
Certains soins nettoient.

D'autres régénèrent.

L'Hydro'Naissance fait les deux.

&nbsp;

## La genèse d'un soin d'exception

Nous avons observé.

Écouté.

Compris.

&nbsp;

Nos clientes voulaient tout.

L'hydratation profonde.

La régénération cellulaire.

L'éclat immédiat.

Les résultats durables.

&nbsp;

Alors nous avons créé l'Hydro'Naissance.

&nbsp;

## La synergie parfaite

**Première partie : Hydro'Cleaning**

L'eau purifie.

Les pores respirent.

La peau est préparée.

&nbsp;

**Deuxième partie : Renaissance**

Le Dermapen stimule.

Le collagène se réveille.

La régénération commence.

&nbsp;

**Résultat : Transformation totale**

&nbsp;

## 90 minutes d'excellence

Chaque minute compte.

Chaque geste est précis.

Chaque produit est choisi.

&nbsp;

**0-10 min**
Nous analysons votre peau.

**10-20 min**
Double nettoyage professionnel.

**20-50 min**
Hydradermabrasion complète.

**50-70 min**
Stimulation Dermapen.

**70-85 min**
Masque sur-mesure.

**85-90 min**
Protection et conseils.

&nbsp;

## Les résultats parlent

**Immédiatement**

Peau nette.

Éclat incomparable.

Sensation de pureté.

&nbsp;

**Après 1 semaine**

Texture affinée.

Pores resserrés.

Teint unifié.

&nbsp;

**Après 1 mois**

Rides atténuées.

Fermeté retrouvée.

Rajeunissement visible.

&nbsp;

## Pour qui ?

Celles qui veulent l'excellence.

Celles qui méritent le meilleur.

Celles qui comprennent la valeur.

&nbsp;

## Un investissement, pas une dépense

Ce n'est pas qu'un soin.

C'est une expérience.

Une transformation.

Un nouveau départ pour votre peau.

&nbsp;

## Prix de lancement

**~~180€~~**

**150€**

*Limité dans le temps*

&nbsp;

**Forfait Excellence**

**3 séances : 400€**

*Économisez 140€*

&nbsp;

*Votre peau mérite cette excellence.*
      `,
      category: "Soin Signature",
      author: "LAIA SKIN",
      readTime: "5",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1200&q=80",
      gallery: JSON.stringify([
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80",
        "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80"
      ]),
      tags: JSON.stringify(["soin signature", "hydro-naissance", "excellence"]),
      metaTitle: "Hydro'Naissance : Soin Signature d'Exception | LAIA SKIN",
      metaDescription: "L'Hydro'Naissance combine hydratation et régénération. Notre soin signature à 150€."
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

  console.log("\n✨ Articles aérés et élégants créés !")
  console.log("- Paragraphes courts et espacés")
  console.log("- Images cohérentes avec le contenu")
  console.log("- Focus sur les techniques esthétiques")
  console.log("- Signature LAIA SKIN")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())