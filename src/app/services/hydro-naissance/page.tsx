import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Check, Droplets, ChevronRight, Calendar } from "lucide-react";

export default function HydroNaissance() {
  return (
    <main className="pt-36 pb-20 min-h-screen bg-gradient-to-br from-[#f0fcff] to-[#e0f8ff]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 mb-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal text-[#2c3e50] mb-6">
            Hydro'Naissance
          </h1>
          <p className="font-inter text-lg md:text-xl text-[#2c3e50]/70 max-w-3xl mx-auto">
            L'hydratation ultime pour une peau repulpée et éclatante de jeunesse
          </p>
        </div>

        {/* Image et Description */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/hydro-naissance.jpg"
              alt="Soin Hydro'Naissance"
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: '50% 35%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/60 via-transparent to-transparent"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-playfair text-[#2c3e50] mb-4">Hydratation intensive</h2>
              <p className="text-[#2c3e50]/70 mb-4">
                L'Hydro'Naissance combine les bienfaits de l'hydrothérapie avec des actifs hydratants 
                pour offrir à votre peau une cure de jouvence exceptionnelle.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#20b2aa]" />
                  <span className="text-sm">90 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#20b2aa]" />
                  <span className="text-sm">Hydratation profonde</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#20b2aa]/20 to-[#48cae4]/20 rounded-xl p-6">
              <h3 className="font-semibold text-[#2c3e50] mb-3">Tarifs</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#2c3e50]/70">Séance unique</span>
                  <div>
                    <span className="text-xl font-bold text-[#20b2aa]">90€</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                  <span className="text-[#2c3e50]/70">Forfait 4 séances</span>
                  <div>
                    <span className="text-xl font-bold text-[#1a9a94]">340€</span>
                    <span className="text-sm text-[#2c3e50]/60 ml-2">(-20€)</span>
                  </div>
                </div>
              </div>
              <Link
                href="/reservation?service=hydro-naissance"
                className="w-full bg-gradient-to-r from-[#20b2aa] to-[#48cae4] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
            Les bienfaits d'Hydro'Naissance
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Hydratation",
                description: "Hydratation intense et durable",
                icon: "💧"
              },
              {
                title: "Repulpage",
                description: "Peau repulpée et rebondie",
                icon: "🌊"
              },
              {
                title: "Éclat",
                description: "Teint lumineux et éclatant",
                icon: "✨"
              },
              {
                title: "Douceur",
                description: "Peau douce et soyeuse",
                icon: "🌸"
              },
              {
                title: "Apaisement",
                description: "Sensation de fraîcheur et confort",
                icon: "🧊"
              },
              {
                title: "Anti-âge",
                description: "Prévention du vieillissement cutané",
                icon: "⏳"
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
            Déroulement du soin Hydro'Naissance
          </h2>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Accueil",
                description: "Diagnostic personnalisé de votre type de peau"
              },
              {
                step: "2",
                title: "Démaquillage",
                description: "Nettoyage doux avec des eaux micellaires"
              },
              {
                step: "3",
                title: "Vaporisation",
                description: "Ouverture des pores avec vapeur d'eau thermale"
              },
              {
                step: "4",
                title: "Exfoliation",
                description: "Gommage aquatique pour éliminer les impuretés"
              },
              {
                step: "5",
                title: "Hydro-infusion",
                description: "Perfusion d'actifs hydratants en profondeur"
              },
              {
                step: "6",
                title: "Massage",
                description: "Massage hydratant avec sérums concentrés"
              },
              {
                step: "7",
                title: "Masque",
                description: "Masque hydrogel ultra-hydratant"
              },
              {
                step: "8",
                title: "Protection",
                description: "Crème hydratante et protection solaire"
              }
            ].map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#20b2aa] to-[#48cae4] rounded-full flex items-center justify-center text-white font-bold">
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

      {/* Actifs utilisés */}
      <section className="bg-gradient-to-r from-[#20b2aa]/10 to-[#48cae4]/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-playfair text-center text-[#2c3e50] mb-12">
            Actifs hydratants de pointe
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Acide Hyaluronique",
                description: "Retient jusqu'à 1000 fois son poids en eau",
                benefits: ["Hydratation", "Repulpage", "Anti-âge"]
              },
              {
                name: "Eau Thermale",
                description: "Propriétés apaisantes et reminéralisantes",
                benefits: ["Apaisement", "Minéraux", "Pureté"]
              },
              {
                name: "Collagène Marin",
                description: "Raffermit et restructure la peau",
                benefits: ["Fermeté", "Élasticité", "Régénération"]
              }
            ].map((actif, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="font-semibold text-[#2c3e50] mb-2">{actif.name}</h3>
                <p className="text-[#2c3e50]/70 text-sm mb-4">{actif.description}</p>
                <div className="space-y-1">
                  {actif.benefits.map((benefit, idx) => (
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
                <li>• Boire beaucoup d'eau après</li>
                <li>• Prévoir 3-4 séances pour un résultat optimal</li>
                <li>• Espacer les séances de 2-3 semaines</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#2c3e50] mb-4">Contre-indications</h3>
              <ul className="space-y-2 text-[#2c3e50]/70">
                <li>• Grossesse et allaitement</li>
                <li>• Allergies aux actifs marins</li>
                <li>• Lésions cutanées ouvertes</li>
                <li>• Infection en cours</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-playfair text-[#2c3e50] mb-6">
            Offrez-vous une renaissance hydratante
          </h2>
          <p className="text-lg text-[#2c3e50]/70 mb-8">
            Découvrez Hydro'Naissance et révélez l'éclat naturel de votre peau
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation?service=hydro-naissance"
              className="bg-gradient-to-r from-[#20b2aa] to-[#48cae4] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300"
            >
              Réserver Hydro'Naissance
            </Link>
            <Link
              href="/prestations"
              className="border-2 border-[#20b2aa] text-[#20b2aa] px-8 py-3 rounded-full font-semibold hover:bg-[#20b2aa] hover:text-white transition-all duration-300"
            >
              Voir tous nos soins
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}