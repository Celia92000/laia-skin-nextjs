const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateBlogPosts() {
  console.log('📚 Migration des articles de blog existants...\n');
  
  const articles = [
    {
      slug: 'hydrofacial-revolution',
      title: "L'HydroFacial : La Révolution du Nettoyage en Profondeur",
      excerpt: "Découvrez comment cette technologie médicale venue des États-Unis transforme les soins du visage grâce à son système breveté Vortex-Fusion®.",
      category: "Technologies Avancées",
      readTime: "5 min",
      featured: true,
      published: true,
      publishedAt: new Date('2025-01-15'),
      content: `
        <h2>Une technologie médicale révolutionnaire</h2>
        <p>L'HydroFacial représente une avancée majeure dans le domaine des soins esthétiques. Cette technologie, développée initialement pour un usage médical, utilise un système breveté de vortex d'eau pour nettoyer, exfolier et hydrater la peau simultanément.</p>

        <h3>Comment fonctionne l'HydroFacial ?</h3>
        <p>Le traitement utilise une technologie Vortex-Fusion® qui crée un tourbillon d'eau permettant de :</p>
        <ul>
          <li>Nettoyer en profondeur les pores</li>
          <li>Exfolier les cellules mortes en douceur</li>
          <li>Extraire les impuretés sans douleur</li>
          <li>Infuser des sérums actifs personnalisés</li>
        </ul>

        <h3>Les bénéfices immédiats</h3>
        <p>Contrairement aux peelings traditionnels, l'HydroFacial offre des résultats visibles immédiatement après le traitement, sans éviction sociale. La peau est instantanément plus lumineuse, hydratée et les pores sont visiblement resserrés.</p>

        <h3>Pour qui est fait ce soin ?</h3>
        <p>L'HydroFacial convient à tous les types de peau, même les plus sensibles. Il est particulièrement recommandé pour :</p>
        <ul>
          <li>Les peaux congestionnées avec pores dilatés</li>
          <li>Les teints ternes manquant d'éclat</li>
          <li>Les peaux déshydratées</li>
          <li>Les premiers signes de l'âge</li>
        </ul>

        <p>Chez LAIA SKIN Institut, nous proposons ce soin sous le nom "Hydro'Cleaning", adapté avec des protocoles personnalisés selon vos besoins spécifiques.</p>
      `
    },
    {
      slug: 'microneedling-science',
      title: "La Science du Microneedling : Stimuler le Collagène Naturellement",
      excerpt: "Comprendre comment les micro-perforations contrôlées déclenchent le processus de régénération cellulaire pour une peau visiblement rajeunie.",
      category: "Anti-âge",
      readTime: "7 min",
      featured: false,
      published: true,
      publishedAt: new Date('2025-01-10'),
      content: `
        <h2>Le principe scientifique du microneedling</h2>
        <p>Le microneedling, ou thérapie d'induction du collagène, repose sur un principe simple mais efficace : créer des micro-lésions contrôlées dans la peau pour déclencher son processus naturel de régénération.</p>

        <h3>La cascade de cicatrisation</h3>
        <p>Lorsque les micro-aiguilles pénètrent dans le derme, elles déclenchent une cascade de réactions biologiques :</p>
        <ol>
          <li><strong>Phase inflammatoire</strong> : Les plaquettes libèrent des facteurs de croissance</li>
          <li><strong>Phase proliférative</strong> : Production de nouveau collagène et d'élastine</li>
          <li><strong>Phase de remodelage</strong> : Organisation et renforcement de la matrice dermique</li>
        </ol>

        <h3>Les résultats cliniquement prouvés</h3>
        <p>Des études scientifiques ont démontré une augmentation de 400% de la production de collagène après une série de traitements. Les améliorations observées incluent :</p>
        <ul>
          <li>Réduction de 45% de la profondeur des rides</li>
          <li>Amélioration de 80% de l'apparence des cicatrices</li>
          <li>Uniformisation du teint dans 90% des cas</li>
        </ul>

        <h3>Notre approche au LAIA SKIN Institut</h3>
        <p>Nous utilisons le microneedling dans plusieurs de nos protocoles, notamment le BB Glow, où nous combinons cette technique avec l'application de pigments cosmétiques pour un effet "bonne mine" durable.</p>
      `
    },
    {
      slug: 'bb-glow-coree',
      title: "BB Glow : L'Innovation Coréenne pour un Teint Parfait",
      excerpt: "Entre mésothérapie et maquillage semi-permanent, découvrez cette technique révolutionnaire venue de Corée du Sud.",
      category: "Innovations",
      readTime: "6 min",
      featured: false,
      published: true,
      publishedAt: new Date('2025-01-05'),
      content: `
        <h2>L'origine du BB Glow</h2>
        <p>Le BB Glow est né en Corée du Sud, pays reconnu pour ses innovations en matière de beauté et de soins de la peau. Cette technique combine le microneedling avec l'application de pigments cosmétiques spécialement formulés.</p>

        <h3>Un maquillage qui soigne</h3>
        <p>Contrairement au maquillage traditionnel, le BB Glow agit en profondeur. Les pigments sont déposés dans les couches superficielles de l'épiderme, créant un effet "bonne mine" qui dure plusieurs semaines tout en traitant la peau.</p>

        <h3>La composition des sérums BB Glow</h3>
        <p>Les sérums utilisés contiennent :</p>
        <ul>
          <li>Des pigments minéraux adaptés à chaque carnation</li>
          <li>De l'acide hyaluronique pour l'hydratation</li>
          <li>Des peptides pour stimuler le collagène</li>
          <li>De la niacinamide pour l'éclat</li>
          <li>Des vitamines antioxydantes</li>
        </ul>

        <h3>Les résultats du BB Glow</h3>
        <p>Après une séance, la peau présente :</p>
        <ul>
          <li>Un teint unifié et lumineux</li>
          <li>Une réduction visible des taches pigmentaires</li>
          <li>Un effet "blur" sur les pores</li>
          <li>Une hydratation en profondeur</li>
        </ul>

        <p>Chez LAIA SKIN Institut, nous proposons le BB Glow en cure de 3 à 4 séances pour un résultat optimal qui dure entre 3 et 6 mois.</p>
      `
    },
    {
      slug: 'led-therapie-nasa',
      title: "La technique LED : De la NASA à Votre Peau",
      excerpt: "Comment la technique LED développée pour les astronautes est devenue l'un des traitements anti-âge les plus efficaces.",
      category: "Technologies",
      readTime: "4 min",
      featured: false,
      published: true,
      publishedAt: new Date('2024-12-28'),
      content: `
        <h2>L'histoire fascinante de la LED thérapie</h2>
        <p>Dans les années 1990, la NASA a développé la technologie LED pour accélérer la cicatrisation des astronautes en apesanteur. Cette découverte a révolutionné les soins esthétiques.</p>

        <h3>Le principe de la photobiomodulation</h3>
        <p>Les LED émettent des longueurs d'onde spécifiques qui pénètrent dans les cellules et stimulent les mitochondries, les "centrales énergétiques" cellulaires. Chaque couleur a une action ciblée :</p>
        <ul>
          <li><strong>Rouge (630-700nm)</strong> : Stimule le collagène et l'élastine</li>
          <li><strong>Bleu (415-445nm)</strong> : Action antibactérienne, traite l'acné</li>
          <li><strong>Jaune (570-590nm)</strong> : Améliore la circulation, apaise</li>
          <li><strong>Infrarouge (700-1000nm)</strong> : Régénération profonde</li>
        </ul>

        <h3>Les bénéfices scientifiquement prouvés</h3>
        <p>Des études cliniques ont démontré :</p>
        <ul>
          <li>Augmentation de 200% de la production de collagène</li>
          <li>Réduction de 75% de l'inflammation</li>
          <li>Amélioration de 90% de la texture de la peau</li>
        </ul>

        <h3>Notre protocole LED Thérapie</h3>
        <p>Au LAIA SKIN Institut, nous utilisons des LED médicales de dernière génération dans notre protocole LED Thérapie, souvent en complément d'autres soins pour optimiser les résultats.</p>
      `
    },
    {
      slug: 'routine-soins-hiver',
      title: "Adapter Sa Routine de Soins en Hiver",
      excerpt: "Mes conseils pour protéger et hydrater votre peau pendant la saison froide.",
      category: "Conseils",
      readTime: "3 min",
      featured: false,
      published: true,
      publishedAt: new Date('2024-12-20'),
      content: `
        <h2>Les défis de l'hiver pour votre peau</h2>
        <p>Le froid, le vent et les changements de température agressent quotidiennement votre peau en hiver. Il est essentiel d'adapter votre routine pour maintenir une peau saine et éclatante.</p>

        <h3>Les gestes essentiels</h3>
        <ol>
          <li><strong>Nettoyer en douceur</strong> : Privilégiez les nettoyants doux sans savon</li>
          <li><strong>Hydrater intensément</strong> : Optez pour des textures plus riches</li>
          <li><strong>Protéger</strong> : La protection solaire reste indispensable, même en hiver</li>
          <li><strong>Exfolier avec modération</strong> : Une fois par semaine suffit</li>
        </ol>

        <h3>Les soins professionnels recommandés</h3>
        <p>En hiver, certains soins sont particulièrement bénéfiques :</p>
        <ul>
          <li><strong>Hydro'Naissance</strong> : Pour une hydratation en profondeur</li>
          <li><strong>LED Thérapie</strong> : Pour stimuler la régénération</li>
          <li><strong>BB Glow</strong> : Pour un teint lumineux malgré la grisaille</li>
        </ul>

        <h3>Nos conseils d'experte</h3>
        <p>N'attendez pas que votre peau montre des signes de déshydratation. La prévention est la clé d'une peau belle en toute saison. Venez nous voir pour un diagnostic personnalisé et un protocole adapté à vos besoins hivernaux.</p>
      `
    }
  ];

  try {
    for (const article of articles) {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: article.slug }
      });

      if (existing) {
        console.log(`⏭️  Article "${article.title}" existe déjà`);
        continue;
      }

      await prisma.blogPost.create({
        data: article
      });
      
      console.log(`✅ Article créé: "${article.title}"`);
    }

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('📝 Les articles sont maintenant dans la base de données');
    console.log('👉 Allez dans l\'admin pour les gérer : http://localhost:3001/admin');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrateBlogPosts();