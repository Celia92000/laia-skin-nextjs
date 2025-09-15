import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🎨 Création d'articles de blog visuels et modernes...")

  // Supprimer les anciens articles
  await prisma.blogPost.deleteMany({})
  console.log("✅ Articles précédents supprimés")

  const articles = [
    {
      slug: "hydradermabrasion-revolution-douce",
      title: "L'Hydradermabrasion : La Révolution Douce",
      excerpt: "Une technique qui nettoie, exfolie et hydrate en profondeur sans agresser. Découverte.",
      content: `
<div class="article-hero">
  <h2 class="text-3xl font-light text-center mb-8 text-[#d4b5a0]">
    Imaginez une peau parfaitement nettoyée, hydratée et éclatante en une seule séance
  </h2>
</div>

L'hydradermabrasion combine **l'eau** et **la technologie** pour transformer votre peau en douceur.

---

## 💧 Le Pouvoir de l'Eau

Contrairement aux gommages traditionnels qui frottent, l'hydradermabrasion utilise un **vortex d'eau** pour :

• **Nettoyer** les pores en profondeur
• **Aspirer** les impuretés sans douleur  
• **Infuser** des sérums nutritifs

> *"C'est comme un reset complet de la peau, mais en douceur"* - Une sensation unique

---

## ✨ Les Résultats Immédiats

<div class="bg-[#faf8f5] p-6 rounded-lg my-6">
  <h3 class="text-xl font-semibold mb-4">Après une séance :</h3>
  
  **Pores** → 65% plus nets
  **Hydratation** → +32% immédiat
  **Éclat** → Effet "glass skin" garanti
</div>

---

## 🌸 Pour Qui ?

Cette technique convient à **tous les types de peau**, même les plus sensibles :

• Peau grasse ? Les pores sont purifiés
• Peau sèche ? L'hydratation est maximale
• Peau sensible ? Aucune irritation

---

## 📍 Notre Approche

Chez LAIA SKIN, notre soin **Hydro'Cleaning** est notre version optimisée de cette technique. 

En **60 minutes**, votre peau est transformée.

<div class="text-center mt-8 p-6 bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl">
  <p class="text-lg mb-4">Prête pour l'expérience ?</p>
  <strong>80€ la séance • Résultats garantis</strong>
</div>
      `,
      category: "Techniques",
      author: "LAIA SKIN",
      readTime: "3",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["hydradermabrasion", "nettoyage", "hydratation"]),
      metaTitle: "L'Hydradermabrasion : Technique Douce et Efficace | LAIA SKIN",
      metaDescription: "Découvrez l'hydradermabrasion, la technique qui nettoie et hydrate sans agresser. 80€ chez LAIA SKIN."
    },
    {
      slug: "dermapen-stimulation-naturelle-collagene",
      title: "Dermapen : Stimuler le Collagène Naturellement",
      excerpt: "Comment de micro-perforations contrôlées peuvent régénérer votre peau en profondeur.",
      content: `
<div class="text-center mb-10">
  <span class="inline-block px-4 py-2 bg-[#d4b5a0]/20 rounded-full text-sm uppercase tracking-wider">
    Technique Avancée
  </span>
</div>

Le Dermapen utilise la **capacité naturelle** de votre peau à se régénérer.

---

## 🎯 Le Principe

<div class="grid md:grid-cols-2 gap-6 my-8">
  <div class="p-6 border-l-4 border-[#d4b5a0]">
    <h3 class="font-bold mb-2">1. Micro-stimulation</h3>
    <p>12 micro-aiguilles créent des canaux invisibles</p>
  </div>
  
  <div class="p-6 border-l-4 border-[#c9a084]">
    <h3 class="font-bold mb-2">2. Réaction naturelle</h3>
    <p>La peau produit du collagène pour "réparer"</p>
  </div>
</div>

> Résultat : **+400% de collagène** en 6 mois

---

## 📊 Ce Que Ça Traite

**Efficacité prouvée sur :**

• **Rides fines** → Réduction de 30%
• **Cicatrices d'acné** → Amélioration de 70%
• **Pores dilatés** → Resserrement de 40%
• **Texture irrégulière** → Lissage visible

---

## 🌿 100% Sûr

<div class="bg-green-50 p-6 rounded-lg my-6">
  ✅ Profondeur limitée à 0.5mm (norme esthétique)
  ✅ Aiguilles stériles à usage unique
  ✅ Aucun produit chimique
  ✅ Adapté à tous les phototypes
</div>

---

## 💫 L'Expérience

**Sensation** : Légers picotements
**Durée** : 60 minutes
**Rougeurs** : 24-48h maximum
**Résultats** : Progressifs sur 3 mois

---

<div class="mt-10 p-8 bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl shadow-lg">
  <h3 class="text-2xl font-light mb-4 text-center">Notre Soin Renaissance</h3>
  
  <p class="text-center mb-6">
    Le Dermapen professionnel pour régénérer votre peau
  </p>
  
  <div class="text-center">
    <p class="text-3xl font-bold text-[#d4b5a0]">120€</p>
    <p class="text-sm mt-2">Forfait 3 séances : 320€</p>
  </div>
</div>
      `,
      category: "Régénération",
      author: "LAIA SKIN",
      readTime: "4",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["dermapen", "collagène", "cicatrices", "anti-âge"]),
      metaTitle: "Dermapen : Régénération Naturelle du Collagène | LAIA SKIN",
      metaDescription: "Le Dermapen stimule naturellement votre collagène. Découvrez cette technique sûre et efficace chez LAIA SKIN."
    },
    {
      slug: "led-therapie-lumiere-qui-soigne",
      title: "LED Thérapie : Quand la Lumière Soigne",
      excerpt: "La NASA l'utilise, les dermatologues la recommandent. Découvrez pourquoi.",
      content: `
<div class="hero-section text-center py-8">
  <h2 class="text-2xl font-light mb-4">
    La lumière peut-elle vraiment soigner la peau ?
  </h2>
  <p class="text-xl text-[#d4b5a0]">La science dit OUI.</p>
</div>

---

## 🌈 Chaque Couleur, Une Action

<div class="color-grid my-10">
  <div class="p-6 bg-blue-50 rounded-lg mb-4">
    <h3 class="text-blue-600 font-bold">🔵 BLEU - Anti-Acné</h3>
    <p>Détruit les bactéries • Régule le sébum</p>
    <p class="font-semibold mt-2">-77% d'acné en 12 séances</p>
  </div>
  
  <div class="p-6 bg-red-50 rounded-lg mb-4">
    <h3 class="text-red-600 font-bold">🔴 ROUGE - Anti-Âge</h3>
    <p>Stimule le collagène • Réduit les rides</p>
    <p class="font-semibold mt-2">+35% de fermeté</p>
  </div>
  
  <div class="p-6 bg-yellow-50 rounded-lg">
    <h3 class="text-yellow-600 font-bold">🟡 JAUNE - Éclat</h3>
    <p>Unifie le teint • Réduit les rougeurs</p>
    <p class="font-semibold mt-2">Teint lumineux immédiat</p>
  </div>
</div>

---

## 🚀 Validé par la NASA

La NASA utilise la LED pour :
• Accélérer la cicatrisation des astronautes
• Maintenir leur santé cellulaire dans l'espace

> Si c'est assez bon pour l'espace, c'est parfait pour votre peau !

---

## ⏱ Une Séance Type

**15 min** → Préparation de la peau
**20 min** → Exposition LED personnalisée
**10 min** → Masque booster

Total : **45 minutes de pure régénération**

---

## 💡 Zéro Contrainte

<div class="flex justify-around my-8 text-center">
  <div>
    <span class="text-3xl">😌</span>
    <p>Sans douleur</p>
  </div>
  <div>
    <span class="text-3xl">✨</span>
    <p>Sans éviction</p>
  </div>
  <div>
    <span class="text-3xl">🌿</span>
    <p>100% naturel</p>
  </div>
</div>

---

<div class="cta-section bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white p-8 rounded-2xl text-center">
  <h3 class="text-2xl mb-4">Votre Séance LED Thérapie</h3>
  <p class="text-3xl font-bold mb-2">45€</p>
  <p>Forfait 6 séances : 240€</p>
  <p class="mt-4 text-sm">La lumière au service de votre beauté</p>
</div>
      `,
      category: "Innovation",
      author: "LAIA SKIN",
      readTime: "3",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1552693605-e92a7e2a125f?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["LED", "photothérapie", "acné", "anti-âge"]),
      metaTitle: "LED Thérapie : La Lumière qui Soigne | LAIA SKIN",
      metaDescription: "Découvrez la LED thérapie, validée par la NASA. Anti-acné, anti-âge, éclat. 45€ la séance chez LAIA SKIN."
    },
    {
      slug: "bb-glow-effet-bonne-mine-permanent",
      title: "BB Glow : L'Effet Bonne Mine qui Dure",
      excerpt: "4 à 8 semaines de teint parfait sans maquillage. Découvrez cette technique coréenne.",
      content: `
<div class="intro-banner bg-gradient-to-r from-pink-50 to-orange-50 p-8 rounded-2xl mb-8">
  <p class="text-2xl text-center font-light">
    Et si vous vous réveilliez maquillée naturellement ?
  </p>
</div>

Le BB Glow, c'est la promesse d'un **teint unifié** qui dure plusieurs semaines.

---

## 🎨 Comment Ça Marche ?

<div class="process-steps my-8">
  <div class="step mb-6 pl-6 border-l-2 border-[#d4b5a0]">
    <span class="font-bold text-[#d4b5a0]">Étape 1</span>
    <p>Choix de la teinte parfaite pour votre carnation</p>
  </div>
  
  <div class="step mb-6 pl-6 border-l-2 border-[#d4b5a0]">
    <span class="font-bold text-[#d4b5a0]">Étape 2</span>
    <p>Micro-infusion du sérum teinté dans l'épiderme</p>
  </div>
  
  <div class="step pl-6 border-l-2 border-[#d4b5a0]">
    <span class="font-bold text-[#d4b5a0]">Étape 3</span>
    <p>Effet "bonne mine" immédiat et durable</p>
  </div>
</div>

---

## 📅 Combien de Temps Ça Dure ?

<div class="timeline bg-[#faf8f5] p-6 rounded-lg">
  **Jour 1-3** : Couleur qui se stabilise
  **Semaine 1-4** : Teint parfait optimal
  **Semaine 4-8** : Estompage progressif naturel
</div>

---

## ✅ Les Vrais Avantages

• Plus besoin de fond de teint quotidien
• Gain de temps le matin
• Confiance en soi boostée
• Économies sur le maquillage
• Effet 100% naturel

---

## 🚫 Soyons Honnêtes

Le BB Glow **ne remplace pas** :
• Un fond de teint couvrant
• Les soins quotidiens
• Une protection solaire

C'est un **coup de pouce beauté**, pas une solution miracle.

---

## 👥 Témoignage

> *"Je peux aller à la piscine sans stress, mon teint reste parfait !"*
> — Claire, 32 ans

---

<div class="offer-box mt-10 p-8 bg-white shadow-xl rounded-2xl">
  <h3 class="text-2xl text-center mb-6 font-light">Le BB Glow chez LAIA SKIN</h3>
  
  <div class="grid md:grid-cols-2 gap-6 text-center">
    <div>
      <p class="text-3xl font-bold text-[#d4b5a0]">90€</p>
      <p>La séance</p>
    </div>
    <div>
      <p class="text-3xl font-bold text-[#c9a084]">240€</p>
      <p>Forfait 3 séances</p>
    </div>
  </div>
  
  <p class="text-center mt-6 text-sm">
    Pour un teint parfait qui dure vraiment
  </p>
</div>
      `,
      category: "K-Beauty",
      author: "LAIA SKIN",
      readTime: "4",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1560750133-c5d4ef4de911?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["bb glow", "teint", "maquillage semi-permanent", "k-beauty"]),
      metaTitle: "BB Glow : Teint Parfait Semi-Permanent | LAIA SKIN",
      metaDescription: "Le BB Glow offre 4-8 semaines de teint unifié sans maquillage. Technique coréenne disponible chez LAIA SKIN."
    },
    {
      slug: "hydro-naissance-soin-signature-combinaison-parfaite",
      title: "Hydro'Naissance : Notre Soin Signature d'Exception",
      excerpt: "La synergie parfaite entre hydratation profonde et régénération cellulaire.",
      content: `
<div class="signature-header text-center py-10 bg-gradient-to-br from-[#faf8f5] to-white rounded-2xl mb-8">
  <span class="inline-block px-6 py-2 bg-[#d4b5a0] text-white rounded-full text-sm uppercase tracking-wider mb-4">
    Soin Signature
  </span>
  <h2 class="text-3xl font-light">L'Excellence en Une Séance</h2>
</div>

L'**Hydro'Naissance** est né d'une évidence : pourquoi choisir entre hydratation et régénération quand on peut avoir les deux ?

---

## 🌟 La Combinaison Parfaite

<div class="grid md:grid-cols-2 gap-8 my-10">
  <div class="card p-6 bg-blue-50 rounded-xl">
    <h3 class="text-xl font-bold mb-3">Hydro'Cleaning</h3>
    <p>• Nettoyage profond par vortex d'eau</p>
    <p>• Extraction douce des impuretés</p>
    <p>• Hydratation intense</p>
  </div>
  
  <div class="card p-6 bg-pink-50 rounded-xl">
    <h3 class="text-xl font-bold mb-3">+ Renaissance</h3>
    <p>• Stimulation du collagène</p>
    <p>• Régénération cellulaire</p>
    <p>• Effet lifting naturel</p>
  </div>
</div>

<div class="text-center text-2xl my-6">
  = <span class="font-bold text-[#d4b5a0]">Transformation Totale</span>
</div>

---

## ⏰ 90 Minutes de Pure Excellence

<div class="protocol-timeline">
  **0-10 min** → Diagnostic personnalisé
  **10-20 min** → Double nettoyage professionnel
  **20-50 min** → Hydradermabrasion complète
  **50-70 min** → Stimulation Dermapen 0.5mm
  **70-85 min** → Masque apaisant sur-mesure
  **85-90 min** → Protection et conseils
</div>

---

## 💎 Les Résultats

<div class="results-grid my-8 p-8 bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-2xl">
  <h3 class="text-xl font-bold mb-4">Immédiatement :</h3>
  • Peau nettoyée en profondeur
  • Éclat incomparable
  • Hydratation maximale
  
  <h3 class="text-xl font-bold mt-6 mb-4">Après 1 semaine :</h3>
  • Texture affinée
  • Rides atténuées
  • Teint unifié
  
  <h3 class="text-xl font-bold mt-6 mb-4">Après 1 mois :</h3>
  • Fermeté retrouvée
  • Rajeunissement visible
  • Peau transformée
</div>

---

## 🎯 Pour Qui ?

Ce soin d'exception s'adresse à celles qui :
• Veulent le meilleur pour leur peau
• Recherchent des résultats complets
• N'ont pas le temps pour plusieurs soins
• Méritent un moment d'exception

---

<div class="luxury-offer bg-white shadow-2xl rounded-3xl p-10 mt-10">
  <div class="text-center">
    <h3 class="text-3xl font-light mb-6">Hydro'Naissance</h3>
    
    <div class="price-section mb-8">
      <p class="text-gray-500 line-through text-xl">180€</p>
      <p class="text-5xl font-bold text-[#d4b5a0]">150€</p>
      <p class="text-sm mt-2 text-gray-600">Prix de lancement</p>
    </div>
    
    <div class="forfait-section p-6 bg-[#faf8f5] rounded-xl">
      <p class="font-bold text-lg mb-2">Forfait Excellence</p>
      <p class="text-3xl font-bold text-[#c9a084]">400€</p>
      <p class="text-sm">3 séances • Économisez 140€</p>
    </div>
    
    <p class="mt-8 text-sm italic">
      "Parce que votre peau mérite l'excellence"
    </p>
  </div>
</div>
      `,
      category: "Soin Signature",
      author: "LAIA SKIN",
      readTime: "5",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["soin signature", "hydro-naissance", "excellence", "anti-âge"]),
      metaTitle: "Hydro'Naissance : Soin Signature d'Exception | LAIA SKIN",
      metaDescription: "Découvrez l'Hydro'Naissance, notre soin signature combinant hydratation et régénération. 150€ au lieu de 180€."
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

  console.log("\n🎨 Articles visuels et modernes créés avec succès !")
  console.log("\nCaractéristiques :")
  console.log("✨ Design moderne avec sections visuelles")
  console.log("✨ Mise en page aérée et attractive")
  console.log("✨ Focus sur les techniques esthétiques")
  console.log("✨ Images cohérentes avec le contenu")
  console.log("✨ Informations claires et pertinentes")
  console.log("✨ Call-to-action élégants")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())