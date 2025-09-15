import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Sparkles, ChevronRight, Calendar } from "lucide-react";

export default function HydroNaissance() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Hydro'Naissance
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Le soin signature qui redonne vie à votre peau grâce à la technologie HydraFacial
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/services/hydro-naissance.jpg"
              alt="Soin Hydro'Naissance"
              fill
              className="object-cover object-center"
              style={{ objectPosition: '50% 65%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Un soin révolutionnaire</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                L'Hydro'Naissance est bien plus qu'un simple soin du visage. C'est une véritable renaissance 
                cutanée qui combine nettoyage en profondeur, exfoliation douce et hydratation intense.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#d4b5a0]" />
                  <span className="text-sm">75 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#d4b5a0] fill-[#d4b5a0]" />
                  <span className="text-sm">Soin signature</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs exclusifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <span className="text-xl font-bold text-[#d4b5a0]">90€</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#c9a084]">340€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=hydro-naissance"
                className="w-full bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
            Les bienfaits de l'Hydro'Naissance
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Nettoyage profond",
                description: "Extraction des impuretés et points noirs en douceur",
                icon: "💧"
              },
              {
                title: "Hydratation intense",
                description: "Infusion de sérums nutritifs adaptés à votre peau",
                icon: "✨"
              },
              {
                title: "Éclat immédiat",
                description: "Teint lumineux et peau repulpée dès la première séance",
                icon: "🌟"
              },
              {
                title: "Anti-âge",
                description: "Stimulation du collagène et réduction des ridules",
                icon: "⏰"
              },
              {
                title: "Pores resserrés",
                description: "Affinement du grain de peau visible",
                icon: "🔍"
              },
              {
                title: "Confort absolu",
                description: "Soin non invasif et totalement indolore",
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
            Le protocole en 6 étapes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Diagnostic personnalisé de votre peau",
              "Nettoyage et démaquillage en profondeur",
              "Exfoliation douce par vortex",
              "Extraction des impuretés sans douleur",
              "Infusion de sérums sur-mesure",
              "Protection et hydratation finale"
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md">
                <div className="w-8 h-8 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-[#2c3e50]/80">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Pour qui est fait ce soin ?
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <p className="text-center text-[#2c3e50]/70 mb-6">
              L'Hydro'Naissance convient à tous les types de peau et répond à de nombreuses problématiques :
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Peau déshydratée ou sèche",
                "Teint terne et fatigué",
                "Pores dilatés et points noirs",
                "Premières rides et ridules",
                "Taches pigmentaires",
                "Peau sensible ou réactive",
                "Excès de sébum",
                "Perte d'élasticité"
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
            L'expérience de mes clientes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sophie M.",
                text: "Ma peau n'a jamais été aussi douce et lumineuse ! Un vrai coup d'éclat.",
                rating: 5
              },
              {
                name: "Marie L.",
                text: "Les résultats sont visibles immédiatement. Je suis bluffée !",
                rating: 5
              },
              {
                name: "Julie B.",
                text: "Un moment de détente absolue avec des résultats spectaculaires.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#d4b5a0] fill-[#d4b5a0]" />
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
          <div className="bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-3xl p-12 text-white shadow-2xl">
            <Sparkles className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-playfair mb-4">
              Prête pour votre renaissance cutanée ?
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Offrez-vous l'expérience Hydro'Naissance et révélez l'éclat naturel de votre peau
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reservation?service=hydro-naissance"
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
                q: "Combien de séances sont recommandées ?",
                a: "Pour des résultats optimaux, je recommande une cure de 4 séances espacées de 2 à 3 semaines."
              },
              {
                q: "Y a-t-il des contre-indications ?",
                a: "Ce soin convient à tous les types de peau. Je réalise toujours un diagnostic préalable pour adapter le protocole."
              },
              {
                q: "Peut-on se maquiller après le soin ?",
                a: "Il est préférable de laisser respirer la peau pendant 24h, mais un maquillage léger est possible si nécessaire."
              },
              {
                q: "Les résultats sont-ils immédiats ?",
                a: "Oui ! Vous verrez une amélioration immédiate de l'éclat et de la texture de votre peau."
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