import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Zap, ChevronRight, Calendar } from "lucide-react";

export default function LEDTherapie() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            LED Thérapie
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            La luminothérapie haute technologie pour régénérer votre peau en profondeur
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/services/led-therapie.jpg"
              alt="LED Thérapie"
              fill
              className="object-cover object-center scale-[175%]"
              style={{ objectPosition: '90% 40%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">La lumière qui soigne</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                La LED thérapie utilise différentes longueurs d'onde de lumière pour stimuler 
                les processus naturels de régénération cellulaire, sans UV ni chaleur.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#ffaa00]" />
                  <span className="text-sm">30 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#ffaa00]" />
                  <span className="text-sm">Non invasif</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#ffaa00]/20 to-[#ffd700]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs accessibles</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#ffaa00]">45€</span>
                    <span className="text-sm text-[#2c3e50]/60 line-through ml-2">60€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 10 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#ff9500]">400€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-50€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=led"
                className="w-full bg-gradient-to-r from-[#ffaa00] to-[#ffd700] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Réserver maintenant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Les différentes LED */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Chaque couleur, un bienfait
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                color: "Rouge",
                wavelength: "630-700nm",
                benefits: "Anti-âge, stimule le collagène",
                icon: "🔴",
                bgColor: "#ff6b6b"
              },
              {
                color: "Bleu",
                wavelength: "415-445nm",
                benefits: "Anti-acné, purifie la peau",
                icon: "🔵",
                bgColor: "#4dabf7"
              },
              {
                color: "Jaune",
                wavelength: "570-590nm",
                benefits: "Éclat, améliore la circulation",
                icon: "🟡",
                bgColor: "#ffd43b"
              },
              {
                color: "Vert",
                wavelength: "525-550nm",
                benefits: "Apaisant, anti-taches",
                icon: "🟢",
                bgColor: "#51cf66"
              }
            ].map((led, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-24 h-24 mx-auto rounded-full mb-4 flex items-center justify-center text-4xl shadow-lg"
                  style={{ backgroundColor: `${led.bgColor}20` }}
                >
                  {led.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#2c3e50] mb-1">{led.color}</h3>
                <p className="text-sm text-[#2c3e50]/60 mb-2">{led.wavelength}</p>
                <p className="text-[#2c3e50]/70">{led.benefits}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bénéfices */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Les bienfaits de la LED Thérapie
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Régénération cellulaire",
                description: "Stimule la production de collagène et d'élastine",
                icon: "🧬"
              },
              {
                title: "Anti-inflammatoire",
                description: "Apaise les rougeurs et irritations",
                icon: "🌿"
              },
              {
                title: "Cicatrisation",
                description: "Accélère la réparation cutanée",
                icon: "✨"
              },
              {
                title: "Anti-bactérien",
                description: "Élimine les bactéries responsables de l'acné",
                icon: "🦠"
              },
              {
                title: "Circulation",
                description: "Améliore la microcirculation sanguine",
                icon: "💓"
              },
              {
                title: "Détoxification",
                description: "Favorise l'élimination des toxines",
                icon: "💧"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">{benefit.title}</h3>
                <p className="text-[#2c3e50]/70">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocoles personnalisés */}
      <section className="bg-gradient-to-br from-[#ffaa00]/10 to-[#ffd700]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Protocoles personnalisés
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">🌟 Protocole Anti-âge</h3>
              <p className="text-[#2c3e50]/70 mb-2">LED rouge + infrarouge</p>
              <p className="text-sm text-[#2c3e50]/60">Stimule le collagène, réduit les rides, raffermit la peau</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">💙 Protocole Acné</h3>
              <p className="text-[#2c3e50]/70 mb-2">LED bleue + rouge</p>
              <p className="text-sm text-[#2c3e50]/60">Élimine les bactéries, réduit l'inflammation, prévient les cicatrices</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">☀️ Protocole Éclat</h3>
              <p className="text-[#2c3e50]/70 mb-2">LED jaune + vert</p>
              <p className="text-sm text-[#2c3e50]/60">Unifie le teint, atténue les taches, booste la luminosité</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-[#2c3e50] mb-3">🌿 Protocole Apaisant</h3>
              <p className="text-[#2c3e50]/70 mb-2">LED verte + infrarouge</p>
              <p className="text-sm text-[#2c3e50]/60">Calme les peaux sensibles, réduit les rougeurs, répare la barrière cutanée</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            La LED convient à tous !
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-center text-[#2c3e50]/70 mb-6">
              Soin adapté à tous les types de peau et toutes les problématiques :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Rides et ridules",
                "Acné et imperfections",
                "Taches pigmentaires",
                "Rosacée et couperose",
                "Cicatrices d'acné",
                "Perte de fermeté",
                "Teint terne",
                "Peaux sensibles",
                "Après une intervention esthétique",
                "En complément d'autres soins"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-[#2c3e50]/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Résultats prouvés
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Pauline M.",
                text: "Mon acné a disparu après 6 séances. Ma peau est enfin nette !",
                rating: 5,
                protocol: "Protocole Acné"
              },
              {
                name: "Martine B.",
                text: "Mes rides sont atténuées et ma peau est plus ferme. Incroyable !",
                rating: 5,
                protocol: "Protocole Anti-âge"
              },
              {
                name: "Alice T.",
                text: "Ma rosacée est vraiment apaisée. Je n'ai plus de rougeurs.",
                rating: 5,
                protocol: "Protocole Apaisant"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#ffaa00] fill-[#ffaa00]" />
                  ))}
                </div>
                <p className="text-[#2c3e50]/70 italic mb-4">"{testimonial.text}"</p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-[#2c3e50]">{testimonial.name}</p>
                  <span className="text-xs px-2 py-1 bg-[#ffaa00]/10 text-[#ffaa00] rounded-full">
                    {testimonial.protocol}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#ffaa00] to-[#ffd700] rounded-3xl p-12 text-white shadow-2xl">
            <Zap className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-playfair mb-4">
              Illuminez votre peau de l'intérieur
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Découvrez le pouvoir régénérant de la lumière LED
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservation?service=led"
                className="bg-white text-[#2c3e50] px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Réserver une séance
              </Link>
              <Link
                href="/prestations"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[#2c3e50] transition-all duration-300"
              >
                Voir tous les soins
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Questions fréquentes */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "La LED thérapie est-elle dangereuse ?",
                a: "Non, c'est totalement sûr. Les LED n'émettent ni UV ni chaleur excessive."
              },
              {
                q: "Combien de séances sont nécessaires ?",
                a: "En général, 6 à 10 séances pour des résultats optimaux, selon votre problématique."
              },
              {
                q: "Peut-on combiner avec d'autres soins ?",
                a: "Oui ! La LED est excellente en complément de l'Hydro'Naissance ou du BB Glow."
              },
              {
                q: "Y a-t-il des contre-indications ?",
                a: "Très peu : épilepsie photosensible et certains médicaments photosensibilisants."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-[#2c3e50] mb-2">{faq.q}</h3>
                <p className="text-[#2c3e50]/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}