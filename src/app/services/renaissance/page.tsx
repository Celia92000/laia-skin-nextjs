import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Sparkles, ChevronRight, Calendar } from "lucide-react";

export default function Renaissance() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#fdf7f9] to-[#f9f1f4]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Renaissance
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            Le soin anti-âge complet pour retrouver une peau jeune et éclatante
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/renaissance.jpg"
              alt="Soin Renaissance"
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: '50% 35%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Renaissance cutanée</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                Le soin Renaissance associe techniques avancées et actifs anti-âge pour stimuler le 
                renouvellement cellulaire et révéler une peau visiblement plus jeune et radieuse.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#d896a8]" />
                  <span className="text-sm">120 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#d896a8]" />
                  <span className="text-sm">Effet rajeunissant</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#d896a8]/20 to-[#e4a5b5]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#d896a8]">70€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#c2839b]">260€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=renaissance"
                className="w-full bg-gradient-to-r from-[#d896a8] to-[#e4a5b5] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                title: "Anti-âge",
                description: "Réduction des ridules et signes de l'âge",
                icon: "⏳"
              },
              {
                title: "Fermeté",
                description: "Raffermit et tonifie la peau",
                icon: "💪"
              },
              {
                title: "Éclat",
                description: "Peau plus lumineuse et radieuse",
                icon: "✨"
              },
              {
                title: "Hydratation",
                description: "Hydratation profonde et durable",
                icon: "💧"
              },
              {
                title: "Régénération",
                description: "Stimule le renouvellement cellulaire",
                icon: "🔄"
              },
              {
                title: "Texture",
                description: "Améliore la texture et la douceur",
                icon: "🌸"
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

      {/* Processus */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Déroulement du soin Renaissance
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Diagnostic",
                description: "Analyse personnalisée des besoins de votre peau"
              },
              {
                step: "2",
                title: "Démaquillage",
                description: "Nettoyage en profondeur et préparation"
              },
              {
                step: "3",
                title: "Exfoliation",
                description: "Gommage enzymatique pour éliminer les cellules mortes"
              },
              {
                step: "4",
                title: "Sérum actif",
                description: "Application de sérums anti-âge concentrés"
              },
              {
                step: "5",
                title: "Massage",
                description: "Massage drainant et tonifiant du visage"
              },
              {
                step: "6",
                title: "Masque",
                description: "Masque régénérant adapté à votre peau"
              },
              {
                step: "7",
                title: "Protection",
                description: "Hydratation et protection solaire"
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#d896a8] to-[#e4a5b5] rounded-full flex items-center justify-center text-white font-bold">
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
      <section className="bg-gradient-to-r from-[#d896a8]/10 to-[#e4a5b5]/10 py-16">
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
                <li>• Éviter l'exposition au soleil après</li>
                <li>• Prévoir 4-6 séances pour un résultat optimal</li>
                <li>• Espacer les séances de 3 semaines</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4">Contre-indications</h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>• Grossesse et allaitement</li>
                <li>• Lésions cutanées récentes</li>
                <li>• Allergies aux actifs cosmétiques</li>
                <li>• Infections en cours</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-6">
            Prête pour votre renaissance ?
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            Découvrez le soin Renaissance et retrouvez une peau jeune et éclatante
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation?service=renaissance"
              className="bg-gradient-to-r from-[#d896a8] to-[#e4a5b5] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Réserver Renaissance
            </Link>
            <Link
              href="/prestations"
              className="border-2 border-[#d896a8] text-[#d896a8] px-8 py-3 rounded-full font-semibold hover:bg-[#d896a8] hover:text-white transition-all duration-300"
            >
              Voir tous nos soins
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}