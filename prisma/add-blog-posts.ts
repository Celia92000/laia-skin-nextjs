import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Ajout des articles de blog...');

  const blogPosts = [
    {
      title: "Les bienfaits de l'Hydro'Cleaning pour une peau purifiée",
      slug: "bienfaits-hydro-cleaning-peau-purifiee",
      category: "Soins",
      excerpt: "Découvrez comment l'Hydro'Cleaning révolutionne le nettoyage en profondeur de votre peau et lui redonne tout son éclat naturel.",
      content: `
        <h2>Une technologie innovante au service de votre peau</h2>
        <p>L'Hydro'Cleaning est bien plus qu'un simple nettoyage de peau. Cette technique avancée utilise la puissance de l'eau et des sérums actifs pour offrir à votre épiderme un soin complet et en profondeur.</p>
        
        <h3>Les 5 étapes clés du soin</h3>
        <ul>
          <li><strong>Nettoyage en profondeur</strong> : Élimination des impuretés et cellules mortes</li>
          <li><strong>Exfoliation douce</strong> : Révèle l'éclat naturel de la peau</li>
          <li><strong>Extraction</strong> : Désincruste les pores en douceur</li>
          <li><strong>Hydratation</strong> : Infusion de sérums nourrissants</li>
          <li><strong>Protection</strong> : Application d'antioxydants protecteurs</li>
        </ul>
        
        <h3>Les résultats visibles</h3>
        <p>Dès la première séance, votre peau est visiblement plus lumineuse, les pores sont resserrés et le grain de peau affiné. Un protocole de 3 séances espacées de 2 semaines permet d'obtenir des résultats durables.</p>
        
        <blockquote>"Ma peau n'a jamais été aussi douce et éclatante !" - Sophie D., cliente fidèle</blockquote>
        
        <h3>Pour qui est recommandé ce soin ?</h3>
        <p>L'Hydro'Cleaning convient à tous les types de peaux, même les plus sensibles. Il est particulièrement recommandé pour :</p>
        <ul>
          <li>Les peaux à imperfections</li>
          <li>Les teints ternes et fatigués</li>
          <li>Les pores dilatés</li>
          <li>Les peaux déshydratées</li>
        </ul>
        
        <p>N'attendez plus pour offrir à votre peau le soin qu'elle mérite !</p>
      `,
      mainImage: "/blog/hydro-cleaning-blog.jpg",
      published: true,
      featured: true,
      publishedAt: new Date('2025-01-15'),
      metaDescription: "Découvrez les bienfaits de l'Hydro'Cleaning, un soin révolutionnaire pour nettoyer, purifier et hydrater votre peau en profondeur.",
      tags: "hydro cleaning, nettoyage peau, soin visage, peau purifiée, hydratation, LAIA SKIN"
    },
    {
      title: "BB Glow : Le secret d'un teint parfait au quotidien",
      slug: "bb-glow-teint-parfait-quotidien",
      category: "Soins",
      excerpt: "Le BB Glow révolutionne votre routine beauté en vous offrant un teint unifié et lumineux qui dure plusieurs mois.",
      content: `
        <h2>Une innovation coréenne qui fait sensation</h2>
        <p>Le BB Glow est une technique semi-permanente qui permet d'obtenir l'effet d'une BB crème 24h/24, sans maquillage. Cette innovation venue de Corée du Sud conquiert de plus en plus d'adeptes en France.</p>
        
        <h3>Comment fonctionne le BB Glow ?</h3>
        <p>Cette technique utilise le microneedling pour faire pénétrer des pigments naturels dans les couches superficielles de l'épiderme. Le résultat ? Un teint unifié, lumineux et naturel qui dure entre 3 et 6 mois.</p>
        
        <h3>Les avantages du BB Glow</h3>
        <ul>
          <li><strong>Gain de temps</strong> : Plus besoin de fond de teint au quotidien</li>
          <li><strong>Effet bonne mine</strong> : Un teint frais et reposé au réveil</li>
          <li><strong>Correction des imperfections</strong> : Atténue taches, rougeurs et cernes</li>
          <li><strong>Stimulation du collagène</strong> : Améliore la texture de la peau</li>
          <li><strong>Résultat naturel</strong> : Un teint sublimé qui reste le vôtre</li>
        </ul>
        
        <h3>Le déroulé d'une séance</h3>
        <p>La séance commence par un nettoyage en profondeur, suivi d'une légère exfoliation. Ensuite, j'applique un sérum anesthésiant pour votre confort. Le BB sérum est alors déposé délicatement à l'aide d'un dermapen. La séance se termine par l'application d'un masque apaisant.</p>
        
        <h3>Combien de séances sont nécessaires ?</h3>
        <p>Pour un résultat optimal, je recommande un protocole de 3 à 4 séances espacées de 2 semaines. L'effet s'intensifie après chaque séance pour un résultat de plus en plus naturel et durable.</p>
        
        <p>Prête à dire adieu au fond de teint ? Le BB Glow vous attend !</p>
      `,
      mainImage: "/blog/bb-glow-blog.jpg",
      published: true,
      featured: false,
      publishedAt: new Date('2025-01-10'),
      metaDescription: "Le BB Glow, technique semi-permanente pour un teint parfait sans maquillage. Découvrez cette innovation beauté venue de Corée.",
      tags: "BB Glow, teint parfait, maquillage semi-permanent, microneedling, soin visage, beauté coréenne"
    },
    {
      title: "LED Thérapie : La lumière au service de votre beauté",
      slug: "led-therapie-lumiere-beaute",
      category: "Technologies",
      excerpt: "La photomodulation LED est une technologie non invasive qui utilise différentes longueurs d'onde pour traiter efficacement les problèmes de peau.",
      content: `
        <h2>La science de la lumière thérapeutique</h2>
        <p>La LED thérapie, aussi appelée photomodulation, utilise des diodes électroluminescentes pour stimuler les processus naturels de régénération cellulaire. Chaque couleur de LED a des propriétés spécifiques pour traiter différents problèmes de peau.</p>
        
        <h3>Les différentes couleurs et leurs bienfaits</h3>
        
        <h4>🔴 LED Rouge (630-700 nm)</h4>
        <ul>
          <li>Stimule la production de collagène</li>
          <li>Réduit les rides et ridules</li>
          <li>Améliore l'élasticité de la peau</li>
          <li>Accélère la cicatrisation</li>
        </ul>
        
        <h4>🔵 LED Bleue (415-445 nm)</h4>
        <ul>
          <li>Action antibactérienne</li>
          <li>Traite l'acné active</li>
          <li>Régule la production de sébum</li>
          <li>Purifie la peau</li>
        </ul>
        
        <h4>🟡 LED Jaune (570-590 nm)</h4>
        <ul>
          <li>Améliore la circulation lymphatique</li>
          <li>Réduit les rougeurs</li>
          <li>Effet détoxifiant</li>
          <li>Illumine le teint</li>
        </ul>
        
        <h3>Un traitement sans douleur et sans effets secondaires</h3>
        <p>La LED thérapie est totalement indolore et convient à tous les types de peaux. Les séances durent 20 à 30 minutes et peuvent être combinées avec d'autres soins pour maximiser les résultats.</p>
        
        <h3>Protocole recommandé</h3>
        <p>Pour des résultats optimaux, je recommande une cure de 10 séances à raison de 2 séances par semaine, suivie d'un entretien mensuel. Les premiers résultats sont visibles dès la 3ème séance.</p>
        
        <blockquote>"La LED thérapie a transformé ma peau acnéique. Je n'ai plus de boutons et ma peau est beaucoup plus lisse !" - Julie M.</blockquote>
        
        <p>Découvrez le pouvoir de la lumière pour sublimer votre peau naturellement !</p>
      `,
      mainImage: "/blog/led-therapy-blog.jpg",
      published: true,
      featured: false,
      publishedAt: new Date('2025-01-05'),
      metaDescription: "La LED thérapie utilise la lumière pour traiter l'acné, les rides et améliorer l'éclat de la peau. Découvrez cette technologie révolutionnaire.",
      tags: "LED thérapie, photomodulation, traitement acné, anti-âge, soin visage, lumière thérapeutique"
    },
    {
      title: "Renaissance : Le soin anti-âge global qui défie le temps",
      slug: "renaissance-soin-anti-age-global",
      category: "Anti-âge",
      excerpt: "Le soin Renaissance combine plusieurs technologies de pointe pour offrir une action anti-âge complète et visible dès la première séance.",
      content: `
        <h2>Un protocole exclusif pour rajeunir votre peau</h2>
        <p>Le soin Renaissance est notre protocole signature anti-âge qui combine les meilleures technologies pour offrir des résultats spectaculaires sur tous les signes du vieillissement cutané.</p>
        
        <h3>Les 4 phases du soin Renaissance</h3>
        
        <h4>Phase 1 : Préparation et nettoyage</h4>
        <p>Un nettoyage en profondeur avec exfoliation enzymatique prépare la peau à recevoir les actifs anti-âge.</p>
        
        <h4>Phase 2 : Stimulation cellulaire</h4>
        <p>Application de la radiofréquence pour stimuler la production de collagène et d'élastine en profondeur.</p>
        
        <h4>Phase 3 : Infusion d'actifs</h4>
        <p>Mésothérapie virtuelle avec un cocktail personnalisé d'acide hyaluronique, vitamines et peptides.</p>
        
        <h4>Phase 4 : Photomodulation</h4>
        <p>Séance de LED rouge pour optimiser la régénération cellulaire et apaiser la peau.</p>
        
        <h3>Les résultats du soin Renaissance</h3>
        <ul>
          <li>Rides et ridules visiblement atténuées</li>
          <li>Ovale du visage redessiné</li>
          <li>Peau plus ferme et tonique</li>
          <li>Teint unifié et lumineux</li>
          <li>Texture de peau affinée</li>
        </ul>
        
        <h3>Pour qui est recommandé ce soin ?</h3>
        <p>Le soin Renaissance est idéal à partir de 35 ans pour prévenir et traiter les signes de l'âge. Il convient particulièrement aux personnes qui recherchent :</p>
        <ul>
          <li>Une alternative non invasive aux injections</li>
          <li>Un rajeunissement global du visage</li>
          <li>Des résultats naturels et progressifs</li>
          <li>Un soin complet et personnalisé</li>
        </ul>
        
        <h3>Fréquence recommandée</h3>
        <p>Pour un effet optimal, je recommande une cure de 6 séances espacées de 15 jours, puis un entretien tous les 2 mois.</p>
        
        <p>Offrez à votre peau une véritable renaissance !</p>
      `,
      mainImage: "/blog/renaissance-blog.jpg",
      published: true,
      featured: true,
      publishedAt: new Date('2025-01-01'),
      metaDescription: "Le soin Renaissance combine radiofréquence, mésothérapie et LED pour un rajeunissement global du visage. Découvrez notre protocole anti-âge exclusif.",
      tags: "soin anti-âge, renaissance, radiofréquence, mésothérapie, rajeunissement visage, LAIA SKIN"
    },
    {
      title: "Préparer sa peau pour l'hiver : Mes conseils d'experte",
      slug: "preparer-peau-hiver-conseils-experte",
      category: "Conseils",
      excerpt: "L'hiver met notre peau à rude épreuve. Découvrez mes conseils professionnels pour protéger et nourrir votre épiderme pendant la saison froide.",
      content: `
        <h2>Les agressions hivernales sur notre peau</h2>
        <p>Le froid, le vent, les changements de température et le chauffage assèchent et fragilisent notre peau. Il est essentiel d'adapter sa routine beauté pour maintenir une peau saine et éclatante tout l'hiver.</p>
        
        <h3>Ma routine hivernale en 5 étapes</h3>
        
        <h4>1. Un nettoyage tout en douceur</h4>
        <p>Privilégiez les nettoyants doux sans savon, riches en agents hydratants. Évitez l'eau trop chaude qui décape le film hydrolipidique protecteur.</p>
        
        <h4>2. Une hydratation renforcée</h4>
        <p>Optez pour des textures plus riches : crèmes onctueuses, baumes nourrissants. N'oubliez pas le contour des yeux, zone particulièrement fragile.</p>
        
        <h4>3. La protection est essentielle</h4>
        <p>Même en hiver, la protection solaire reste indispensable ! Les UV sont présents même par temps couvert et la neige réfléchit 80% des rayons.</p>
        
        <h4>4. L'exfoliation en douceur</h4>
        <p>Une fois par semaine, éliminez les cellules mortes avec une exfoliation douce pour permettre aux soins de mieux pénétrer.</p>
        
        <h4>5. Les soins intensifs</h4>
        <p>C'est le moment idéal pour les masques hydratants et les sérums concentrés en acide hyaluronique.</p>
        
        <h3>Mes soins coup de cœur pour l'hiver</h3>
        <ul>
          <li><strong>Hydro'Naissance</strong> : Pour une hydratation en profondeur et durable</li>
          <li><strong>LED thérapie jaune</strong> : Pour stimuler la circulation et redonner de l'éclat</li>
          <li><strong>Renaissance</strong> : Pour nourrir intensément et régénérer la peau</li>
        </ul>
        
        <h3>Les gestes à éviter absolument</h3>
        <ul>
          <li>Les douches trop chaudes et prolongées</li>
          <li>Le chauffage excessif qui assèche l'air</li>
          <li>Les gommages trop agressifs</li>
          <li>L'oubli de la protection solaire</li>
          <li>La négligence des lèvres et des mains</li>
        </ul>
        
        <h3>Mon conseil bonus</h3>
        <p>Pensez à l'hydratation de l'intérieur ! Buvez au moins 1,5L d'eau par jour et privilégiez les aliments riches en oméga-3 (poissons gras, noix, graines de lin) pour nourrir votre peau de l'intérieur.</p>
        
        <p>N'attendez pas que votre peau souffre pour agir. Anticipez avec des soins adaptés pour traverser l'hiver en beauté !</p>
      `,
      mainImage: "/blog/winter-skin-blog.jpg",
      published: true,
      featured: false,
      publishedAt: new Date('2024-12-20'),
      metaDescription: "Conseils d'experte pour protéger et nourrir votre peau en hiver. Routine adaptée et soins recommandés pour une peau éclatante malgré le froid.",
      tags: "soin peau hiver, routine hiver, hydratation peau, protection peau froid, conseils beauté hiver"
    }
  ];

  for (const post of blogPosts) {
    const created = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post
    });
    console.log(`✅ Article créé/mis à jour : ${created.title}`);
  }

  console.log('\n✨ Tous les articles de blog ont été ajoutés avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });