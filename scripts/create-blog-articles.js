const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const blogArticles = [
  {
    title: "Les 5 secrets d'une peau éclatante après 40 ans",
    slug: "secrets-peau-eclatante-apres-40-ans",
    excerpt: "Découvrez mes conseils d'experte pour maintenir une peau lumineuse et ferme après 40 ans. Des techniques éprouvées qui font toute la différence.",
    content: `
      <h2>Introduction</h2>
      <p>Après 40 ans, notre peau traverse des changements importants. La production de collagène ralentit, l'élasticité diminue et les signes de l'âge deviennent plus visibles. Mais avec les bonnes techniques et les soins adaptés, il est tout à fait possible de conserver une peau éclatante et en pleine santé.</p>

      <h2>1. L'hydratation en profondeur : La base de tout</h2>
      <p>L'hydratation est le pilier d'une peau éclatante. Après 40 ans, la peau a tendance à se déshydrater plus rapidement. Je recommande notre soin Hydro'Naissance qui combine hydratation profonde et stimulation cellulaire.</p>

      <h2>2. La stimulation du collagène</h2>
      <p>Le microneedling et la thérapie LED sont des techniques révolutionnaires pour stimuler la production naturelle de collagène. Notre soin Renaissance combine ces technologies pour des résultats visibles dès la première séance.</p>

      <h2>3. L'exfoliation douce mais régulière</h2>
      <p>Une exfoliation adaptée permet d'éliminer les cellules mortes et de révéler l'éclat naturel de la peau. L'Hydro'Cleaning est parfait pour cela, combinant nettoyage en profondeur et hydratation.</p>

      <h2>4. La protection solaire quotidienne</h2>
      <p>Le soleil est le principal facteur de vieillissement prématuré. Une protection SPF 50 quotidienne est indispensable, même en hiver.</p>

      <h2>5. Un mode de vie sain</h2>
      <p>Une alimentation riche en antioxydants, une hydratation suffisante (1,5L d'eau par jour minimum) et un sommeil réparateur sont essentiels pour une peau rayonnante.</p>

      <h2>Mon conseil d'experte</h2>
      <p>Commencez par un diagnostic personnalisé. Chaque peau est unique et mérite un protocole sur-mesure. Prenez rendez-vous pour découvrir le programme idéal pour votre peau.</p>
    `,
    category: "Conseils Anti-âge",
    author: "Laïa",
    readTime: "5 min",
    tags: "anti-âge, soins, conseils, peau mature",
    mainImage: "/services/renaissance.jpg",
    published: true,
    featured: true,
    publishedAt: new Date("2024-11-15")
  },
  {
    title: "BB Glow : La révolution du teint parfait sans maquillage",
    slug: "bb-glow-revolution-teint-parfait",
    excerpt: "Découvrez comment le BB Glow transforme votre teint pour un effet « bonne mine » naturel qui dure jusqu'à 6 mois.",
    content: `
      <h2>Qu'est-ce que le BB Glow ?</h2>
      <p>Le BB Glow est une technique innovante venue de Corée qui révolutionne le monde de l'esthétique. Cette technique combine microneedling et sérum teinté pour créer un effet fond de teint semi-permanent naturel.</p>

      <h2>Les bénéfices immédiats</h2>
      <ul>
        <li>Uniformisation du teint</li>
        <li>Réduction visible des taches pigmentaires</li>
        <li>Atténuation des cernes</li>
        <li>Effet bonne mine immédiat</li>
        <li>Hydratation intense</li>
      </ul>

      <h2>Pour qui est fait le BB Glow ?</h2>
      <p>Cette technique convient particulièrement aux personnes qui :</p>
      <ul>
        <li>Souhaitent un teint unifié sans maquillage quotidien</li>
        <li>Ont des taches pigmentaires ou des irrégularités de teint</li>
        <li>Veulent gagner du temps le matin</li>
        <li>Recherchent un effet naturel et lumineux</li>
      </ul>

      <h2>Le déroulement d'une séance</h2>
      <p>La séance dure environ 90 minutes et comprend :</p>
      <ol>
        <li>Nettoyage en profondeur de la peau</li>
        <li>Application d'un sérum anesthésiant</li>
        <li>Microneedling avec le sérum BB Glow personnalisé</li>
        <li>Masque apaisant</li>
        <li>Protection solaire</li>
      </ol>

      <h2>Les résultats</h2>
      <p>Dès la première séance, votre teint est unifié et lumineux. Pour des résultats optimaux, je recommande 3 à 4 séances espacées de 2 semaines. L'effet dure entre 4 et 6 mois selon votre type de peau.</p>

      <h2>Mes conseils post-soin</h2>
      <p>Après votre BB Glow, évitez l'exposition solaire directe pendant 48h et hydratez intensément votre peau. Une routine de soins adaptée prolongera les résultats.</p>
    `,
    category: "Techniques innovantes",
    author: "Laïa",
    readTime: "7 min",
    tags: "BB Glow, teint, innovation, semi-permanent",
    mainImage: "/services/bb-glow.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-11-10")
  },
  {
    title: "LED Thérapie : La lumière au service de votre peau",
    slug: "led-therapie-bienfaits-peau",
    excerpt: "Comment la thérapie LED révolutionne les soins esthétiques : anti-âge, acné, cicatrisation... Découvrez tous ses bienfaits.",
    content: `
      <h2>La science derrière la LED thérapie</h2>
      <p>La thérapie LED utilise différentes longueurs d'onde de lumière pour stimuler les processus naturels de régénération cellulaire. Chaque couleur a des propriétés spécifiques scientifiquement prouvées.</p>

      <h2>Les différentes couleurs et leurs bienfaits</h2>
      
      <h3>Rouge (630-700 nm)</h3>
      <p>La lumière rouge stimule la production de collagène et d'élastine. Elle est idéale pour :</p>
      <ul>
        <li>Réduire les rides et ridules</li>
        <li>Améliorer la fermeté de la peau</li>
        <li>Accélérer la cicatrisation</li>
      </ul>

      <h3>Bleu (415-445 nm)</h3>
      <p>La lumière bleue a des propriétés antibactériennes puissantes :</p>
      <ul>
        <li>Traite l'acné active</li>
        <li>Réduit l'inflammation</li>
        <li>Régule la production de sébum</li>
      </ul>

      <h3>Vert (525-550 nm)</h3>
      <p>La lumière verte agit sur la pigmentation :</p>
      <ul>
        <li>Atténue les taches brunes</li>
        <li>Unifie le teint</li>
        <li>Apaise les rougeurs</li>
      </ul>

      <h2>Mon protocole personnalisé</h2>
      <p>Chez LAIA SKIN, j'adapte le protocole LED à vos besoins spécifiques. Une séance type comprend :</p>
      <ol>
        <li>Diagnostic de peau approfondi</li>
        <li>Nettoyage doux</li>
        <li>Application de sérums ciblés</li>
        <li>20-30 minutes sous LED</li>
        <li>Masque hydratant</li>
      </ol>

      <h2>Les résultats attendus</h2>
      <p>Les premiers effets sont visibles dès la première séance : peau repulpée, teint lumineux. Pour des résultats durables, un protocole de 6 à 10 séances est recommandé.</p>

      <h2>L'association gagnante</h2>
      <p>La LED thérapie se combine parfaitement avec d'autres soins comme l'Hydro'Cleaning ou le microneedling pour décupler les résultats.</p>
    `,
    category: "Technologies",
    author: "Laïa",
    readTime: "6 min",
    tags: "LED, technologie, anti-âge, acné",
    mainImage: "/services/led-therapie.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-11-08")
  },
  {
    title: "Préparer sa peau pour l'hiver : Mon protocole complet",
    slug: "preparer-peau-hiver-protocole",
    excerpt: "L'hiver met notre peau à rude épreuve. Découvrez mon protocole complet pour protéger et sublimer votre peau pendant la saison froide.",
    content: `
      <h2>Les défis de l'hiver pour notre peau</h2>
      <p>Le froid, le vent, le chauffage... L'hiver est une saison particulièrement agressive pour notre peau. Déshydratation, tiraillements, rougeurs, teint terne sont autant de désagréments qu'il faut anticiper.</p>

      <h2>Mon protocole pré-hiver en institut</h2>
      
      <h3>Étape 1 : Le grand nettoyage</h3>
      <p>Je recommande de commencer par un Hydro'Cleaning pour éliminer toutes les impuretés accumulées et préparer la peau à recevoir les soins.</p>

      <h3>Étape 2 : L'hydratation intensive</h3>
      <p>L'Hydro'Naissance est parfait pour créer une réserve d'hydratation dans les couches profondes de la peau. Cette base d'hydratation est essentielle avant l'hiver.</p>

      <h3>Étape 3 : La stimulation cellulaire</h3>
      <p>Une séance de LED thérapie rouge stimule la production de collagène et renforce la barrière cutanée.</p>

      <h2>Votre routine quotidienne d'hiver</h2>
      
      <h3>Le matin</h3>
      <ul>
        <li>Nettoyage doux avec une eau micellaire</li>
        <li>Sérum à l'acide hyaluronique</li>
        <li>Crème riche en céramides</li>
        <li>Protection SPF 30 minimum</li>
      </ul>

      <h3>Le soir</h3>
      <ul>
        <li>Double nettoyage (huile + mousse)</li>
        <li>Sérum réparateur</li>
        <li>Crème de nuit nourrissante</li>
        <li>Baume à lèvres réparateur</li>
      </ul>

      <h2>Mes astuces anti-froid</h2>
      <ul>
        <li>Baissez la température de votre chauffage la nuit</li>
        <li>Utilisez un humidificateur d'air</li>
        <li>Buvez au moins 1,5L d'eau par jour</li>
        <li>Privilégiez les douches tièdes</li>
        <li>Appliquez un masque hydratant 2 fois par semaine</li>
      </ul>

      <h2>Le programme idéal</h2>
      <p>Pour une préparation optimale, je recommande de commencer le protocole en octobre avec une séance toutes les 2 semaines. Votre peau sera ainsi parfaitement armée pour affronter l'hiver.</p>
    `,
    category: "Conseils saisonniers",
    author: "Laïa",
    readTime: "8 min",
    tags: "hiver, hydratation, protection, routine",
    mainImage: "/services/hydro-cleaning.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-11-05")
  },
  {
    title: "Microneedling : La régénération cellulaire naturelle",
    slug: "microneedling-regeneration-naturelle",
    excerpt: "Comment le microneedling stimule les mécanismes naturels de votre peau pour un rajeunissement visible et durable.",
    content: `
      <h2>Le principe du microneedling</h2>
      <p>Le microneedling crée des micro-perforations contrôlées dans la peau, déclenchant un processus naturel de régénération. Cette technique stimule la production de collagène et d'élastine pour une peau visiblement rajeunie.</p>

      <h2>Les indications principales</h2>
      <ul>
        <li>Rides et ridules</li>
        <li>Cicatrices d'acné</li>
        <li>Pores dilatés</li>
        <li>Vergetures</li>
        <li>Taches pigmentaires</li>
        <li>Relâchement cutané</li>
      </ul>

      <h2>Le déroulement de la séance chez LAIA SKIN</h2>
      <p>Ma technique exclusive combine microneedling et sérums hautement concentrés pour maximiser les résultats :</p>
      <ol>
        <li>Diagnostic personnalisé</li>
        <li>Nettoyage et désinfection</li>
        <li>Application d'une crème anesthésiante</li>
        <li>Microneedling avec sérums actifs</li>
        <li>LED thérapie pour optimiser la régénération</li>
        <li>Masque apaisant et hydratant</li>
      </ol>

      <h2>Les sérums que j'utilise</h2>
      <p>Je sélectionne les sérums en fonction de vos besoins :</p>
      <ul>
        <li>Acide hyaluronique pour l'hydratation</li>
        <li>Vitamine C pour l'éclat</li>
        <li>Peptides pour la fermeté</li>
        <li>Niacinamide pour les taches</li>
      </ul>

      <h2>Les résultats</h2>
      <p>Immédiatement après : peau rosée et repulpée. Après 48h : teint éclatant et peau lissée. Après 4 semaines : réduction visible des imperfections. Les résultats continuent de s'améliorer pendant 3 mois.</p>

      <h2>Mon conseil</h2>
      <p>Pour des résultats optimaux, je recommande 3 à 6 séances espacées de 4 semaines. Le microneedling est le soin anti-âge par excellence, naturel et sans injection.</p>
    `,
    category: "Techniques avancées",
    author: "Laïa",
    readTime: "6 min",
    tags: "microneedling, anti-âge, régénération, collagène",
    mainImage: "/services/renaissance.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-11-01")
  },
  {
    title: "Acné adulte : Mes solutions douces et efficaces",
    slug: "acne-adulte-solutions-douces",
    excerpt: "L'acné adulte touche 40% des femmes. Découvrez mes protocoles personnalisés pour retrouver une peau nette sans agresser.",
    content: `
      <h2>Comprendre l'acné adulte</h2>
      <p>L'acné adulte diffère de l'acné adolescente. Elle est souvent liée aux hormones, au stress, à l'alimentation ou à des produits inadaptés. Mon approche combine technologie et douceur pour traiter sans assécher.</p>

      <h2>Mon diagnostic en 3 étapes</h2>
      <ol>
        <li>Analyse du type d'acné (hormonale, cosmétique, stress)</li>
        <li>Évaluation de la barrière cutanée</li>
        <li>Identification des facteurs déclenchants</li>
      </ol>

      <h2>Mon protocole anti-acné</h2>
      
      <h3>Phase 1 : Purification</h3>
      <p>L'Hydro'Cleaning nettoie en profondeur sans agresser. Il élimine les impuretés tout en maintenant l'hydratation.</p>

      <h3>Phase 2 : Traitement</h3>
      <p>La LED bleue détruit les bactéries responsables de l'acné. 2 séances par semaine pendant 1 mois.</p>

      <h3>Phase 3 : Régulation</h3>
      <p>Des peelings doux régulent la production de sébum et affinent le grain de peau.</p>

      <h2>Mes conseils au quotidien</h2>
      <ul>
        <li>Double nettoyage le soir uniquement</li>
        <li>Hydratation légère mais essentielle</li>
        <li>Éviter les produits comédogènes</li>
        <li>Ne jamais percer les boutons</li>
        <li>Changer sa taie d'oreiller 2 fois par semaine</li>
      </ul>

      <h2>Les erreurs à éviter</h2>
      <ul>
        <li>Décaper sa peau (aggrave l'acné)</li>
        <li>Multiplier les produits</li>
        <li>Négliger l'hydratation</li>
        <li>Utiliser des gommages mécaniques</li>
      </ul>

      <h2>Résultats attendus</h2>
      <p>Avec mon protocole : -50% d'imperfections en 4 semaines, peau nette en 2-3 mois. La clé : régularité et patience.</p>

      <div class="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 p-6 rounded-xl mt-8">
        <h3 class="text-xl font-semibold text-[#2c3e50] mb-3">💫 Soin recommandé : Hydro'Cleaning + LED Thérapie</h3>
        <p class="text-[#2c3e50]/80 mb-4">Combinez nettoyage profond et traitement antibactérien pour une peau nette et saine.</p>
        <a href="/reservation" class="inline-block bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
          Réserver ce soin
        </a>
      </div>
    `,
    category: "Problèmes de peau",
    author: "Laïa",
    readTime: "7 min",
    tags: "acné, peau nette, LED, hydratation",
    mainImage: "/services/led-therapie.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-10-28")
  },
  {
    title: "Le guide complet des soins pour peaux sensibles",
    slug: "guide-soins-peaux-sensibles",
    excerpt: "Rougeurs, tiraillements, réactivité... Mes protocoles doux spécialement conçus pour les peaux sensibles et réactives.",
    content: `
      <h2>Reconnaître une peau sensible</h2>
      <p>Une peau sensible réagit excessivement aux stimuli : rougeurs, picotements, tiraillements. 60% des femmes ont la peau sensible. Voici comment en prendre soin.</p>

      <h2>Les causes de la sensibilité</h2>
      <ul>
        <li>Barrière cutanée altérée</li>
        <li>Facteurs génétiques</li>
        <li>Stress et émotions</li>
        <li>Produits inadaptés</li>
        <li>Changements climatiques</li>
      </ul>

      <h2>Mon approche pour les peaux sensibles</h2>
      
      <h3>Principe n°1 : La douceur avant tout</h3>
      <p>J'utilise exclusivement des techniques non-invasives et des produits hypoallergéniques testés dermatologiquement.</p>

      <h3>Principe n°2 : Renforcer la barrière</h3>
      <p>L'Hydro'Naissance reconstruit la barrière cutanée avec des actifs biomimétiques.</p>

      <h3>Principe n°3 : Apaiser l'inflammation</h3>
      <p>La LED verte et rouge apaise instantanément les inflammations.</p>

      <h2>Protocole spécial peaux sensibles</h2>
      <ol>
        <li>Nettoyage ultra-doux à l'eau thermale</li>
        <li>Sérum apaisant aux peptides</li>
        <li>Hydro'Naissance en mode doux</li>
        <li>LED thérapie apaisante</li>
        <li>Masque au collagène marin</li>
      </ol>

      <h2>Ma routine maison recommandée</h2>
      <p>Matin : eau thermale + sérum apaisant + crème barrière + SPF mineral</p>
      <p>Soir : lait démaquillant + eau thermale + sérum réparateur + baume nourrissant</p>

      <h2>Les ingrédients à privilégier</h2>
      <ul>
        <li>Céramides (reconstruction barrière)</li>
        <li>Niacinamide (anti-inflammatoire)</li>
        <li>Centella asiatica (apaisante)</li>
        <li>Acide hyaluronique (hydratation)</li>
      </ul>

      <div class="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 p-6 rounded-xl mt-8">
        <h3 class="text-xl font-semibold text-[#2c3e50] mb-3">💫 Soin recommandé : Hydro'Naissance Douceur</h3>
        <p class="text-[#2c3e50]/80 mb-4">Un protocole spécialement adapté pour hydrater et apaiser les peaux les plus sensibles.</p>
        <a href="/reservation" class="inline-block bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
          Prendre rendez-vous
        </a>
      </div>
    `,
    category: "Types de peau",
    author: "Laïa",
    readTime: "6 min",
    tags: "peau sensible, douceur, hydratation, apaisant",
    mainImage: "/services/hydro-naissance.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-10-25")
  },
  {
    title: "Taches pigmentaires : Mon protocole d'éclaircissement",
    slug: "taches-pigmentaires-protocole-eclaircissement",
    excerpt: "Soleil, âge, hormones... Les taches brunes ont plusieurs origines. Découvrez mes techniques pour retrouver un teint uniforme.",
    content: `
      <h2>Les différents types de taches</h2>
      <p>Chaque type de tache nécessite une approche spécifique :</p>
      <ul>
        <li>Mélasma (masque de grossesse)</li>
        <li>Lentigos solaires (taches de vieillesse)</li>
        <li>Hyperpigmentation post-inflammatoire</li>
        <li>Taches de rousseur</li>
      </ul>

      <h2>Mon diagnostic précis</h2>
      <p>J'utilise une lampe UV pour révéler les taches invisibles à l'œil nu et anticiper leur évolution. Cela me permet d'adapter le traitement.</p>

      <h2>Mon protocole anti-taches en 3 phases</h2>
      
      <h3>Phase 1 : Préparation (2 semaines)</h3>
      <p>Préparation de la peau avec des sérums dépigmentants doux pour optimiser les résultats.</p>

      <h3>Phase 2 : Traitement intensif</h3>
      <ul>
        <li>BB Glow pour camoufler et traiter</li>
        <li>Peelings dépigmentants ciblés</li>
        <li>LED verte anti-taches</li>
        <li>Microneedling avec vitamine C</li>
      </ul>

      <h3>Phase 3 : Maintien</h3>
      <p>Protection solaire stricte et sérums d'entretien pour prévenir la réapparition.</p>

      <h2>Les actifs stars anti-taches</h2>
      <ul>
        <li>Vitamine C stabilisée (éclaircissant)</li>
        <li>Acide kojique (inhibiteur de mélanine)</li>
        <li>Niacinamide (régulateur)</li>
        <li>Acide tranexamique (anti-mélasma)</li>
        <li>Résorcinol (exfoliant doux)</li>
      </ul>

      <h2>Prévention : mes règles d'or</h2>
      <ol>
        <li>SPF 50 quotidien, même par temps couvert</li>
        <li>Réapplication toutes les 2h en extérieur</li>
        <li>Chapeau et lunettes en été</li>
        <li>Antioxydants matin et soir</li>
        <li>Éviter les parfums sur les zones exposées</li>
      </ol>

      <h2>Résultats attendus</h2>
      <p>Éclaircissement visible dès 4 semaines. Uniformisation complète en 3-6 mois selon l'ancienneté des taches. La régularité est cruciale.</p>

      <div class="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 p-6 rounded-xl mt-8">
        <h3 class="text-xl font-semibold text-[#2c3e50] mb-3">💫 Soin recommandé : BB Glow Anti-Taches</h3>
        <p class="text-[#2c3e50]/80 mb-4">Camouflez et traitez simultanément vos taches pour un teint uniforme immédiat et durable.</p>
        <a href="/reservation" class="inline-block bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
          Découvrir ce soin
        </a>
      </div>
    `,
    category: "Problèmes ciblés",
    author: "Laïa",
    readTime: "8 min",
    tags: "taches, pigmentation, éclaircissement, BB Glow",
    mainImage: "/services/bb-glow.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-10-20")
  },
  {
    title: "Routine beauté du matin : 10 minutes pour une peau parfaite",
    slug: "routine-beaute-matin-10-minutes",
    excerpt: "Ma routine matinale express pour commencer la journée avec une peau éclatante. Simpl,e efficace et adaptable à tous.",
    content: `
      <h2>Les 10 minutes qui changent tout</h2>
      <p>Pas besoin de 30 produits ni d'1 heure devant le miroir. Voici ma routine optimisée pour une peau parfaite en 10 minutes chrono.</p>

      <h2>Minute 1-2 : Le réveil en douceur</h2>
      <p>Aspergez votre visage d'eau fraîche pour activer la microcirculation. Tapotez délicatement avec une serviette propre.</p>

      <h2>Minute 3-4 : Le nettoyage</h2>
      <p>Le matin, un nettoyage léger suffit :</p>
      <ul>
        <li>Peau grasse : gel moussant doux</li>
        <li>Peau sèche : eau micellaire</li>
        <li>Peau sensible : brume thermale</li>
      </ul>

      <h2>Minute 5-6 : L'hydratation ciblée</h2>
      <p>Appliquez votre sérum en tapotant du centre vers l'extérieur. Mon favori : acide hyaluronique + vitamine C pour hydratation et éclat.</p>

      <h2>Minute 7-8 : La crème protectrice</h2>
      <p>Une noisette de crème adaptée à votre type de peau. Massez en mouvements circulaires pour stimuler la circulation.</p>

      <h2>Minute 9-10 : La protection solaire</h2>
      <p>INDISPENSABLE ! SPF 30 minimum, même en hiver. Attendez 30 secondes avant le maquillage.</p>

      <h2>Mes astuces gain de temps</h2>
      <ul>
        <li>Préparez vos produits la veille</li>
        <li>Utilisez des produits multi-fonctions</li>
        <li>Gardez un spray d'eau thermale au frigo</li>
        <li>Investissez dans de bons basiques</li>
      </ul>

      <h2>L'erreur à éviter</h2>
      <p>Ne sautez JAMAIS la protection solaire. C'est LE geste anti-âge par excellence. 80% du vieillissement cutané est dû au soleil.</p>

      <h2>Pour aller plus loin</h2>
      <p>Une fois par mois, offrez-vous un soin professionnel pour maintenir les résultats. L'association routine maison + soins institut = peau parfaite.</p>

      <div class="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 p-6 rounded-xl mt-8">
        <h3 class="text-xl font-semibold text-[#2c3e50] mb-3">💫 Soin recommandé : Hydro'Cleaning Express</h3>
        <p class="text-[#2c3e50]/80 mb-4">Un nettoyage profond mensuel pour optimiser votre routine quotidienne.</p>
        <a href="/reservation" class="inline-block bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
          Réserver mon soin mensuel
        </a>
      </div>
    `,
    category: "Routines beauté",
    author: "Laïa",
    readTime: "5 min",
    tags: "routine, matin, conseils, quotidien",
    mainImage: "/services/hydro-cleaning.jpg",
    published: true,
    featured: false,
    publishedAt: new Date("2024-10-15")
  }
];

async function createBlogArticles() {
  try {
    // Supprimer les anciens articles
    await prisma.blogPost.deleteMany();
    
    // Créer les nouveaux articles
    for (const article of blogArticles) {
      await prisma.blogPost.create({
        data: article
      });
      console.log(`✅ Article créé : ${article.title}`);
    }
    
    console.log('\n✨ Tous les articles ont été créés avec succès !');
  } catch (error) {
    console.error('Erreur lors de la création des articles :', error);
  } finally {
    await prisma.$disconnect();
  }
}

createBlogArticles();