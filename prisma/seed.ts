import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Créer l'admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@laiaskin.com' },
    update: {},
    create: {
      email: 'admin@laiaskin.com',
      password: adminPassword,
      name: 'Administrateur',
      role: 'admin',
      phone: '01 23 45 67 89'
    }
  });

  console.log('Admin créé:', admin);

  // Créer les services avec toutes les nouvelles informations
  const services = [
    {
      slug: 'hydro-naissance',
      name: "Hydro'Naissance",
      shortDescription: "Le soin signature révolutionnaire combinant 7 technologies de pointe pour une transformation complète de votre peau",
      description: "Hydro'Naissance est notre protocole exclusif de 90 minutes qui représente l'excellence en matière de soin visage. Ce traitement révolutionnaire combine l'hydrodermabrasion de dernière génération avec l'oxygénothérapie, la luminothérapie LED et des actifs haute performance. Chaque étape est minutieusement orchestrée pour offrir une expérience de régénération cellulaire profonde. La technologie Vortex-Fusion™ nettoie, exfolie et nourrit simultanément, tandis que l'infusion d'acide hyaluronique et de peptides biomimétiques restructure la matrice dermique.",
      metaTitle: "Hydro'Naissance - Soin Visage Haute Technologie 7-en-1 | LAIA SKIN Institut Paris",
      metaDescription: "Découvrez Hydro'Naissance, le soin visage révolutionnaire 7-en-1. Hydrodermabrasion + Oxygénothérapie + LED. Résultats spectaculaires dès la 1ère séance. Prix lancement 99€.",
      keywords: "hydrodermabrasion paris, soin visage haute technologie, vortex fusion, oxygénothérapie visage, LED thérapie, peptides biomimétiques, acide hyaluronique, soin anti-âge premium, institut beauté paris",
      price: 120,
      promoPrice: 99,
      forfaitPrice: 440,
      forfaitPromo: 390,
      duration: 90,
      benefits: JSON.stringify([
        "Réduction de 47% de la profondeur des rides après 4 séances",
        "Augmentation de 85% de l'hydratation cutanée mesurée par cornéométrie",
        "Resserrement des pores visible de 35% dès la première séance",
        "Stimulation de la production de collagène de type I et III",
        "Amélioration de l'élasticité cutanée de 40%",
        "Éclaircissement des taches pigmentaires jusqu'à 60%",
        "Réduction de 70% des imperfections et comédons",
        "Effet lifting immédiat par stimulation des fibroblastes"
      ]),
      process: JSON.stringify([
        "Analyse cutanée par caméra UV et diagnostic personnalisé (10 min)",
        "Double démaquillage japonais à l'huile de camélia bio (5 min)",
        "Hydrodermabrasion Vortex 6 passages avec 3 solutions spécifiques (20 min)",
        "Extraction ultrasonique des comédons à 28kHz (10 min)",
        "Peeling enzymatique aux AHA/BHA dosé selon le phototype (5 min)",
        "Infusion transcutanée de cocktail d'actifs personnalisé (10 min)",
        "Masque alginate enrichi en collagène marin et vitamine C (15 min)",
        "Séance de luminothérapie LED rouge 630nm et infrarouge 850nm (10 min)",
        "Massage kobido de finalisation et application SPF50+ (5 min)"
      ]),
      recommendations: "Protection solaire SPF50+ obligatoire pendant 7 jours. Éviter sauna, hammam et piscine 48h. Utiliser uniquement les produits conseillés pendant 72h. Boire 2L d'eau par jour. Cure optimale : 4 séances espacées de 15 jours puis entretien mensuel.",
      contraindications: "Grossesse et allaitement, traitement par isotrétinoïne (6 mois), herpès actif, rosacée inflammatoire grade 3-4, lésions cutanées ouvertes, diabète non contrôlé, troubles de la coagulation, pace-maker pour la radiofréquence",
      category: 'signature',
      order: 1,
      featured: true,
      active: true
    },
    {
      slug: 'hydro-cleaning',
      name: "Hydro'Cleaning",
      shortDescription: "L'hydrodermabrasion médicale pour une peau parfaitement purifiée, hydratée et éclatante de santé",
      description: "Hydro'Cleaning est le soin d'hydrodermabrasion de référence qui révolutionne le nettoyage professionnel de la peau. Cette technologie médicale utilise la puissance de l'eau micronisée combinée à des sérums actifs pour nettoyer, exfolier et hydrater simultanément. Le système Vortex crée une aspiration contrôlée qui désincruste les pores en profondeur tout en infusant des actifs hydratants. Particulièrement efficace sur les peaux mixtes à grasses, ce soin élimine l'excès de sébum, les cellules mortes et les impuretés tout en préservant le film hydrolipidique. Le résultat : une peau nette, fraîche et lumineuse sans aucune agression.",
      metaTitle: "Hydro'Cleaning - Hydrodermabrasion Professionnelle Paris | Institut LAIA SKIN",
      metaDescription: "Hydro'Cleaning : hydrodermabrasion médicale pour nettoyer et hydrater en profondeur. Technologie Vortex, résultats immédiats. Prix spécial lancement 70€ au lieu de 90€.",
      keywords: "hydrodermabrasion paris, nettoyage profond visage, technologie vortex, pores dilatés traitement, points noirs extraction, peau grasse solution, hydratation intense, peeling aqua, soin purifiant, institut esthétique paris",
      price: 90,
      promoPrice: 70,
      forfaitPrice: 340,
      forfaitPromo: 260,
      duration: 60,
      benefits: JSON.stringify([
        "Extraction de 95% des comédons et points noirs sans douleur",
        "Réduction de 40% de la production de sébum après 3 séances",
        "Hydratation augmentée de 70% pendant 72h",
        "Diminution visible de la taille des pores de 30%",
        "Amélioration de la texture cutanée dès la première séance",
        "Teint unifié et lumineux instantanément",
        "Élimination complète des cellules mortes et toxines",
        "Prévention de l'apparition de nouvelles imperfections"
      ]),
      process: JSON.stringify([
        "Analyse de peau et détermination du protocole personnalisé (5 min)",
        "Démaquillage bi-phasique et préparation cutanée (5 min)",
        "Premier passage hydrodermabrasion : solution nettoyante à l'acide salicylique (8 min)",
        "Deuxième passage : solution kératolytique pour désincruster les pores (8 min)",
        "Extraction manuelle ciblée si nécessaire avec loupe grossissante (5 min)",
        "Troisième passage : solution hydratante à l'acide hyaluronique (8 min)",
        "Quatrième passage : sérum antioxydant vitamine C + E (8 min)",
        "Application masque apaisant à l'aloe vera bio (10 min)",
        "Sérum régulateur de sébum et crème hydratante SPF30 (3 min)"
      ]),
      recommendations: "Ne pas maquiller la peau pendant 24h. Éviter l'exposition solaire directe 48h. Utiliser une crème hydratante matin et soir. Programme optimal : cure de 4 séances à 15 jours d'intervalle, puis une séance d'entretien tous les 2 mois. Particulièrement recommandé avant un événement important.",
      contraindications: "Herpès en poussée, zona facial, eczéma suintant, psoriasis en phase active, couperose sévère, prise d'Accutane dans les 6 derniers mois, plaies ouvertes",
      category: 'hydro',
      order: 2,
      active: true
    },
    {
      slug: 'renaissance',
      name: "Renaissance",
      shortDescription: "Le protocole anti-âge régénérant qui réveille la jeunesse naturelle de votre peau",
      description: "Renaissance est notre soin anti-âge d'exception qui agit sur tous les signes du vieillissement cutané. Ce protocole innovant combine microneedling, mésothérapie virtuelle et massage facial japonais pour stimuler les mécanismes naturels de régénération cellulaire. La technique exclusive de micro-perforation contrôlée active la production de collagène et d'élastine, tandis que l'infusion de facteurs de croissance épidermiques et de cellules souches végétales relance le métabolisme cellulaire. Le résultat est une peau visiblement rajeunie, repulpée et raffermie, avec une réduction significative des rides et une amélioration spectaculaire de la fermeté.",
      metaTitle: "Renaissance - Soin Anti-Âge Microneedling et Mésothérapie | LAIA SKIN Paris",
      metaDescription: "Renaissance : protocole anti-âge combinant microneedling et mésothérapie virtuelle. Réduction des rides -47%, effet lifting immédiat. Tarif lancement 70€.",
      keywords: "soin anti age paris, microneedling visage, mesotherapie sans aiguille, facteurs de croissance, cellules souches vegetales, reduction rides, lifting naturel, collagene elastine, rajeunissement facial, protocole regenerant",
      price: 90,
      promoPrice: 70,
      forfaitPrice: 340,
      forfaitPromo: 260,
      duration: 75,
      benefits: JSON.stringify([
        "Augmentation de la production de collagène de 280% après 4 séances",
        "Réduction des rides profondes jusqu'à 47%",
        "Amélioration de l'élasticité cutanée de 52%",
        "Effet lifting visible dès la première séance",
        "Densification du derme mesurée par échographie",
        "Atténuation des tâches pigmentaires de 40%",
        "Resserrement de l'ovale du visage",
        "Accélération du renouvellement cellulaire x3"
      ]),
      process: JSON.stringify([
        "Diagnostic anti-âge complet et photos avant/après (5 min)",
        "Nettoyage profond et désinfection de la zone (5 min)",
        "Application crème anesthésiante topique si nécessaire (10 min)",
        "Microneedling professionnel 0.5-1.5mm selon la zone (15 min)",
        "Application immédiate du cocktail régénérant personnalisé (5 min)",
        "Mésothérapie virtuelle par électroporation (10 min)",
        "Massage Kobido liftant et drainant (15 min)",
        "Masque bio-cellulose aux facteurs de croissance (15 min)",
        "Application sérum réparateur et protection SPF50+ (5 min)"
      ]),
      recommendations: "Légers rougeurs possibles 24-48h. Pas de maquillage pendant 24h. Protection solaire stricte pendant 1 semaine. Hydrater intensivement matin et soir. Protocole idéal : 4 séances espacées de 3 semaines, puis entretien trimestriel. Compléter avec une routine cosmeceutique à domicile. Recommandé dès 35 ans en prévention ou plus tôt selon les besoins.",
      contraindications: "Grossesse et allaitement, infections cutanées actives, herpès, tendance aux chéloïdes, troubles de la coagulation, prise d'anticoagulants, diabete non contrôlé, maladies auto-immunes, allergie au nickel",
      category: 'antiage',
      order: 3,
      active: true
    },
    {
      slug: 'bb-glow',
      name: "BB Glow",
      shortDescription: "Le traitement semi-permanent effet 'peau de pêche' pour un teint zéro défaut sans maquillage",
      description: "BB Glow est la technique coréenne révolutionnaire qui vous offre un teint parfait 24h/24 pendant plusieurs semaines. Ce traitement semi-permanent utilise le microneedling pour faire pénétrer un sérum teinté hypoallergénique dans les couches superficielles de l'épiderme. Les pigments minéraux biocompatibles se fondent avec votre carnation naturelle pour corriger les imperfections, unifier le teint et apporter un effet 'glow' lumineux. Idéal pour camoufler les taches pigmentaires, les cernes, les cicatrices d'acné et les rougeurs diffuses. C'est comme porter un fond de teint invisible et naturel qui résiste à l'eau, à la transpiration et ne tache pas les vêtements.",
      metaTitle: "BB Glow - Maquillage Semi-Permanent Coréen | Institut LAIA SKIN Paris",
      metaDescription: "BB Glow : technique coréenne pour un teint parfait sans maquillage pendant 4-8 semaines. Camoufle taches, cernes, cicatrices. Prix lancement 50€ seulement.",
      keywords: "bb glow paris, maquillage semi permanent, technique coreenne visage, teint lumineux, cacher taches pigmentaires, traitement cernes, cicatrices acne, effet bonne mine, fond de teint permanent, microneedling bb cream",
      price: 70,
      promoPrice: 50,
      forfaitPrice: 240,
      forfaitPromo: 260,
      duration: 60,
      benefits: JSON.stringify([
        "Teint parfaitement unifié pendant 4 à 8 semaines",
        "Camouflage instantané des imperfections à 95%",
        "Réduction visible des taches pigmentaires de 70%",
        "Atténuation des cernes de 60%",
        "Effet 'glow' naturel et lumineux 24h/24",
        "Gain de 15 minutes de maquillage chaque matin",
        "Hydratation profonde et durable de la peau",
        "Amélioration de la texture cutanée",
        "Résistant à l'eau et à la transpiration"
      ]),
      process: JSON.stringify([
        "Consultation et choix de la teinte adaptée à votre carnation (10 min)",
        "Démaquillage complet et nettoyage en profondeur (5 min)",
        "Application de la crème anesthésiante topique (15 min)",
        "Exfoliation enzymatique pour préparer la peau (5 min)",
        "Préparation du cocktail BB Glow personnalisé (5 min)",
        "Microneedling professionnel 0.25-0.5mm avec le sérum teinté (20 min)",
        "Deuxième passage pour intensifier la couvrance si nécessaire (10 min)",
        "Application du masque réparateur à l'acide hyaluronique (10 min)",
        "Sérum régénérant et protection solaire SPF50+ (5 min)"
      ]),
      recommendations: "Pas de maquillage ni eau sur le visage pendant 24h. Éviter sauna, hammam et piscine pendant 72h. Protection solaire SPF50+ obligatoire pendant 2 semaines. Ne pas exfolier pendant 1 semaine. Résultats optimaux après 2-3 séances espacées de 2 semaines. Durée de l'effet : 4 à 8 semaines selon le type de peau. Entretien recommandé tous les 2-3 mois.",
      contraindications: "Grossesse et allaitement, diabète, troubles de la cicatrisation, chéloïdes, vitiligo, mélasma sévère, acné inflammatoire active, allergie aux pigments, maladies auto-immunes, traitement photosensibilisant",
      category: 'beauty',
      order: 4,
      canBeOption: true,
      active: true
    },
    {
      slug: 'led-therapie',
      name: "LED Thérapie",
      shortDescription: "La photobiomodulation médicale par LED pour régénérer, apaiser et purifier votre peau en profondeur",
      description: "La LED Thérapie utilise la puissance de la lumière pour activer les processus naturels de régénération cellulaire. Cette technologie médicale certifiée CE médical émet des longueurs d'onde spécifiques qui pénètrent à différentes profondeurs dans la peau. La lumière rouge (630nm) stimule la production de collagène et accélère la cicatrisation. La lumière bleue (415nm) détruit les bactéries responsables de l'acné. La lumière jaune (590nm) améliore la circulation lymphatique et réduit les rougeurs. L'infrarouge proche (850nm) pénètre profondément pour réduire l'inflammation et stimuler la réparation cellulaire. Sans douleur, sans UV et sans effets secondaires.",
      metaTitle: "LED Thérapie Médicale - Photobiomodulation Anti-Âge et Acné | LAIA SKIN",
      metaDescription: "LED Thérapie médicale : traitement par lumière rouge, bleue, jaune et infrarouge. Anti-âge, acné, cicatrisation. Séance à 50€ en tarif lancement.",
      keywords: "led therapie paris, photobiomodulation, lumiere rouge anti age, lumiere bleue acne, phototherapie medicale, stimulation collagene, traitement cicatrices, therapie infrarouge, soin non invasif, regeneration cellulaire",
      price: 70,
      promoPrice: 50,
      forfaitPrice: 240,
      forfaitPromo: 260,
      duration: 45,
      benefits: JSON.stringify([
        "Augmentation de la production de collagène de 200% après 12 séances",
        "Réduction de l'acné inflammatoire de 85% (lumière bleue)",
        "Accélération de la cicatrisation x2.5",
        "Diminution des rougeurs et ros ée de 60%",
        "Amélioration de la densité cutanée de 35%",
        "Réduction des tâches pigmentaires de 40%",
        "Atténuation des rides et ridules de 30%",
        "Effet anti-inflammatoire puissant et immédiat",
        "Amélioration de la microcirculation de 45%"
      ]),
      process: JSON.stringify([
        "Analyse de peau et détermination du programme LED (5 min)",
        "Nettoyage doux et démaquillage complet (5 min)",
        "Application du sérum photosensibilisant adapté (3 min)",
        "Protection oculaire avec lunettes spéciales opaques",
        "Exposition LED multicolore selon protocole (20 min)",
        "Possibilité de combiner plusieurs longueurs d'onde",
        "Application masque hydratant pendant la LED (simultané)",
        "Sérum réparateur post-LED enrichi en antioxydants (5 min)",
        "Protection solaire légère si séance de jour (2 min)"
      ]),
      recommendations: "Aucune éviction sociale, peut être réalisé toute l'année. Idéal en complément d'autres soins (après hydrodermabrasion, peeling, microneedling). Pour des résultats optimaux : cure de 10-12 séances à raison de 2 par semaine, puis entretien mensuel. Peut être utilisé en pré-opératoire et post-opératoire pour accélérer la cicatrisation. Excellent pour préparer la peau avant un événement.",
      contraindications: "Épilepsie photosensible, porphyrie, lupus érythémateux, prise de médicaments photosensibilisants (tétracyclines, rétinoïdes), cancer de la peau, grossesse (par précaution)",
      category: 'technology',
      order: 5,
      canBeOption: true,
      active: true
    }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service
    });
  }

  console.log('Services créés avec succès');

  // Créer quelques clients de test
  const clientPassword = await bcrypt.hash('client123', 10);
  
  const clients = [
    {
      email: 'marie.dupont@email.com',
      password: clientPassword,
      name: 'Marie Dupont',
      phone: '06 12 34 56 78',
      role: 'client'
    },
    {
      email: 'sophie.martin@email.com',
      password: clientPassword,
      name: 'Sophie Martin',
      phone: '06 98 76 54 32',
      role: 'client'
    }
  ];

  for (const client of clients) {
    await prisma.user.upsert({
      where: { email: client.email },
      update: {},
      create: client
    });
  }

  console.log('Clients de test créés');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });