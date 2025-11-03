'use client';

import Link from 'next/link';
import { BaseTemplateContent } from '@/types/template-content';
import { Leaf, Clock, Circle } from 'lucide-react';

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

export default function TemplateZen({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor
  const secondaryColor = organization.secondaryColor

  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Sérénité & Harmonie',
      description: organization.description || 'Un havre de paix pour votre bien-être',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Soins Relaxants',
      description: 'Des moments de détente absolue'
    },
    cta: {
      title: 'Trouvez Votre Équilibre',
      description: 'Offrez-vous un moment de sérénité',
      button: 'Réserver un Soin'
    },
    footer: {}
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/20">
      {/* Header zen minimaliste */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Leaf className="w-8 h-8" style={{ color: primaryColor }} />
                <Circle className="w-12 h-12 absolute -inset-2 -z-10" style={{ color: `${primaryColor}40` }} strokeWidth={1} />
              </div>
              <h1 className="text-2xl font-light tracking-wide text-stone-800">
                {organization.name}
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a href="#services" className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-light">
                Soins
              </a>
              <a href="#equipe" className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-light">
                Équipe
              </a>
              <a href="#contact" className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-light">
                Contact
              </a>
              <Link
                href="/booking"
                className="px-6 py-3 text-white rounded-full font-light hover:shadow-xl transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 40px ${primaryColor}30`
                }}
              >
                Réserver
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero zen et apaisant */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Motifs organiques en arrière-plan */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{
            background: `radial-gradient(circle, ${primaryColor}40, transparent)`
          }} />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{
            background: `radial-gradient(circle, ${secondaryColor}30, transparent)`,
            animationDelay: '1000ms'
          }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Ornement zen */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
            <Leaf className="w-6 h-6" style={{ color: primaryColor }} />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-stone-800 mb-8 leading-tight tracking-wide">
            <span className="block mb-4">Un Havre de Paix</span>
            <span className="block font-normal" style={{ color: primaryColor }}>
              Pour Votre Bien-Être
            </span>
          </h1>

          <p className="text-xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            {organization.description || "Ressourcez-vous dans un espace dédié à votre sérénité. Reconnectez-vous à l'essentiel à travers des soins naturels et authentiques."}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              href="/booking"
              className="group px-10 py-4 text-white rounded-full font-light text-lg hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 20px 60px ${primaryColor}40`
              }}
            >
              <Leaf className="w-5 h-5" />
              Réserver un Soin
            </Link>
            <Link
              href="#services"
              className="px-10 py-4 border-2 border-stone-300 text-stone-700 rounded-full font-light text-lg hover:bg-white hover:border-stone-400 transition-all"
            >
              Découvrir
            </Link>
          </div>

          {/* Valeurs zen */}
          <div className="mt-24 grid grid-cols-3 gap-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                background: `linear-gradient(to bottom right, ${primaryColor}20, ${secondaryColor}20)`
              }}>
                <Leaf className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <p className="text-sm text-stone-600 font-light">100% Naturel</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Circle className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-sm text-stone-600 font-light">Éco-Responsable</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                background: `linear-gradient(to bottom right, ${secondaryColor}20, ${primaryColor}20)`
              }}>
                <Leaf className="w-8 h-8" style={{ color: secondaryColor }} />
              </div>
              <p className="text-sm text-stone-600 font-light">Bien-Être Total</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services - Style organique et naturel */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}50, transparent)` }} />
              <Leaf className="w-5 h-5" style={{ color: primaryColor }} />
              <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}50, transparent)` }} />
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-stone-800 mb-6">
              Nos Soins Naturels
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto font-light">
              Des prestations pensées pour votre équilibre et votre harmonie
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.slice(0, 6).map((service, idx) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-stone-200/50 hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                style={{
                  ['--hover-shadow' as any]: `${primaryColor}20`
                }}
              >
                {/* Numéro élégant */}
                <div className="absolute -top-3 -left-3 w-14 h-14 rounded-full flex items-center justify-center text-white font-light text-xl shadow-lg" style={{
                  background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 30px ${primaryColor}40`
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="ml-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-light text-stone-800 transition-colors pr-4" style={{
                      ['--hover-color' as any]: primaryColor
                    }}>
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 text-stone-500 text-sm whitespace-nowrap">
                      <Clock className="w-4 h-4" />
                      {service.duration}min
                    </div>
                  </div>

                  <p className="text-stone-600 text-sm mb-6 leading-relaxed font-light">
                    {service.description || "Un soin naturel pour retrouver votre équilibre intérieur"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <span className="text-3xl font-light" style={{ color: primaryColor }}>
                      {service.price}€
                    </span>
                    <div className="flex items-center gap-2 text-sm font-light group-hover:gap-3 transition-all" style={{ color: primaryColor }}>
                      <span>Découvrir</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe - Ambiance naturelle */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-24 px-6 bg-white/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}50, transparent)` }} />
                <Circle className="w-5 h-5" style={{ color: primaryColor }} strokeWidth={1} />
                <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}50, transparent)` }} />
              </div>
              <h2 className="text-4xl md:text-5xl font-light text-stone-800 mb-6">
                Notre Équipe Bienveillante
              </h2>
              <p className="text-stone-600 max-w-2xl mx-auto font-light">
                Des thérapeutes passionnées à votre écoute
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="group text-center">
                  <div className="relative mb-6 mx-auto w-64">
                    {/* Cadre décoratif */}
                    <div className="absolute -inset-4 rounded-full border transition-colors" style={{
                      borderColor: `${primaryColor}30`,
                      ['--hover-border' as any]: `${primaryColor}50`
                    }} />
                    <div className="absolute -inset-2 rounded-full border transition-colors" style={{
                      borderColor: `${primaryColor}20`,
                      ['--hover-border' as any]: `${primaryColor}40`
                    }} />

                    <div
                      className="relative w-full aspect-square rounded-full overflow-hidden"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-7xl font-light" style={{ color: `${primaryColor}60` }}>
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-light text-stone-800 mb-2">{member.name}</h3>
                  <p className="text-sm font-light" style={{ color: primaryColor }}>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA zen et apaisant */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to bottom right, ${primaryColor}08, transparent, ${secondaryColor}08)`
        }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center" style={{
            background: `linear-gradient(to bottom right, ${primaryColor}20, ${secondaryColor}20)`
          }}>
            <Leaf className="w-10 h-10" style={{ color: primaryColor }} />
          </div>

          <h2 className="text-4xl md:text-5xl font-light text-stone-800 mb-6">
            Prenez un Moment pour Vous
          </h2>
          <p className="text-xl text-stone-600 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
            Offrez-vous une pause bien-être et laissez-vous guider vers la sérénité
          </p>

          <Link
            href="/booking"
            className="inline-flex items-center gap-3 px-12 py-5 text-white rounded-full font-light text-lg hover:shadow-2xl transition-all hover:scale-105"
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
              boxShadow: `0 20px 60px ${primaryColor}40`
            }}
          >
            <Circle className="w-5 h-5" />
            Réserver Maintenant
          </Link>
        </div>
      </section>

      {/* Footer zen */}
      <footer className="border-t border-stone-200 py-12 px-6 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Leaf className="w-6 h-6" style={{ color: primaryColor }} />
              <span className="font-light text-lg text-stone-800">{organization.name}</span>
            </div>
            <p className="text-stone-600 text-sm font-light">
              © 2024 {organization.name}. Tous droits réservés.
            </p>
            <p className="text-stone-400 text-xs font-light">
              Propulsé par LAIA Connect
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
