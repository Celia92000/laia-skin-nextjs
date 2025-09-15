import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Sparkles, ChevronRight, Calendar } from "lucide-react";

export default function Renaissance() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Renaissance
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Le soin anti-âge global qui réveille la jeunesse de votre peau
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/services/renaissance.jpg"
              alt="Soin Renaissance"
              fill
              className="object-cover object-center"
              style={{ objectPosition: '50% 40%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Un soin régénérant complet</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                Renaissance est notre soin anti-âge d'exception qui combine plusieurs technologies 
                pour stimuler le renouvellement cellulaire et restaurer l'éclat de jeunesse.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#d99ec4]" />
                  <span className="text-sm">60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#d99ec4] fill-[#d99ec4]" />
                  <span className="text-sm">Soin premium</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#d99ec4]/20 to-[#e6b3cc]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs exclusifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#d99ec4]">70€</span>
                    <span className="text-sm text-[#2c3e50]/60 line-through ml-2">90€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#c788b8]">260€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=renaissance"
                className="w-full bg-gradient-to-r from-[#d99ec4] to-[#e6b3cc] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
            Les bienfaits de Renaissance
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Rides atténuées",
                description: "Réduction visible des rides et ridules",
                icon: "⏰"
              },
              {
                title: "Fermeté retrouvée",
                description: "Peau plus tonique et élastique",
                icon: "💪"
              },
              {
                title: "Ovale redessiné",
                description: "Contours du visage raffermis",
                icon: "✨"
              },
              {
                title: "Taches estompées",
                description: "Uniformisation du teint",
                icon: "🌟"
              },
              {
                title: "Collagène stimulé",
                description: "Production naturelle relancée",
                icon: "🧬"
              },
              {
                title: "Éclat de jeunesse",
                description: "Peau visiblement rajeunie",
                icon: "🌸"
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

      {/* Protocole */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Un protocole en 7 étapes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Diagnostic anti-âge personnalisé",
              "Double nettoyage et exfoliation",
              "Peeling doux régénérant",
              "Massage lifting et drainage",
              "Application de sérums haute performance",
              "Masque tenseur au collagène",
              "Protection anti-âge complète"
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md">
                <div className="w-8 h-8 bg-gradient-to-br from-[#d99ec4] to-[#e6b3cc] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-[#2c3e50]/80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies utilisées */}
      <section className="bg-gradient-to-br from-[#d99ec4]/10 to-[#e6b3cc]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Technologies avancées
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[#2c3e50] mb-2">🔬 Microneedling</h3>
                <p className="text-[#2c3e50]/70">Stimulation du collagène par micro-perforations contrôlées</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2c3e50] mb-2">💎 Radiofréquence</h3>
                <p className="text-[#2c3e50]/70">Raffermissement profond des tissus</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2c3e50] mb-2">✨ LED anti-âge</h3>
                <p className="text-[#2c3e50]/70">Lumière rouge pour la régénération cellulaire</p>
              </div>
              <div>
                <h3 className="font-semibold text-[#2c3e50] mb-2">🧪 Peptides bioactifs</h3>
                <p className="text-[#2c3e50]/70">Actifs haute performance pour une action ciblée</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Idéal à partir de 35 ans
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-center text-[#2c3e50]/70 mb-6">
              Renaissance est particulièrement recommandé si vous observez :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Premières rides installées",
                "Perte de fermeté",
                "Relâchement cutané",
                "Taches pigmentaires",
                "Teint irrégulier",
                "Perte d'éclat",
                "Ovale du visage moins défini",
                "Besoin d'un coup d'éclat intense"
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
                name: "Catherine M.",
                text: "Ma peau est transformée ! Les rides sont moins marquées et j'ai retrouvé de la fermeté.",
                rating: 5,
                age: "52 ans"
              },
              {
                name: "Isabelle T.",
                text: "Un vrai coup de jeune ! Mon teint est plus lumineux et uniforme.",
                rating: 5,
                age: "45 ans"
              },
              {
                name: "Nathalie R.",
                text: "Les résultats sont spectaculaires. Ma peau paraît 10 ans plus jeune !",
                rating: 5,
                age: "48 ans"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#d99ec4] fill-[#d99ec4]" />
                  ))}
                </div>
                <p className="text-[#2c3e50]/70 italic mb-4">"{testimonial.text}"</p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-[#2c3e50]">{testimonial.name}</p>
                  <span className="text-sm text-[#2c3e50]/60">{testimonial.age}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#d99ec4] to-[#e6b3cc] rounded-3xl p-12 text-white shadow-2xl">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-playfair mb-4">
              Révélez votre beauté intemporelle
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Offrez-vous le soin Renaissance et retrouvez une peau visiblement plus jeune
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservation?service=renaissance"
                className="bg-white text-[#2c3e50] px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Réserver ce soin
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
                q: "À partir de quel âge recommandez-vous ce soin ?",
                a: "Renaissance est idéal à partir de 35 ans, quand les premiers signes de l'âge apparaissent."
              },
              {
                q: "Combien de séances pour des résultats durables ?",
                a: "Une cure de 4 séances espacées de 3 semaines, puis un entretien tous les 2 mois."
              },
              {
                q: "Y a-t-il des effets secondaires ?",
                a: "Aucun effet secondaire. Juste une légère rougeur qui disparaît en quelques heures."
              },
              {
                q: "Les résultats sont-ils immédiats ?",
                a: "Oui, la peau est immédiatement plus lumineuse. Les effets anti-âge se renforcent avec le temps."
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