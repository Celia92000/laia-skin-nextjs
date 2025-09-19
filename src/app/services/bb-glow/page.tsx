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
            <img
              src="/images/bb-glow.jpg"
              alt="Soin BB Glow"
              className="w-full h-full object-cover object-center"
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
                  <span className="text-sm">90 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#e8c4a8]" />
                  <span className="text-sm">Effet 4-6 semaines</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#e8c4a8]/20 to-[#f4d0b5]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#e8c4a8]">60€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#d6b296]">220€</span>
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
                icon: "⏰"
              },
              {
                title: "Hydratation",
                description: "Peau nourrie et repulpée",
                icon: "💧"
              },
              {
                title: "Sans douleur",
                description: "Technique douce et confortable",
                icon: "🌸"
              },
              {
                title: "Résultats immédiats",
                description: "Effet visible dès la première séance",
                icon: "✨"
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
            Déroulement du soin
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Consultation",
                description: "Analyse de votre peau et choix de la teinte adaptée"
              },
              {
                step: "2",
                title: "Préparation",
                description: "Nettoyage et préparation de la peau"
              },
              {
                step: "3",
                title: "Application",
                description: "Micro-needling avec le sérum BB Glow"
              },
              {
                step: "4",
                title: "Massage",
                description: "Massage pour favoriser la pénétration"
              },
              {
                step: "5",
                title: "LED Thérapie",
                description: "Séance de LED pour optimiser les résultats"
              },
              {
                step: "6",
                title: "Protection",
                description: "Application d'une crème apaisante et SPF"
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#e8c4a8] to-[#f4d0b5] rounded-full flex items-center justify-center text-white font-bold">
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

      {/* Contre-indications */}
      <section className="bg-gradient-to-r from-[#e8c4a8]/10 to-[#f4d0b5]/10 py-16">
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
                <li>• Éviter le soleil 48h avant</li>
                <li>• Venir démaquillée</li>
                <li>• Prévoir 3-4 séances pour un résultat optimal</li>
                <li>• Espacer les séances de 2 semaines</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4">Contre-indications</h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>• Grossesse et allaitement</li>
                <li>• Acné active</li>
                <li>• Infections cutanées</li>
                <li>• Diabète non contrôlé</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-6">
            Prête pour un teint parfait ?
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            Découvrez le BB Glow et révélez votre beauté naturelle
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation?service=bbglow"
              className="bg-gradient-to-r from-[#e8c4a8] to-[#f4d0b5] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Réserver mon BB Glow
            </Link>
            <Link
              href="/prestations"
              className="border-2 border-[#e8c4a8] text-[#e8c4a8] px-8 py-3 rounded-full font-semibold hover:bg-[#e8c4a8] hover:text-white transition-all duration-300"
            >
              Voir tous nos soins
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}