import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🎨 Création d'articles de blog magnifiques...")

  // Supprimer les anciens articles
  await prisma.blogPost.deleteMany({})
  console.log("✅ Articles précédents supprimés")

  const articles = [
    {
      slug: "hydradermabrasion-revolution-douce",
      title: "L'Hydradermabrasion : La Révolution Douce",
      excerpt: "Découvrez comment l'eau transforme les soins du visage en profondeur, sans agression.",
      content: `
        <div style="line-height: 1.8; color: #2c3e50;">
          
          <p style="font-size: 1.25rem; margin-bottom: 2rem; font-style: italic; color: #d4b5a0;">
            L'eau, source de vie, devient instrument de beauté.
          </p>

          <p style="margin-bottom: 2rem;">
            L'hydradermabrasion représente une véritable révolution dans l'univers des soins esthétiques. 
            Contrairement aux méthodes traditionnelles qui peuvent agresser la peau, cette technique utilise 
            la puissance douce de l'eau pour nettoyer, exfolier et hydrater simultanément.
          </p>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Comment fonctionne cette magie aquatique ?
          </h2>

          <div style="background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%); padding: 2rem; border-radius: 15px; margin: 2rem 0;">
            <h3 style="color: #d4b5a0; margin-bottom: 1rem;">Les 3 actions simultanées</h3>
            
            <div style="margin-bottom: 1.5rem;">
              <strong style="color: #2c3e50;">1. Nettoyage en profondeur</strong>
              <p style="margin: 0.5rem 0 0 1.5rem;">Un vortex d'eau pénètre délicatement dans chaque pore.</p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
              <strong style="color: #2c3e50;">2. Extraction sans douleur</strong>
              <p style="margin: 0.5rem 0 0 1.5rem;">Les impuretés sont aspirées en douceur, sans traumatisme.</p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
              <strong style="color: #2c3e50;">3. Infusion de sérums</strong>
              <p style="margin: 0.5rem 0 0 1.5rem;">Des actifs nutritifs sont déposés au cœur de la peau.</p>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Les résultats ? Spectaculaires et immédiats
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="text-align: center; padding: 1.5rem; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 2rem; color: #d4b5a0; margin-bottom: 0.5rem;">65%</div>
              <div>Pores plus nets</div>
            </div>
            <div style="text-align: center; padding: 1.5rem; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 2rem; color: #d4b5a0; margin-bottom: 0.5rem;">+32%</div>
              <div>Hydratation immédiate</div>
            </div>
            <div style="text-align: center; padding: 1.5rem; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="font-size: 2rem; color: #d4b5a0; margin-bottom: 0.5rem;">95%</div>
              <div>Satisfaction client</div>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Pour qui ?
          </h2>

          <p style="margin-bottom: 1.5rem;">
            Cette technique convient à <strong>tous les types de peau</strong>, même les plus sensibles :
          </p>

          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 1rem; padding-left: 2rem; position: relative;">
              <span style="position: absolute; left: 0; color: #d4b5a0;">✓</span>
              <strong>Peau grasse</strong> : Pores purifiés sans stimuler le sébum
            </li>
            <li style="margin-bottom: 1rem; padding-left: 2rem; position: relative;">
              <span style="position: absolute; left: 0; color: #d4b5a0;">✓</span>
              <strong>Peau sèche</strong> : Hydratation maximale et durable
            </li>
            <li style="margin-bottom: 1rem; padding-left: 2rem; position: relative;">
              <span style="position: absolute; left: 0; color: #d4b5a0;">✓</span>
              <strong>Peau sensible</strong> : Aucune agression, que de la douceur
            </li>
            <li style="margin-bottom: 1rem; padding-left: 2rem; position: relative;">
              <span style="position: absolute; left: 0; color: #d4b5a0;">✓</span>
              <strong>Peau mature</strong> : Stimulation du renouvellement cellulaire
            </li>
          </ul>

          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 3rem; border-radius: 20px; margin: 3rem 0; text-align: center;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Découvrez notre Hydro'Cleaning</h3>
            <p style="margin-bottom: 2rem;">
              60 minutes de transformation douce pour votre peau
            </p>
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">80€</div>
            <div style="font-size: 1rem; opacity: 0.9; margin-bottom: 2rem;">Forfait 3 séances : 210€</div>
            <a href="/services/hydro-cleaning" style="display: inline-block; background: white; color: #d4b5a0; padding: 1rem 2rem; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 1rem;">
              Découvrir ce soin →
            </a>
          </div>

        </div>
      `,
      category: "Techniques",
      author: "LAIA SKIN Institut",
      readTime: "4",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["hydradermabrasion", "nettoyage", "hydratation"]),
      metaTitle: "Hydradermabrasion : La Révolution Douce | LAIA SKIN",
      metaDescription: "L'hydradermabrasion nettoie et hydrate en douceur. Découvrez cette technique chez LAIA SKIN."
    },
    {
      slug: "dermapen-regeneration-naturelle",
      title: "Dermapen : Réveiller la Jeunesse de Votre Peau",
      excerpt: "Comment de micro-stimulations contrôlées peuvent déclencher une régénération spectaculaire.",
      content: `
        <div style="line-height: 1.8; color: #2c3e50;">
          
          <p style="font-size: 1.25rem; margin-bottom: 2rem; text-align: center; color: #d4b5a0;">
            Votre peau possède un super-pouvoir : l'auto-régénération.
            <br/>Le Dermapen sait comment le réveiller.
          </p>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            La science de la régénération
          </h2>

          <p style="margin-bottom: 2rem;">
            Le Dermapen utilise 12 micro-aiguilles ultra-fines qui créent des micro-canaux invisibles dans la peau.
            Cette stimulation contrôlée déclenche une cascade de réactions biologiques fascinantes.
          </p>

          <div style="background: #faf8f5; padding: 2rem; border-radius: 15px; margin: 2rem 0;">
            <h3 style="color: #d4b5a0; margin-bottom: 1.5rem;">Le processus en 3 phases</h3>
            
            <div style="border-left: 3px solid #d4b5a0; padding-left: 1.5rem; margin-bottom: 2rem;">
              <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">Phase 1 : Inflammation (Jour 0-3)</h4>
              <p>Les cellules détectent les micro-lésions et lancent le processus de réparation.</p>
            </div>
            
            <div style="border-left: 3px solid #d4b5a0; padding-left: 1.5rem; margin-bottom: 2rem;">
              <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">Phase 2 : Prolifération (Jour 4-14)</h4>
              <p>Production massive de collagène et d'élastine. Les fibroblastes travaillent à plein régime.</p>
            </div>
            
            <div style="border-left: 3px solid #d4b5a0; padding-left: 1.5rem;">
              <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">Phase 3 : Remodelage (Semaine 2-12)</h4>
              <p>Le nouveau collagène se structure, la peau se raffermit visiblement.</p>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Les résultats prouvés scientifiquement
          </h2>

          <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin: 2rem 0;">
            <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); flex: 1; min-width: 200px;">
              <div style="color: #d4b5a0; font-size: 2.5rem; font-weight: bold; text-align: center;">+400%</div>
              <div style="text-align: center; margin-top: 0.5rem;">Collagène en 6 mois</div>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); flex: 1; min-width: 200px;">
              <div style="color: #d4b5a0; font-size: 2.5rem; font-weight: bold; text-align: center;">70%</div>
              <div style="text-align: center; margin-top: 0.5rem;">Amélioration cicatrices</div>
            </div>
            <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); flex: 1; min-width: 200px;">
              <div style="color: #d4b5a0; font-size: 2.5rem; font-weight: bold; text-align: center;">-30%</div>
              <div style="text-align: center; margin-top: 0.5rem;">Rides atténuées</div>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Ce que ça traite efficacement
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="padding: 1.5rem; background: linear-gradient(135deg, #faf8f5 0%, white 100%); border-radius: 10px;">
              <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Cicatrices d'acné</h4>
              <p style="margin: 0;">Les meilleures améliorations, surtout sur les cicatrices en creux.</p>
            </div>
            <div style="padding: 1.5rem; background: linear-gradient(135deg, #faf8f5 0%, white 100%); border-radius: 10px;">
              <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Rides et ridules</h4>
              <p style="margin: 0;">Lissage visible des rides superficielles et moyennes.</p>
            </div>
            <div style="padding: 1.5rem; background: linear-gradient(135deg, #faf8f5 0%, white 100%); border-radius: 10px;">
              <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Pores dilatés</h4>
              <p style="margin: 0;">Resserrement durable et amélioration de la texture.</p>
            </div>
            <div style="padding: 1.5rem; background: linear-gradient(135deg, #faf8f5 0%, white 100%); border-radius: 10px;">
              <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Vergetures</h4>
              <p style="margin: 0;">Résultats remarquables sur les vergetures récentes.</p>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            L'expérience Dermapen
          </h2>

          <p style="margin-bottom: 1.5rem;">
            <strong>Sensation :</strong> Légers picotements, comme de petites vibrations<br/>
            <strong>Durée :</strong> 60 minutes avec préparation et soin post-traitement<br/>
            <strong>Rougeurs :</strong> 24-48h, comme un léger coup de soleil<br/>
            <strong>Maquillage :</strong> Possible après 24h
          </p>

          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 3rem; border-radius: 20px; margin: 3rem 0; text-align: center;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Notre soin Renaissance</h3>
            <p style="margin-bottom: 2rem;">
              Le Dermapen professionnel pour régénérer votre peau en profondeur
            </p>
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">120€</div>
            <div style="font-size: 1rem; opacity: 0.9; margin-bottom: 2rem;">Cure transformation : 320€ (3 séances)</div>
            <a href="/services/renaissance" style="display: inline-block; background: white; color: #d4b5a0; padding: 1rem 2rem; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 1rem;">
              Découvrir ce soin →
            </a>
          </div>

        </div>
      `,
      category: "Anti-âge",
      author: "LAIA SKIN Institut",
      readTime: "5",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["dermapen", "microneedling", "collagène"]),
      metaTitle: "Dermapen : Régénération Naturelle | LAIA SKIN",
      metaDescription: "Le Dermapen stimule naturellement votre collagène. Découvrez notre soin Renaissance."
    },
    {
      slug: "led-therapie-lumiere-guerit",
      title: "LED Thérapie : La Lumière qui Guérit",
      excerpt: "De la NASA à votre peau, découvrez le pouvoir thérapeutique prouvé de la lumière.",
      content: `
        <div style="line-height: 1.8; color: #2c3e50;">
          
          <div style="background: linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
            <p style="font-size: 1.1rem; text-align: center; margin: 0; font-style: italic;">
              "La NASA l'utilise pour soigner les astronautes.<br/>
              Maintenant, cette technologie sublime votre peau."
            </p>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            L'histoire fascinante
          </h2>

          <p style="margin-bottom: 2rem;">
            Tout a commencé dans l'espace. La NASA cultivait des plantes avec des LED pour économiser l'énergie.
            Surprise : les plantes poussaient 5 fois plus vite. Puis ils ont découvert que les blessures des astronautes
            guérissaient 50% plus rapidement près de ces lumières.
          </p>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Chaque couleur, une mission
          </h2>

          <div style="margin: 2rem 0;">
            
            <div style="background: rgba(66, 153, 225, 0.1); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
              <h3 style="color: #4299E1; margin-bottom: 0.5rem;">🔵 BLEU (415nm) - Anti-Acné</h3>
              <p style="margin: 0.5rem 0;">Détruit les bactéries responsables de l'acné</p>
              <p style="margin: 0; font-weight: bold;">Résultat : -77% d'acné en 12 séances</p>
            </div>
            
            <div style="background: rgba(245, 101, 101, 0.1); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
              <h3 style="color: #F56565; margin-bottom: 0.5rem;">🔴 ROUGE (630nm) - Anti-Âge</h3>
              <p style="margin: 0.5rem 0;">Stimule la production de collagène</p>
              <p style="margin: 0; font-weight: bold;">Résultat : +35% de fermeté cutanée</p>
            </div>
            
            <div style="background: rgba(237, 204, 69, 0.1); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
              <h3 style="color: #ECC94B; margin-bottom: 0.5rem;">🟡 JAUNE (590nm) - Éclat</h3>
              <p style="margin: 0.5rem 0;">Unifie le teint et réduit les rougeurs</p>
              <p style="margin: 0; font-weight: bold;">Résultat : Teint lumineux immédiat</p>
            </div>
            
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Comment ça marche scientifiquement ?
          </h2>

          <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem 0;">
            <ol style="margin: 0; padding-left: 1.5rem;">
              <li style="margin-bottom: 1rem;">
                <strong>Les photons pénètrent la peau</strong><br/>
                <span style="color: #666;">À différentes profondeurs selon la couleur</span>
              </li>
              <li style="margin-bottom: 1rem;">
                <strong>Les mitochondries absorbent la lumière</strong><br/>
                <span style="color: #666;">Nos "centrales énergétiques" cellulaires</span>
              </li>
              <li style="margin-bottom: 1rem;">
                <strong>Production d'ATP augmentée</strong><br/>
                <span style="color: #666;">+150% d'énergie cellulaire</span>
              </li>
              <li style="margin-bottom: 0;">
                <strong>Régénération accélérée</strong><br/>
                <span style="color: #666;">Les cellules travaillent plus efficacement</span>
              </li>
            </ol>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Les preuves scientifiques
          </h2>

          <div style="text-align: center; margin: 2rem 0;">
            <div style="display: inline-block; margin: 0 1rem;">
              <div style="font-size: 2.5rem; color: #d4b5a0; font-weight: bold;">4000+</div>
              <div>Études publiées</div>
            </div>
            <div style="display: inline-block; margin: 0 1rem;">
              <div style="font-size: 2.5rem; color: #d4b5a0; font-weight: bold;">FDA</div>
              <div>Approuvé</div>
            </div>
            <div style="display: inline-block; margin: 0 1rem;">
              <div style="font-size: 2.5rem; color: #d4b5a0; font-weight: bold;">98%</div>
              <div>Satisfaction</div>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            L'expérience LED
          </h2>

          <p style="margin-bottom: 2rem;">
            Imaginez-vous confortablement installée, la lumière baignant doucement votre visage.
            Aucune sensation désagréable, juste une chaleur apaisante. 20 minutes de pure régénération cellulaire.
          </p>

          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 3rem; border-radius: 20px; margin: 3rem 0; text-align: center;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Notre protocole LED Thérapie</h3>
            <p style="margin-bottom: 2rem;">
              45 minutes incluant préparation, exposition LED personnalisée et masque booster
            </p>
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">45€</div>
            <div style="font-size: 1rem; opacity: 0.9; margin-bottom: 2rem;">Cure éclat : 240€ (6 séances)</div>
            <a href="/services/led-therapie" style="display: inline-block; background: white; color: #d4b5a0; padding: 1rem 2rem; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 1rem;">
              Découvrir ce soin →
            </a>
          </div>

        </div>
      `,
      category: "Innovation",
      author: "LAIA SKIN Institut",
      readTime: "6",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["LED", "photothérapie", "NASA"]),
      metaTitle: "LED Thérapie : La Lumière qui Guérit | LAIA SKIN",
      metaDescription: "Découvrez la LED thérapie, technologie NASA pour votre peau. 45€ chez LAIA SKIN."
    },
    {
      slug: "bb-glow-teint-parfait",
      title: "BB Glow : Le Secret Coréen du Teint Parfait",
      excerpt: "4 à 8 semaines de teint unifié sans maquillage, c'est possible.",
      content: `
        <div style="line-height: 1.8; color: #2c3e50;">
          
          <div style="text-align: center; margin-bottom: 2rem;">
            <p style="font-size: 1.3rem; color: #d4b5a0; font-weight: 300;">
              Et si vous vous réveilliez maquillée naturellement ?
            </p>
          </div>

          <p style="margin-bottom: 2rem;">
            Le BB Glow est né en Corée du Sud, pays où la perfection de la peau est élevée au rang d'art.
            Cette technique révolutionnaire infuse des pigments semi-permanents dans l'épiderme pour créer
            un effet "bonne mine" qui dure plusieurs semaines.
          </p>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Comment ça fonctionne ?
          </h2>

          <div style="background: #faf8f5; padding: 2rem; border-radius: 15px; margin: 2rem 0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
              
              <div style="text-align: center;">
                <div style="background: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">1</div>
                <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Analyse</h4>
                <p style="margin: 0; font-size: 0.9rem;">Choix de la teinte parfaite parmi 12 nuances</p>
              </div>
              
              <div style="text-align: center;">
                <div style="background: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">2</div>
                <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Application</h4>
                <p style="margin: 0; font-size: 0.9rem;">Micro-infusion du sérum BB dans l'épiderme</p>
              </div>
              
              <div style="text-align: center;">
                <div style="background: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.5rem;">3</div>
                <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Résultat</h4>
                <p style="margin: 0; font-size: 0.9rem;">Teint unifié naturel pendant 4-8 semaines</p>
              </div>
              
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Ce que contient le sérum BB
          </h2>

          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 1rem; display: flex; align-items: center;">
              <span style="color: #d4b5a0; margin-right: 1rem; font-size: 1.5rem;">💧</span>
              <div>
                <strong>Pigments minéraux</strong><br/>
                <span style="font-size: 0.9rem; color: #666;">Pour une couleur naturelle adaptée</span>
              </div>
            </li>
            <li style="margin-bottom: 1rem; display: flex; align-items: center;">
              <span style="color: #d4b5a0; margin-right: 1rem; font-size: 1.5rem;">💧</span>
              <div>
                <strong>Acide hyaluronique</strong><br/>
                <span style="font-size: 0.9rem; color: #666;">Hydratation profonde et durable</span>
              </div>
            </li>
            <li style="margin-bottom: 1rem; display: flex; align-items: center;">
              <span style="color: #d4b5a0; margin-right: 1rem; font-size: 1.5rem;">💧</span>
              <div>
                <strong>Niacinamide & Peptides</strong><br/>
                <span style="font-size: 0.9rem; color: #666;">Éclat et fermeté de la peau</span>
              </div>
            </li>
          </ul>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Les vrais avantages
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0;">
            <div style="padding: 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ✓ Se réveiller avec bonne mine
            </div>
            <div style="padding: 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ✓ Aller à la piscine sans stress
            </div>
            <div style="padding: 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ✓ Gain de temps quotidien
            </div>
            <div style="padding: 1rem; background: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ✓ Économies de maquillage
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Soyons honnêtes
          </h2>

          <p style="margin-bottom: 2rem;">
            Le BB Glow n'est pas magique. Il ne cache pas les cicatrices profondes ou l'acné active.
            Mais il unifie le teint, camoufle les petites imperfections et donne cet effet "bonne mine" 
            que nous recherchons toutes.
          </p>

          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 3rem; border-radius: 20px; margin: 3rem 0; text-align: center;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Notre BB Glow</h3>
            <p style="margin-bottom: 2rem;">
              Pour un teint parfait qui dure vraiment
            </p>
            <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">90€</div>
            <div style="font-size: 1rem; opacity: 0.9; margin-bottom: 2rem;">Forfait perfection : 240€ (3 séances)</div>
            <a href="/services/bb-glow" style="display: inline-block; background: white; color: #d4b5a0; padding: 1rem 2rem; border-radius: 30px; text-decoration: none; font-weight: bold; margin-top: 1rem;">
              Découvrir ce soin →
            </a>
          </div>

        </div>
      `,
      category: "K-Beauty",
      author: "LAIA SKIN Institut",
      readTime: "5",
      featured: false,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["bb glow", "k-beauty", "teint parfait"]),
      metaTitle: "BB Glow : Teint Parfait Semi-Permanent | LAIA SKIN",
      metaDescription: "Le BB Glow offre 4-8 semaines de teint unifié. Technique coréenne chez LAIA SKIN."
    },
    {
      slug: "hydro-naissance-synergie-parfaite",
      title: "Hydro'Naissance : La Synergie Parfaite",
      excerpt: "Notre soin signature qui combine le meilleur de deux mondes pour une transformation complète.",
      content: `
        <div style="line-height: 1.8; color: #2c3e50;">
          
          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 2rem; border-radius: 15px; margin-bottom: 2rem; text-align: center;">
            <p style="font-size: 1.1rem; margin: 0;">
              <strong>SOIN SIGNATURE</strong><br/>
              L'excellence de deux techniques en une séance
            </p>
          </div>

          <p style="font-size: 1.2rem; margin-bottom: 2rem; text-align: center;">
            Pourquoi choisir entre hydratation profonde et régénération cellulaire<br/>
            quand vous pouvez avoir les deux ?
          </p>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            La combinaison révolutionnaire
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0;">
            
            <div style="background: linear-gradient(135deg, #e3f2fd 0%, white 100%); padding: 2rem; border-radius: 15px;">
              <h3 style="color: #4299E1; margin-bottom: 1rem;">Hydro'Cleaning</h3>
              <p style="margin-bottom: 1rem;">La première phase nettoie et prépare :</p>
              <ul style="margin: 0; padding-left: 1.5rem;">
                <li>Extraction des impuretés par vortex d'eau</li>
                <li>Exfoliation douce sans agression</li>
                <li>Hydratation profonde des couches cutanées</li>
              </ul>
            </div>
            
            <div style="background: linear-gradient(135deg, #fce4ec 0%, white 100%); padding: 2rem; border-radius: 15px;">
              <h3 style="color: #F56565; margin-bottom: 1rem;">Renaissance</h3>
              <p style="margin-bottom: 1rem;">La seconde phase régénère et transforme :</p>
              <ul style="margin: 0; padding-left: 1.5rem;">
                <li>Stimulation du collagène par Dermapen</li>
                <li>Activation du renouvellement cellulaire</li>
                <li>Raffermissement et lifting naturel</li>
              </ul>
            </div>
            
          </div>

          <div style="text-align: center; margin: 2rem 0;">
            <div style="display: inline-block; background: #faf8f5; padding: 1rem 2rem; border-radius: 30px;">
              <span style="font-size: 1.5rem; color: #d4b5a0;">= Transformation totale en 90 minutes</span>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Le protocole détaillé
          </h2>

          <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 2rem 0;">
            <div style="border-left: 4px solid #d4b5a0; padding-left: 1.5rem; margin-bottom: 1.5rem;">
              <strong>0-10 min :</strong> Diagnostic personnalisé de votre peau
            </div>
            <div style="border-left: 4px solid #d4b5a0; padding-left: 1.5rem; margin-bottom: 1.5rem;">
              <strong>10-20 min :</strong> Double nettoyage professionnel
            </div>
            <div style="border-left: 4px solid #d4b5a0; padding-left: 1.5rem; margin-bottom: 1.5rem;">
              <strong>20-50 min :</strong> Hydradermabrasion complète
            </div>
            <div style="border-left: 4px solid #d4b5a0; padding-left: 1.5rem; margin-bottom: 1.5rem;">
              <strong>50-70 min :</strong> Stimulation Dermapen 0.5mm
            </div>
            <div style="border-left: 4px solid #d4b5a0; padding-left: 1.5rem; margin-bottom: 1.5rem;">
              <strong>70-85 min :</strong> Masque apaisant sur-mesure
            </div>
            <div style="border-left: 4px solid #d4b5a0; padding-left: 1.5rem;">
              <strong>85-90 min :</strong> Protection et conseils personnalisés
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Les résultats extraordinaires
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
            <div style="text-align: center;">
              <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Immédiatement</h4>
              <p style="font-size: 0.9rem;">Peau nette, éclat incomparable, hydratation maximale</p>
            </div>
            <div style="text-align: center;">
              <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Après 1 semaine</h4>
              <p style="font-size: 0.9rem;">Texture affinée, pores resserrés, teint unifié</p>
            </div>
            <div style="text-align: center;">
              <h4 style="color: #d4b5a0; margin-bottom: 0.5rem;">Après 1 mois</h4>
              <p style="font-size: 0.9rem;">Rides atténuées, fermeté retrouvée, rajeunissement visible</p>
            </div>
          </div>

          <h2 style="font-size: 1.75rem; margin: 3rem 0 1.5rem; color: #2c3e50;">
            Pour qui ?
          </h2>

          <p style="margin-bottom: 2rem; text-align: center; font-size: 1.1rem;">
            Ce soin d'exception s'adresse à celles qui veulent le meilleur pour leur peau.<br/>
            Celles qui comprennent que l'excellence a une valeur.<br/>
            Celles qui méritent une transformation complète.
          </p>

          <div style="background: linear-gradient(135deg, #d4b5a0 0%, #c9a084 100%); color: white; padding: 3rem; border-radius: 20px; margin: 3rem 0; text-align: center;">
            <h3 style="font-size: 1.8rem; margin-bottom: 1rem;">Hydro'Naissance</h3>
            <p style="margin-bottom: 2rem; font-size: 1.1rem;">
              Notre soin signature d'exception
            </p>
            <div style="margin-bottom: 1rem;">
              <span style="text-decoration: line-through; opacity: 0.7; font-size: 1.5rem;">180€</span>
            </div>
            <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">150€</div>
            <div style="font-size: 1rem; margin-bottom: 2rem;">Prix de lancement</div>
            <div style="background: white; color: #d4b5a0; padding: 1rem; border-radius: 10px;">
              <strong>Forfait Excellence</strong><br/>
              3 séances : 400€ (économisez 140€)
            </div>
          </div>

        </div>
      `,
      category: "Soin Signature",
      author: "LAIA SKIN Institut",
      readTime: "6",
      featured: true,
      published: true,
      mainImage: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1200&q=80",
      gallery: JSON.stringify([]),
      tags: JSON.stringify(["soin signature", "hydro-naissance", "excellence"]),
      metaTitle: "Hydro'Naissance : Notre Soin Signature | LAIA SKIN",
      metaDescription: "L'Hydro'Naissance combine hydratation et régénération. Soin signature d'exception à 150€."
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

  console.log("\n🎨 Articles magnifiques créés avec succès !")
  console.log("- HTML bien formaté avec styles inline")
  console.log("- Design moderne et aéré")
  console.log("- Visuellement attrayant")
  console.log("- Proposition naturelle des soins")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())