import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Palette, ChevronRight, Calendar } from "lucide-react";

export default function BBGlow() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            BB Glow
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Le maquillage semi-permanent qui sublime votre teint naturellement
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/services/bb-glow.jpg"
              alt="Soin BB Glow"
              fill
              className="object-cover object-center"
              style={{ objectPosition: '50% 35%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">L'effet bonne mine permanent</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                Le BB Glow est un soin révolutionnaire qui dépose des pigments dans les couches 
                superficielles de la peau pour un teint parfait et lumineux pendant plusieurs semaines.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#e8c4a8]" />
                  <span className="text-sm">60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#e8c4a8]" />
                  <span className="text-sm">Effet 4-6 semaines</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#e8c4a8]/20 to-[#f4d0b5]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs spéciaux</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#e8c4a8]">80€</span>
                    <span className="text-sm text-[#2c3e50]/60 line-through ml-2">95€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#d6b296]">300€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=bbglow"
                className="w-full bg-gradient-to-r from-[#e8c4a8] to-[#f4d0b5] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
            Les avantages du BB Glow
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Teint unifié",
                description: "Correction des imperfections et taches",
                icon: "🎨"
              },
              {
                title: "Effet bonne mine",
                description: "Teint frais et lumineux au réveil",
                icon: "☀️"
              },
              {
                title: "Gain de temps",
                description: "Plus besoin de fond de teint quotidien",
                icon: "⏱️"
              },
              {
                title: "Hydratation",
                description: "Peau nourrie et repulpée",
                icon: "💧"
              },
              {
                title: "Anti-âge",
                description: "Atténuation des ridules",
                icon: "✨"
              },
              {
                title: "Naturel",
                description: "Résultat subtil et personnalisé",
                icon: "🌿"
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
            Déroulement de la séance
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Consultation et choix de la teinte",
              "Nettoyage et préparation de la peau",
              "Application d'un sérum anesthésiant",
              "Microneedling avec sérum BB",
              "Massage pour répartir les pigments",
              "Application du masque apaisant"
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md">
                <div className="w-8 h-8 bg-gradient-to-br from-[#e8c4a8] to-[#f4d0b5] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-[#2c3e50]/80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teintes disponibles */}
      <section className="bg-gradient-to-br from-[#e8c4a8]/10 to-[#f4d0b5]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Teintes sur-mesure
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-center text-[#2c3e50]/70 mb-8">
              Nous adaptons la teinte à votre carnation naturelle pour un résultat parfaitement harmonieux
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Light", color: "#fde7d3" },
                { name: "Natural", color: "#f5d5b8" },
                { name: "Medium", color: "#e8c4a8" },
                { name: "Golden", color: "#d6b296" }
              ].map((shade, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-20 h-20 mx-auto rounded-full shadow-md mb-2" 
                    style={{ backgroundColor: shade.color }}
                  ></div>
                  <p className="text-sm font-medium text-[#2c3e50]">{shade.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Le BB Glow est fait pour vous si...
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Vous voulez un teint parfait au réveil",
                "Vous avez des taches pigmentaires",
                "Votre teint est terne ou irrégulier",
                "Vous voulez gagner du temps le matin",
                "Vous cherchez un effet naturel",
                "Vous avez la peau sensible au maquillage",
                "Vous voulez camoufler des rougeurs",
                "Vous aimez l'effet bonne mine permanent"
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
            Elles ont adopté le BB Glow
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah L.",
                text: "Plus besoin de fond de teint ! Mon teint est parfait même sans maquillage.",
                rating: 5
              },
              {
                name: "Emma D.",
                text: "Un gain de temps incroyable le matin. Je me réveille avec bonne mine !",
                rating: 5
              },
              {
                name: "Camille R.",
                text: "Mes taches sont camouflées naturellement. Le résultat est bluffant !",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#e8c4a8] fill-[#e8c4a8]" />
                  ))}
                </div>
                <p className="text-[#2c3e50]/70 italic mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-[#2c3e50]">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avant/Après */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Résultats visibles
          </h2>
          <div className="bg-gradient-to-r from-[#e8c4a8]/10 to-[#f4d0b5]/10 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-[#2c3e50] mb-4">Avant le BB Glow</h3>
                <ul className="space-y-2 text-[#2c3e50]/70">
                  <li>• Teint irrégulier</li>
                  <li>• Taches visibles</li>
                  <li>• Rougeurs apparentes</li>
                  <li>• Besoin de maquillage quotidien</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#2c3e50] mb-4">Après le BB Glow</h3>
                <ul className="space-y-2 text-[#2c3e50]/70">
                  <li>• Teint unifié et lumineux</li>
                  <li>• Imperfections camouflées</li>
                  <li>• Peau éclatante naturellement</li>
                  <li>• Effet bonne mine permanent</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-[#e8c4a8] to-[#f4d0b5] rounded-3xl p-12 text-white shadow-2xl">
            <Palette className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-playfair mb-4">
              Réveillez-vous avec un teint parfait
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Découvrez le BB Glow et oubliez le fond de teint !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservation?service=bbglow"
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
                q: "Combien de temps dure l'effet BB Glow ?",
                a: "L'effet dure entre 4 et 6 semaines selon votre type de peau et votre routine de soins."
              },
              {
                q: "Est-ce douloureux ?",
                a: "Non, grâce au sérum anesthésiant, vous ne ressentez qu'un léger picotement."
              },
              {
                q: "Puis-je me maquiller après ?",
                a: "Oui, mais ce n'est plus nécessaire ! Attendez 24h avant d'appliquer du maquillage si souhaité."
              },
              {
                q: "Combien de séances sont nécessaires ?",
                a: "3 à 4 séances espacées de 2 semaines pour un résultat optimal et durable."
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