// Script pour mettre à jour le contenu des services avec des informations pertinentes et véridiques
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateServiceContent() {
  console.log('🎨 Mise à jour du contenu des services avec des informations professionnelles...\n');
  
  try {
    // BB Glow - Teint effet "maquillage permanent"
    await prisma.service.update({
      where: { slug: 'bb-glow' },
      data: {
        name: 'BB Glow',
        shortDescription: 'Le teint unifié et lumineux instantanément avec effet bonne mine durable',
        description: `Le BB Glow est une technique innovante de micro-needling qui dépose des pigments cosmétiques dans les couches superficielles de l'épiderme.

Ce soin révolutionnaire offre un effet "bonne mine" immédiat tout en traitant les imperfections cutanées. Les pigments utilisés sont spécialement formulés pour s'adapter à votre carnation naturelle.

Le résultat ? Un teint unifié, lumineux et éclatant qui dure plusieurs semaines, comme si vous portiez une BB crème naturelle en permanence.`,
        benefits: JSON.stringify([
          'Unifie le teint et réduit les taches pigmentaires',
          'Effet bonne mine immédiat et durable (3-6 mois)',
          'Atténue les cernes et les rougeurs',
          'Floute les pores dilatés',
          'Hydrate en profondeur et stimule le collagène',
          'Résultat naturel adapté à votre carnation'
        ]),
        process: JSON.stringify([
          'Démaquillage et nettoyage en profondeur de la peau',
          'Application d\'un sérum anesthésiant pour votre confort',
          'Micro-needling avec le cocktail BB Glow personnalisé',
          'Massage drainant pour optimiser la pénétration',
          'Application d\'un masque apaisant post-traitement',
          'Protection SPF et conseils post-soins personnalisés'
        ]),
        recommendations: `Éviter l'exposition solaire 48h avant le soin
Arrêter les rétinoïdes 1 semaine avant
Bien hydrater sa peau les jours précédents
Prévoir 3-4 séances pour un résultat optimal`,
        contraindications: `Grossesse et allaitement
Peau lésée ou irritée
Allergie aux pigments cosmétiques
Traitement par Roaccutane en cours
Herpès actif`,
        mainImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&h=800&fit=crop',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&h=600&fit=crop'
        ])
      }
    });
    console.log('✅ BB Glow mis à jour');
    
    // Hydro'Naissance - Hydrodermabrasion
    await prisma.service.update({
      where: { slug: 'hydro-naissance' },
      data: {
        name: 'Hydro\'Naissance',
        shortDescription: 'Le soin hydratant ultime par hydrodermabrasion pour une peau rebondie et éclatante',
        description: `L'Hydro'Naissance est notre soin signature d'hydrodermabrasion nouvelle génération qui combine exfoliation douce et hydratation intense.

Cette technologie utilise un système de vortex d'eau enrichie en actifs pour nettoyer, exfolier et hydrater simultanément. Les cellules mortes sont éliminées en douceur pendant que des sérums sur-mesure sont infusés dans la peau.

Adapté à tous les types de peau, ce soin offre des résultats visibles dès la première séance : peau plus lisse, pores resserrés et teint éclatant.`,
        benefits: JSON.stringify([
          'Nettoie en profondeur sans agresser',
          'Exfolie et élimine les cellules mortes',
          'Hydrate intensément toutes les couches de l\'épiderme',
          'Resserre visiblement les pores',
          'Stimule la circulation et le renouvellement cellulaire',
          'Éclat immédiat et effet repulpant'
        ]),
        process: JSON.stringify([
          'Analyse de peau et détermination du protocole personnalisé',
          'Double nettoyage et préparation de la peau',
          'Hydrodermabrasion avec aspiration contrôlée',
          'Infusion de sérums actifs adaptés à vos besoins',
          'Extraction douce des comédons si nécessaire',
          'Masque hydratant et massage lymphatique',
          'Application de la protection solaire'
        ]),
        recommendations: `Idéal avant un événement important
Peut être réalisé toute l'année
Excellent en cure de 4-6 séances
Compatible avec d'autres soins esthétiques`,
        contraindications: `Rosacée sévère en phase inflammatoire
Eczéma ou psoriasis actif
Plaies ouvertes sur le visage
Coup de soleil récent`,
        mainImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1200&h=800&fit=crop',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop'
        ])
      }
    });
    console.log('✅ Hydro\'Naissance mis à jour');
    
    // Renaissance - Peeling chimique doux
    await prisma.service.update({
      where: { slug: 'renaissance' },
      data: {
        name: 'Renaissance',
        shortDescription: 'Peeling nouvelle génération pour une peau neuve et rajeunie sans éviction sociale',
        description: `Le soin Renaissance est notre peeling chimique doux de dernière génération, formulé avec un complexe d'acides adaptés à votre type de peau.

Ce traitement progressif stimule le renouvellement cellulaire tout en respectant l'équilibre de votre peau. Les acides utilisés (glycolique, lactique, mandélique) sont dosés précisément pour offrir une exfoliation efficace sans agresser.

Parfait pour traiter les taches, les ridules et redonner de l'éclat, ce soin convient même aux peaux sensibles grâce à son approche douce et progressive.`,
        benefits: JSON.stringify([
          'Atténue les taches pigmentaires et unifie le teint',
          'Réduit l\'apparence des ridules et rides superficielles',
          'Affine le grain de peau et resserre les pores',
          'Stimule la production de collagène et d\'élastine',
          'Éclat et luminosité retrouvés',
          'Améliore la texture et la fermeté de la peau'
        ]),
        process: JSON.stringify([
          'Diagnostic approfondi et test de tolérance',
          'Préparation de la peau avec un nettoyant spécifique',
          'Application du peeling personnalisé par zones',
          'Temps de pose adapté à votre sensibilité cutanée',
          'Neutralisation et rinçage minutieux',
          'Application d\'un sérum régénérant et d\'un masque apaisant',
          'Protection solaire haute et conseils post-peeling'
        ]),
        recommendations: `Préparer la peau 2 semaines avant avec des cosméceutiques
Protection solaire SPF 50+ obligatoire
Éviter les gommages 1 semaine avant et après
Prévoir une cure de 3-6 séances espacées de 15 jours`,
        contraindications: `Grossesse et allaitement
Exposition solaire récente ou prévue
Herpès ou infection cutanée active
Traitement photosensibilisant en cours
Peau très réactive ou allergie aux acides`,
        mainImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&h=800&fit=crop',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1576091358783-a212ec293ff3?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1555820585-c5ae44394b79?w=800&h=600&fit=crop'
        ])
      }
    });
    console.log('✅ Renaissance mis à jour');
    
    // LED Thérapie
    await prisma.service.update({
      where: { slug: 'led-therapie' },
      data: {
        name: 'LED Thérapie',
        shortDescription: 'Photobiomodulation par LED médicales pour régénérer et apaiser votre peau',
        description: `La LED Thérapie utilise la puissance de la lumière pour stimuler les processus naturels de régénération cutanée. Nos LED médicales émettent des longueurs d'onde spécifiques qui pénètrent dans les différentes couches de la peau.

Chaque couleur a une action ciblée : le rouge stimule le collagène, le bleu purifie, le jaune apaise, et l'infrarouge régénère en profondeur. Cette technologie non invasive et indolore offre des résultats progressifs et durables.

Utilisée seule ou en complément d'autres soins, la LED thérapie optimise tous les traitements esthétiques et accélère la cicatrisation.`,
        benefits: JSON.stringify([
          'Stimule la production de collagène et d\'élastine',
          'Accélère la cicatrisation et la régénération cellulaire',
          'Réduit l\'inflammation et apaise les rougeurs',
          'Purifie et régule la production de sébum',
          'Améliore la circulation sanguine et lymphatique',
          'Action anti-âge globale sans effets secondaires'
        ]),
        process: JSON.stringify([
          'Installation confortable et protection oculaire',
          'Nettoyage doux de la peau',
          'Application d\'un sérum photosensibilisant si nécessaire',
          'Exposition LED personnalisée (15-30 minutes)',
          'Combinaison de couleurs selon vos besoins',
          'Application d\'un masque hydratant post-LED',
          'Conseils pour optimiser les résultats'
        ]),
        recommendations: `Idéal en cure de 10-12 séances
Peut être combiné avec tous les soins
Parfait après un peeling ou micro-needling
Aucune éviction sociale`,
        contraindications: `Épilepsie photosensible
Prise de médicaments photosensibilisants
Cancer de la peau
Porphyrie`,
        mainImage: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=1200&h=800&fit=crop',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1552693673-1bf958298935?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=600&fit=crop'
        ])
      }
    });
    console.log('✅ LED Thérapie mise à jour');
    
    console.log('\n✨ Tous les services ont été mis à jour avec du contenu professionnel !');
    console.log('📱 Allez voir les pages de services sur http://localhost:3001/services/[slug]');
    console.log('🛠️ Testez aussi l\'édition dans l\'admin : http://localhost:3001/admin');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateServiceContent();