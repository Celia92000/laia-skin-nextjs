'use client';

import Link from 'next/link';
import { BaseTemplateContent } from '@/types/template-content';
import { Clock, Sparkles, Zap, Smile } from 'lucide-react';

interface TemplateProps {
  organization: {
    name: string;
    description?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }>;
  team?: Array<{
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
  }>;
  content?: BaseTemplateContent;
}

export default function TemplateFresh({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Fraîcheur & Dynamisme',
      description: organization.description || 'Une beauté éclatante et moderne',
      ctaPrimary: 'C\'est parti !',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Soins Énergisants',
      description: 'Des soins qui vous redonnent de l\'éclat'
    },
    cta: {
      title: 'On Se Lance ?',
      description: 'Prenez votre rendez-vous maintenant',
      button: 'Réserver Mon Soin'
    },
    footer: {}
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Header dynamique */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
              }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: organization.secondaryColor }}>
                  {organization.name}
                </h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm font-medium text-gray-700 hover:text-gray-900">Services</a>
              <a href="#equipe" className="text-sm font-medium text-gray-700 hover:text-gray-900">Équipe</a>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
              >
                Réserver
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Fresh et dynamique */}
      <section className="pt-16 pb-20 px-6 relative overflow-hidden">
        {/* Formes colorées en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-30 blur-3xl" style={{
            background: `radial-gradient(circle, ${organization.primaryColor}, transparent)`
          }} />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{
            background: `radial-gradient(circle, ${organization.secondaryColor}, transparent)`
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg mb-8">
              <Smile className="w-5 h-5" style={{ color: organization.primaryColor }} />
              <span className="text-sm font-semibold text-gray-700">Beauté & Fraîcheur</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight">
              <span className="block text-gray-900">Révélez votre</span>
              <span className="block bg-gradient-to-r bg-clip-text text-transparent" style={{
                backgroundImage: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
              }}>
                Éclat Naturel
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              {organization.description || "Un institut moderne et dynamique où beauté rime avec bonne humeur"}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="px-10 py-4 rounded-xl font-bold text-lg text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
              >
                Je réserve ! ✨
              </Link>
              <Link
                href="#services"
                className="px-10 py-4 rounded-xl font-bold text-lg bg-white text-gray-700 hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
              >
                Découvrir
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services en grid colorée */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-white rounded-full shadow-md mb-6">
              <span className="text-sm font-bold text-gray-700">Nos Prestations</span>
            </div>
            <h2 className="text-5xl font-black mb-4 text-gray-900">
              Des Soins qui Font du Bien
            </h2>
            <p className="text-gray-600 text-lg">Choisissez votre moment de bonheur</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, idx) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                {/* Badge coloré */}
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg" style={{
                  background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                }}>
                  {idx + 1}
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {service.description || "Un soin parfait pour vous faire du bien"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t-2" style={{ borderColor: `${organization.primaryColor}20` }}>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </div>
                  <div className="text-4xl font-black" style={{ color: organization.primaryColor }}>
                    {service.price}€
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section Fresh */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full shadow-md mb-6">
                <span className="text-sm font-bold" style={{ color: organization.primaryColor }}>Notre Team</span>
              </div>
              <h2 className="text-5xl font-black mb-4 text-gray-900">
                L'Équipe au Top !
              </h2>
              <p className="text-gray-600 text-lg">Des pros sympas et à l'écoute</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {team.slice(0, 3).map((member, idx) => (
                <div key={member.id} className="group text-center">
                  <div className="relative mb-6">
                    <div className="absolute -inset-4 rounded-full opacity-50 blur-xl transition-all" style={{
                      background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                    }} />
                    <div
                      className="relative w-56 h-56 mx-auto rounded-full overflow-hidden border-4 border-white shadow-2xl group-hover:scale-105 transition-transform"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${organization.primaryColor}40, ${organization.secondaryColor}40)`
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="flex items-center justify-center h-full text-6xl font-black text-gray-300">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="font-semibold" style={{ color: organization.primaryColor }}>
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Fun */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${organization.primaryColor}10, ${organization.secondaryColor}10)`
        }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Zap className="w-20 h-20 mx-auto mb-8" style={{ color: organization.primaryColor }} />
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">
            C'est Parti ! 🎉
          </h2>
          <p className="text-2xl text-gray-600 mb-12">
            Réservez votre soin en 2 minutes chrono
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-3 px-14 py-5 rounded-2xl font-black text-2xl text-white shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
          >
            <Sparkles className="w-8 h-8" />
            Je fonce réserver !
          </Link>
        </div>
      </section>

      {/* Footer Fresh */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
            }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold">{organization.name}</div>
          </div>
          <p className="text-gray-400 text-sm mb-6">Institut de beauté moderne</p>
          <p className="text-gray-500 text-xs">
            © 2024 {organization.name} • Propulsé par LAIA Connect
          </p>
        </div>
      </footer>
    </div>
  );
}
