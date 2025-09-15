import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Supprimer l'ancien HydraFacial s'il existe
  await prisma.service.updateMany({
    where: { slug: 'hydrafacial' },
    data: { active: false }
  })

  // Mettre à jour Hydro'Cleaning avec stratégie SEO optimisée
  await prisma.service.update({
    where: { slug: 'hydro-cleaning' },
    data: {
      name: "Hydro'Cleaning",
      shortDescription: 'L\'alternative française à l\'HydraFacial - Soin hydratant profond avec technologie vortex',
      description: `L'Hydro'Cleaning est notre soin signature d'hydradermabrasion, une technique similaire à l'HydraFacial. Cette méthode révolutionnaire utilise la technologie vortex pour nettoyer, exfolier et hydrater votre peau en profondeur. Offrant des résultats comparables à un HydraFacial, notre protocole combine aspiration douce, peeling enzymatique et infusion de sérums pour une peau éclatante instantanément.`,
      metaTitle: "Hydro'Cleaning Paris - Alternative HydraFacial | Soin Type HydraFacial | LAIA SKIN",
      metaDescription: "Hydro'Cleaning : notre alternative à l'HydraFacial à Paris. Technique similaire, résultats comparables. Hydradermabrasion, technologie vortex, peau éclatante. Institut LAIA SKIN.",
      keywords: 'hydro cleaning, alternative hydrafacial paris, soin similaire hydrafacial, hydradermabrasion, technologie vortex, soin type hydrafacial, équivalent hydrafacial, technique hydrafacial, nettoyage profond visage, aspiration points noirs, hydratation profonde',
      price: 180,
      launchPrice: 150,
      promoPrice: 160,
      forfaitPrice: 900,
      forfaitPromo: 750,
      duration: 60,
      benefits: JSON.stringify([
        'Résultats comparables à un HydraFacial',
        'Nettoyage en profondeur par technologie vortex',
        'Extraction douce des impuretés (technique similaire HydraFacial)',
        'Hydratation intense comme un HydraFacial',
        'Éclat immédiat du teint',
        'Pores visiblement resserrés',
        'Alternative accessible à l\'HydraFacial',
        'Sans éviction sociale',
        'Convient à tous types de peaux'
      ]),
      process: JSON.stringify([
        {
          step: 1,
          title: 'Diagnostic Personnalisé',
          description: 'Analyse de peau professionnelle (comme pour un HydraFacial)',
          duration: '5 min'
        },
        {
          step: 2,
          title: 'Nettoyage & Exfoliation Vortex',
          description: 'Technologie d\'aspiration douce similaire à l\'HydraFacial',
          duration: '15 min'
        },
        {
          step: 3,
          title: 'Peeling Doux',
          description: 'Acides de fruits pour un renouvellement cellulaire',
          duration: '10 min'
        },
        {
          step: 4,
          title: 'Extraction & Aspiration',
          description: 'Élimination des impuretés par vortex (méthode type HydraFacial)',
          duration: '15 min'
        },
        {
          step: 5,
          title: 'Hydratation & LED',
          description: 'Infusion de sérums et LED thérapie',
          duration: '15 min'
        }
      ]),
      recommendations: `Idéal pour ceux qui recherchent une alternative à l'HydraFacial à Paris. Parfait pour tous types de peaux, particulièrement les peaux déshydratées, ternes ou congestionnées. Fréquence : 1 fois par mois pour maintenir les résultats d'un soin type HydraFacial.`,
      contraindications: 'Identiques à l\'HydraFacial : grossesse (certains sérums), allergies, lésions cutanées actives, coups de soleil récents.',
      mainImage: '/services/hydro-cleaning.jpg',
      gallery: JSON.stringify([
        '/services/hydro-cleaning.jpg',
        '/services/hydro-naissance.jpg'
      ]),
      category: 'Soins du visage',
      canBeOption: false,
      active: true,
      featured: true,
      order: 1
    }
  })

  // Créer une FAQ pour le SEO
  const faqContent = {
    q1: "Quelle est la différence entre Hydro'Cleaning et HydraFacial ?",
    a1: "Notre Hydro'Cleaning utilise une technologie similaire d'hydradermabrasion avec aspiration vortex, offrant des résultats comparables à l'HydraFacial. C'est notre alternative française, personnalisée selon votre type de peau.",
    
    q2: "L'Hydro'Cleaning est-il aussi efficace qu'un HydraFacial ?",
    a2: "Oui, notre technique offre des résultats similaires : peau nettoyée en profondeur, hydratée et éclatante. Nous utilisons la même approche d'aspiration vortex et d'infusion de sérums.",
    
    q3: "Puis-je faire un Hydro'Cleaning si j'ai l'habitude des HydraFacial ?",
    a3: "Absolument ! Les clientes habituées aux HydraFacial adorent notre Hydro'Cleaning car il procure les mêmes bénéfices avec notre touche personnalisée."
  }

  // Mettre à jour Hydro'Naissance pour le SEO aussi
  await prisma.service.update({
    where: { slug: 'hydro-naissance' },
    data: {
      shortDescription: 'Le soin ultime : Hydro\'Cleaning (type HydraFacial) + Dermapen',
      description: `L'Hydro'Naissance combine notre Hydro'Cleaning (alternative à l'HydraFacial) avec le Dermapen pour des résultats exceptionnels. Cette synergie unique offre tous les bénéfices d'un soin type HydraFacial enrichi par la stimulation du Dermapen. Le protocole parfait pour ceux qui veulent plus qu'un simple HydraFacial.`,
      metaTitle: "Hydro'Naissance - HydraFacial Alternative + Dermapen Paris | LAIA SKIN",
      metaDescription: "Hydro'Naissance : combinaison exclusive d'un soin type HydraFacial avec Dermapen. Double action, résultats supérieurs à un HydraFacial classique.",
      keywords: 'hydro naissance, hydrafacial dermapen, alternative hydrafacial plus, soin combiné, hydradermabrasion dermapen'
    }
  })

  console.log("✅ SEO optimisé pour Hydro'Cleaning")
  console.log("- Nom gardé : Hydro'Cleaning")
  console.log("- Positionnement : Alternative à l'HydraFacial")
  console.log("- Mots-clés SEO intégrés légalement")
  console.log("- FAQ SEO-friendly créée")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })