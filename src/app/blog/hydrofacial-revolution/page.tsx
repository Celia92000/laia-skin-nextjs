import Link from "next/link";
import { Calendar, Clock, ArrowLeft, CheckCircle, Info, Star } from "lucide-react";

export default function HydroFacialArticle() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Header */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-[#d4b5a0] hover:gap-3 transition-all mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au blog
          </Link>

          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              Technologies Avancées
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2c3e50] mb-6">
            L'HydroFacial : La Révolution du Nettoyage en Profondeur
          </h1>

          <div className="flex items-center gap-6 text-sm text-[#2c3e50]/60">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              15 janvier 2025
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              5 min de lecture
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            
            {/* Introduction */}
            <div className="prose prose-lg max-w-none text-[#2c3e50]/80">
              <p className="text-xl leading-relaxed mb-8">
                Dans le monde en constante évolution de l'esthétique médicale, l'HydroFacial s'est imposé comme 
                une véritable révolution. Cette technologie, développée aux États-Unis et désormais adoptée dans 
                plus de 80 pays, transforme radicalement notre approche des soins du visage.
              </p>

              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mt-12 mb-6">
                Une Technologie Médicale Brevetée
              </h2>
              
              <p className="mb-6">
                L'HydroFacial n'est pas un simple soin esthétique. C'est une technologie médicale brevetée qui 
                utilise le système Vortex-Fusion® pour créer un vortex qui nettoie en profondeur tout en 
                infusant la peau de sérums nutritifs. Contrairement aux techniques traditionnelles, ce procédé 
                permet une extraction sans douleur et une hydratation simultanée.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[#2c3e50] mb-2">Le saviez-vous ?</h3>
                    <p className="text-[#2c3e50]/70">
                      Un HydroFacial est réalisé toutes les 15 secondes dans le monde. Cette popularité 
                      s'explique par ses résultats immédiats et l'absence totale d'éviction sociale.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mt-12 mb-6">
                Les 3 Étapes Clés du Protocole HydroPeel®
              </h2>

              <div className="space-y-6 my-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2c3e50] mb-2">Nettoyer + Exfolier</h3>
                    <p className="text-[#2c3e50]/70">
                      Une solution à base d'acide lactique et d'extraits d'algues élimine en douceur les 
                      cellules mortes et prépare la peau pour les étapes suivantes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2c3e50] mb-2">Extraire + Hydrater</h3>
                    <p className="text-[#2c3e50]/70">
                      Le système d'aspiration Vortex extrait les impuretés de la zone T (front, nez, menton) 
                      tout en hydratant la peau avec de l'acide hyaluronique.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2c3e50] mb-2">Unifier + Protéger</h3>
                    <p className="text-[#2c3e50]/70">
                      Application de sérums riches en antioxydants et peptides, suivie d'une séance de 
                      LED photothérapie pour maximiser les résultats.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mt-12 mb-6">
                Les Bénéfices Scientifiquement Prouvés
              </h2>

              <p className="mb-6">
                Des études cliniques ont démontré que l'HydroFacial améliore significativement plusieurs 
                paramètres cutanés :
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <Star className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-[#2c3e50] mb-2">Hydratation</h3>
                  <p className="text-[#2c3e50]/70">
                    Augmentation de l'hydratation cutanée de 70% mesurée immédiatement après le traitement.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <Star className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-[#2c3e50] mb-2">Texture</h3>
                  <p className="text-[#2c3e50]/70">
                    Amélioration visible de la texture de peau dans 97% des cas après une seule séance.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <Star className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-[#2c3e50] mb-2">Éclat</h3>
                  <p className="text-[#2c3e50]/70">
                    100% des patients rapportent un teint plus lumineux immédiatement après le soin.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <Star className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold text-[#2c3e50] mb-2">Satisfaction</h3>
                  <p className="text-[#2c3e50]/70">
                    Taux de satisfaction client de 98%, l'un des plus élevés en médecine esthétique.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mt-12 mb-6">
                Mon Expertise chez LAIA SKIN Institut
              </h2>

              <p className="mb-6">
                J'ai adopté l'HydroFacial dès son arrivée en France. Formée aux protocoles les plus 
                avancés, je personnalise chaque traitement selon votre type de peau et vos objectifs 
                spécifiques.
              </p>

              <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-8 my-8">
                <h3 className="font-semibold text-[#2c3e50] mb-4">Mes protocoles exclusifs incluent :</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#d4b5a0] mt-1 flex-shrink-0" />
                    <span className="text-[#2c3e50]/80">
                      <strong>HydroFacial Signature :</strong> Le protocole classique de 45 minutes avec LED thérapie incluse
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#d4b5a0] mt-1 flex-shrink-0" />
                    <span className="text-[#2c3e50]/80">
                      <strong>HydroFacial Deluxe :</strong> Avec booster personnalisé selon vos besoins (anti-âge, éclat, ou purifiant)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#d4b5a0] mt-1 flex-shrink-0" />
                    <span className="text-[#2c3e50]/80">
                      <strong>Cure HydroFacial :</strong> Programme personnalisé pour des résultats durables
                    </span>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mt-12 mb-6">
                Pour Qui et Quand ?
              </h2>

              <p className="mb-6">
                L'un des grands avantages de l'HydroFacial est sa polyvalence. Ce traitement convient à tous 
                les types de peau, même les plus sensibles, et peut être réalisé toute l'année, y compris 
                sur peau bronzée. C'est le soin idéal :
              </p>

              <ul className="space-y-2 mb-8">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#d4b5a0] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-[#2c3e50]/80">Avant un événement important (mariage, soirée, shooting photo)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#d4b5a0] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-[#2c3e50]/80">En entretien mensuel pour maintenir une peau éclatante</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#d4b5a0] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-[#2c3e50]/80">Après l'été pour réparer les dommages du soleil</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#d4b5a0] rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-[#2c3e50]/80">En préparation d'autres traitements esthétiques</span>
                </li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-8">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[#2c3e50] mb-2">Conseil d'experte</h3>
                    <p className="text-[#2c3e50]/70">
                      Pour des résultats optimaux, je recommande une cure initiale de 3 séances 
                      espacées de 2 à 4 semaines, puis un entretien mensuel. Cette approche permet 
                      de transformer durablement la qualité de votre peau.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#2c3e50] mt-12 mb-6">
                Conclusion
              </h2>

              <p className="mb-6">
                L'HydroFacial représente une avancée majeure dans le domaine des soins esthétiques. 
                Sa capacité à combiner nettoyage en profondeur, extraction douce et hydratation intensive 
                en fait un traitement unique, adapté à notre époque où nous recherchons des résultats 
                immédiats sans compromis sur la sécurité.
              </p>

              <p className="text-lg font-medium text-[#2c3e50] mb-8">
                Chez LAIA SKIN Institut, je suis fière de proposer cette technologie de pointe, 
                toujours dans une approche personnalisée et bienveillante. Chaque peau est unique, 
                et mérite un protocole sur-mesure.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl text-center">
              <h3 className="text-2xl font-serif font-bold text-[#2c3e50] mb-4">
                Prête à découvrir l'HydroFacial ?
              </h3>
              <p className="text-[#2c3e50]/70 mb-6">
                Réservez votre première séance et bénéficiez de conseils personnalisés
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/soins/hydrofacial"
                  className="px-8 py-3 bg-white text-blue-500 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  En savoir plus
                </Link>
                <Link 
                  href="/reservation?service=hydrofacial"
                  className="px-8 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Réserver ma séance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}