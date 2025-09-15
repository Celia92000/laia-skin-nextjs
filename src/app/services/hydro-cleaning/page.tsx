import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Droplets, ChevronRight, Calendar } from "lucide-react";

export default function HydroCleaning() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Hydro'Cleaning
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Le nettoyage profond qui purifie et révèle l'éclat naturel de votre peau
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/services/hydro-cleaning.jpg"
              alt="Soin Hydro'Cleaning"
              fill
              className="object-cover object-center"
              style={{ objectPosition: '85% 40%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Un nettoyage en profondeur</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                L'Hydro'Cleaning est le soin idéal pour purifier votre peau en profondeur. 
                Il combine extraction douce et hydratation pour un teint net et lumineux.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#7fb3c8]" />
                  <span className="text-sm">60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#7fb3c8]" />
                  <span className="text-sm">Soin détox</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#7fb3c8]/20 to-[#a8d5e2]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#7fb3c8]">70€</span>
                    <span className="text-sm text-[#2c3e50]/60 line-through ml-2">85€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#6ba0b5]">260€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=hydro"
                className="w-full bg-gradient-to-r from-[#7fb3c8] to-[#a8d5e2] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
            Les bienfaits de l'Hydro'Cleaning
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Pores purifiés",
                description: "Extraction en douceur des impuretés et comédons",
                icon: "🔬"
              },
              {
                title: "Peau détoxifiée",
                description: "Élimination des toxines et polluants",
                icon: "🌿"
              },
              {
                title: "Teint unifié",
                description: "Atténuation des taches et irrégularités",
                icon: "✨"
              },
              {
                title: "Hydratation profonde",
                description: "Peau repulpée et nourrie en profondeur",
                icon: "💧"
              },
              {
                title: "Grain affiné",
                description: "Texture lisse et douce au toucher",
                icon: "🌸"
              },
              {
                title: "Éclat retrouvé",
                description: "Teint frais et lumineux immédiatement",
                icon: "🌟"
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
            Le protocole en 5 étapes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Analyse de votre type de peau",
              "Nettoyage et préparation",
              "Extraction douce par aspiration",
              "Application de sérums purifiants",
              "Masque hydratant et protection"
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md">
                <div className="w-8 h-8 bg-gradient-to-br from-[#7fb3c8] to-[#a8d5e2] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-[#2c3e50]/80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="bg-gradient-to-br from-[#7fb3c8]/10 to-[#a8d5e2]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Ce soin est fait pour vous si...
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Peau mixte à grasse",
                "Pores dilatés visibles",
                "Points noirs récurrents",
                "Teint terne et fatigué",
                "Imperfections fréquentes",
                "Peau congestionnée",
                "Besoin de détox cutanée",
                "Envie d'un nettoyage profond"
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
            Ce qu'en pensent mes clientes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Amina K.",
                text: "Mes pores sont vraiment moins visibles et ma peau respire enfin !",
                rating: 5
              },
              {
                name: "Clara D.",
                text: "Un nettoyage efficace sans agresser la peau. Parfait !",
                rating: 5
              },
              {
                name: "Léa P.",
                text: "Mon teint est plus net et lumineux. Je recommande vivement.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#7fb3c8] fill-[#7fb3c8]" />
                  ))}
                </div>
                <p className="text-[#2c3e50]/70 italic mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-[#2c3e50]">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#7fb3c8] to-[#a8d5e2] rounded-3xl p-12 text-white shadow-2xl">
            <Droplets className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-playfair mb-4">
              Offrez à votre peau une détox profonde
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Retrouvez une peau nette et purifiée avec l'Hydro'Cleaning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservation?service=hydro"
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
                q: "À quelle fréquence faire ce soin ?",
                a: "Je recommande une séance toutes les 3-4 semaines pour maintenir une peau nette."
              },
              {
                q: "Est-ce douloureux ?",
                a: "Non, l'extraction par aspiration douce est totalement indolore."
              },
              {
                q: "Convient-il aux peaux sensibles ?",
                a: "Oui, le protocole est adapté selon votre type de peau et sa sensibilité."
              },
              {
                q: "Puis-je me maquiller après ?",
                a: "Il est préférable de laisser la peau respirer 24h, mais un maquillage léger est possible."
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