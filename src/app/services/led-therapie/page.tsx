import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Zap, ChevronRight, Calendar } from "lucide-react";

export default function LEDTherapie() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#f0f8ff] to-[#e6f3ff]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            LED Thérapie
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            La photomodulation LED pour une peau éclatante et régénérée
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/led-therapie.jpg"
              alt="Soin LED Thérapie"
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: '50% 35%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Technologie de pointe</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                La LED thérapie utilise des longueurs d'onde spécifiques pour stimuler les cellules 
                cutanées et favoriser la régénération naturelle de votre peau.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4a90e2]" />
                  <span className="text-sm">45 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#4a90e2]" />
                  <span className="text-sm">Sans douleur</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#4a90e2]/20 to-[#6ba3f5]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#4a90e2]">50€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#3d7bc7]">180€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=led-therapie"
                className="w-full bg-gradient-to-r from-[#4a90e2] to-[#6ba3f5] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Réserver maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Les bienfaits de la LED thérapie
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Anti-âge",
                description: "Stimule la production de collagène",
                icon: "⭐"
              },
              {
                title: "Cicatrisation",
                description: "Accélère la réparation cellulaire",
                icon: "🔄"
              },
              {
                title: "Anti-acné",
                description: "Réduit l'inflammation et les imperfections",
                icon: "🌟"
              },
              {
                title: "Hydratation",
                description: "Améliore la rétention d'eau",
                icon: "💧"
              },
              {
                title: "Éclat",
                description: "Teint plus lumineux et uniforme",
                icon: "✨"
              },
              {
                title: "Relaxation",
                description: "Moment de détente et bien-être",
                icon: "🧘"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-[#2c3e50] mb-2">{benefit.title}</h3>
                <p className="text-[#2c3e50]/60 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types de LED */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Les différentes couleurs de LED
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                color: "Rouge",
                description: "Anti-âge et stimulation du collagène",
                benefits: ["Ridules", "Fermeté", "Circulation"],
                colorClass: "from-red-400 to-red-600"
              },
              {
                color: "Bleu",
                description: "Anti-bactérien et anti-acné",
                benefits: ["Acné", "Pores", "Inflammation"],
                colorClass: "from-blue-400 to-blue-600"
              },
              {
                color: "Infrarouge",
                description: "Régénération et cicatrisation",
                benefits: ["Réparation", "Apaisement", "Hydratation"],
                colorClass: "from-purple-400 to-purple-600"
              }
            ].map((led, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${led.colorClass} mb-4`}></div>
                <h3 className="font-semibold text-[#2c3e50] mb-2">LED {led.color}</h3>
                <p className="text-[#2c3e50]/70 text-sm mb-4">{led.description}</p>
                <div className="space-y-1">
                  {led.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-[#2c3e50]/70">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="bg-gradient-to-r from-[#4a90e2]/10 to-[#6ba3f5]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Déroulement de la séance
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Accueil",
                description: "Discussion sur vos besoins et objectifs"
              },
              {
                step: "2",
                title: "Préparation",
                description: "Nettoyage et démaquillage de la peau"
              },
              {
                step: "3",
                title: "Protection",
                description: "Mise en place des lunettes de protection"
              },
              {
                step: "4",
                title: "Séance LED",
                description: "Exposition aux LED pendant 20-30 minutes"
              },
              {
                step: "5",
                title: "Hydratation",
                description: "Application d'un sérum hydratant"
              },
              {
                step: "6",
                title: "Conseils",
                description: "Recommandations post-séance"
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#4a90e2] to-[#6ba3f5] rounded-full flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c3e50] mb-1">{step.title}</h3>
                  <p className="text-[#2c3e50]/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Informations importantes */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Informations importantes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Recommandations
              </h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>• Venir démaquillée</li>
                <li>• Éviter les produits photosensibilisants</li>
                <li>• Prévoir 6-8 séances pour un résultat optimal</li>
                <li>• Séances 2 fois par semaine</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4">Contre-indications</h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>• Grossesse</li>
                <li>• Épilepsie photosensible</li>
                <li>• Cancer de la peau</li>
                <li>• Prise de médicaments photosensibilisants</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-6">
            Découvrez la puissance de la lumière
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            Laissez la LED thérapie révéler l'éclat naturel de votre peau
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation?service=led-therapie"
              className="bg-gradient-to-r from-[#4a90e2] to-[#6ba3f5] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Réserver LED Thérapie
            </Link>
            <Link
              href="/prestations"
              className="border-2 border-[#4a90e2] text-[#4a90e2] px-8 py-3 rounded-full font-semibold hover:bg-[#4a90e2] hover:text-white transition-all duration-300"
            >
              Voir tous nos soins
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}