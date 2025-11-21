'use client';

import Link from 'next/link';
import { BaseTemplateContent } from '@/types/template-content';
import { Clock, Star, Heart } from 'lucide-react';

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

export default function TemplateBoutique({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Beauté Chic & Raffinée',
      description: organization.description || 'Votre boutique beauté de luxe',
      ctaPrimary: 'Découvrir',
      ctaSecondary: 'Réserver'
    },
    services: {
      title: 'Nos Soins',
      description: 'Une sélection raffinée de soins beauté'
    },
    cta: {
      title: 'Venez Nous Rencontrer',
      description: 'Réservez votre moment privilégié',
      button: 'Prendre Rendez-vous'
    },
    footer: {}
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header Boutique chic */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <h1 className="text-3xl font-serif" style={{ color: organization.secondaryColor }}>
                {organization.name}
              </h1>
              <p className="text-xs tracking-widest text-gray-500 uppercase">Boutique de beauté</p>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Services</a>
              <a href="#equipe" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Équipe</a>
              <Link
                href="/booking"
                className="px-6 py-2 rounded-full font-medium text-white transition-all hover:scale-105"
                style={{ backgroundColor: organization.primaryColor }}
              >
                Réserver
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Boutique */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 mb-8 shadow-sm">
            <Heart className="w-4 h-4" style={{ color: organization.primaryColor }} />
            <span className="text-sm text-gray-700">Votre beauté, notre passion</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif mb-8" style={{ color: organization.secondaryColor }}>
            Bienvenue dans votre<br />
            <span className="italic" style={{ color: organization.primaryColor }}>Boutique Beauté</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {organization.description || "Un espace intime et raffiné dédié à votre beauté et votre bien-être"}
          </p>

          <Link
            href="/booking"
            className="inline-block px-10 py-4 rounded-full font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
          >
            Découvrir nos soins
          </Link>

          {/* Petites étoiles décoratives */}
          <div className="flex justify-center gap-8 mt-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5" style={{ color: organization.primaryColor, fill: organization.primaryColor }} />
            ))}
          </div>
        </div>
      </section>

      {/* Services en cartes élégantes */}
      <section id="services" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4" style={{ color: organization.secondaryColor }}>
              Nos Soins Signature
            </h2>
            <p className="text-gray-600">Une sélection de traitements raffinés</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.slice(0, 6).map((service, idx) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-2">0{idx + 1}</div>
                    <h3 className="text-2xl font-serif mb-2" style={{ color: organization.secondaryColor }}>
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {service.description || "Un moment de détente et de beauté"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </div>
                  <div className="text-3xl font-bold" style={{ color: organization.primaryColor }}>
                    {service.price}€
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section Boutique */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-16 px-6 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif mb-4" style={{ color: organization.secondaryColor }}>
                Notre Équipe
              </h2>
              <p className="text-gray-600">Des expertes à votre écoute</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="text-center group">
                  <div className="relative mb-6 mx-auto w-48 h-48">
                    <div
                      className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${organization.primaryColor}30, ${organization.secondaryColor}30)`
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="flex items-center justify-center h-full text-5xl font-serif text-gray-300">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-serif mb-2" style={{ color: organization.secondaryColor }}>
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Boutique */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-3xl p-12 shadow-xl" style={{
          borderTop: `4px solid ${organization.primaryColor}`
        }}>
          <Heart className="w-16 h-16 mx-auto mb-6" style={{ color: organization.primaryColor }} />
          <h2 className="text-4xl font-serif mb-6" style={{ color: organization.secondaryColor }}>
            Offrez-vous un moment rien que pour vous
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Réservez votre rendez-vous dans notre boutique beauté
          </p>
          <Link
            href="/booking"
            className="inline-block px-12 py-4 rounded-full font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
          >
            Prendre rendez-vous
          </Link>
        </div>
      </section>

      {/* Footer Boutique */}
      <footer className="bg-white border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-serif mb-2" style={{ color: organization.secondaryColor }}>
            {organization.name}
          </div>
          <p className="text-sm text-gray-500 mb-6">Boutique de beauté</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4" style={{ color: organization.primaryColor, fill: organization.primaryColor }} />
            ))}
          </div>
          <p className="text-gray-400 text-xs">
            © 2024 {organization.name} • Propulsé par LAIA Connect
          </p>
        </div>
      </footer>
    </div>
  );
}
