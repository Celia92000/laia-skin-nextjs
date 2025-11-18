'use client';

import Link from 'next/link';
import { BaseTemplateContent } from '@/types/template-content';

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

export default function TemplateMinimal({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Beauté Minimaliste',
      description: organization.description || 'L\'essentiel de la beauté',
      ctaPrimary: 'Réserver'
    },
    services: {
      title: 'Nos Services'
    },
    cta: {
      title: 'Prêt pour une expérience unique ?',
      description: 'Réservez votre rendez-vous',
      button: 'Réserver Maintenant'
    },
    footer: {}
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-white">
      {/* Header ultra minimal - Style magazine */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-light tracking-[0.3em] text-gray-900">
              {organization.name.toUpperCase()}
            </h1>
            <nav className="hidden md:flex gap-16 items-center">
              <a href="#services" className="text-xs text-gray-600 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">Services</a>
              <a href="#equipe" className="text-xs text-gray-600 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">Équipe</a>
              <a href="#contact" className="text-xs text-gray-600 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero - Typographie géante éditorial */}
      <section className="pt-48 pb-40 px-8">
        <div className="max-w-5xl mx-auto">
          {/* Petit texte au dessus */}
          <div className="mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-4">
              Édition 2024
            </p>
            <div className="w-16 h-px bg-gray-300" />
          </div>

          {/* Titre géant */}
          <h2 className="text-8xl md:text-9xl font-extralight text-gray-900 mb-12 leading-[0.9] tracking-tight">
            {organization.name}
          </h2>

          <div className="grid md:grid-cols-2 gap-20 mt-20">
            <div>
              <p className="text-2xl text-gray-500 font-light leading-relaxed tracking-wide">
                {organization.description || 'L\'art de la beauté dans sa forme la plus pure. Une expérience sensorielle unique.'}
              </p>
            </div>
            <div className="flex items-end">
              <Link
                href="/booking"
                className="group inline-flex items-center gap-4 border-b-2 pb-2 text-sm tracking-[0.2em] uppercase font-light transition-all"
                style={{ borderColor: organization.primaryColor, color: organization.primaryColor }}
              >
                <span>Réserver</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Image/Divider section */}
      <section className="px-8 mb-40">
        <div className="max-w-6xl mx-auto">
          <div className="aspect-[21/9] bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
              }}
            />
          </div>
        </div>
      </section>

      {/* Services - Liste verticale ultra épurée */}
      <section id="services" className="px-8 pb-40">
        <div className="max-w-5xl mx-auto">
          {/* Header section */}
          <div className="mb-20">
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-6">
              {c.services.title}
            </p>
            <h3 className="text-6xl font-light text-gray-900 mb-8 tracking-tight">
              Nos Soins
            </h3>
            <div className="w-24 h-px bg-gray-300" />
          </div>

          {/* Liste épurée */}
          <div className="space-y-0">
            {services.slice(0, 8).map((service, idx) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group flex items-baseline justify-between py-10 border-b border-gray-200 hover:border-gray-400 transition-all"
              >
                <div className="flex-1 pr-8">
                  <div className="flex items-baseline gap-6 mb-3">
                    <span className="text-xs text-gray-400 font-light tracking-[0.2em] uppercase">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-3xl font-light text-gray-900 group-hover:translate-x-2 transition-transform tracking-tight">
                      {service.name}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 font-light ml-12">
                    {service.duration} minutes
                  </p>
                </div>
                <div className="flex items-baseline gap-8">
                  <span
                    className="text-4xl font-extralight tracking-tight"
                    style={{ color: organization.primaryColor }}
                  >
                    {service.price}€
                  </span>
                  <span className="text-2xl text-gray-300 group-hover:text-gray-900 group-hover:translate-x-2 transition-all">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe - Style galerie d'art */}
      {team && team.length > 0 && (
        <section id="equipe" className="px-8 pb-40">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-20">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-6">
                Notre Équipe
              </p>
              <h3 className="text-6xl font-light text-gray-900 mb-8 tracking-tight">
                Les Expertes
              </h3>
              <div className="w-24 h-px bg-gray-300" />
            </div>

            {/* Grille alignée */}
            <div className="grid md:grid-cols-2 gap-16">
              {team.slice(0, 4).map((member, idx) => (
                <div
                  key={member.id}
                  className="group"
                >
                  {/* Photo */}
                  <div
                    className="aspect-[3/4] bg-gray-100 mb-8 relative overflow-hidden"
                    style={{
                      background: member.imageUrl
                        ? `url(${member.imageUrl}) center/cover`
                        : `linear-gradient(180deg, ${organization.primaryColor}15, ${organization.secondaryColor}15)`
                    }}
                  >
                    {!member.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-9xl font-extralight">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">
                      {member.name}
                    </h4>
                    <p className="text-xs text-gray-500 tracking-[0.2em] uppercase font-light">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact - Minimaliste et élégant */}
      <section id="contact" className="px-8 py-40 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-32">
            {/* Informations */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-12">
                Contact
              </p>

              <div className="space-y-12">
                <div>
                  <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-light">
                    Adresse
                  </h4>
                  <p className="text-xl text-gray-900 font-light leading-relaxed">
                    À 6 minutes de la gare<br />
                    de Nanterre Université<br />
                    92000 Nanterre, France
                  </p>
                </div>

                <div>
                  <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-light">
                    Téléphone
                  </h4>
                  <p className="text-xl text-gray-900 font-light">
                    +33 6 31 10 75 31
                  </p>
                </div>

                <div>
                  <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-light">
                    Email
                  </h4>
                  <p className="text-xl text-gray-900 font-light">
                    contact@{organization.name.toLowerCase().replace(/\s+/g, '')}.fr
                  </p>
                </div>
              </div>
            </div>

            {/* Horaires + CTA */}
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-12">
                Horaires
              </p>

              <div className="space-y-6 mb-16">
                {[
                  { day: 'Lundi – Vendredi', hours: '9h – 19h' },
                  { day: 'Samedi', hours: '10h – 18h' },
                  { day: 'Dimanche', hours: 'Fermé' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-baseline border-b border-gray-200 pb-4">
                    <span className="text-gray-600 font-light">{item.day}</span>
                    <span className="text-gray-900 font-light">{item.hours}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/booking"
                className="group inline-flex items-center gap-4 border-b-2 pb-2 text-sm tracking-[0.2em] uppercase font-light transition-all"
                style={{ borderColor: organization.primaryColor, color: organization.primaryColor }}
              >
                <span>Prendre rendez-vous</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer ultra minimal */}
      <footer className="border-t border-gray-200 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h3 className="text-lg font-light tracking-[0.3em] text-gray-900 mb-2">
                {organization.name.toUpperCase()}
              </h3>
              <p className="text-xs text-gray-400 tracking-[0.2em] uppercase font-light">
                Since 2024
              </p>
            </div>
            <div className="flex gap-12">
              <a href="#" className="text-xs text-gray-400 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">
                Facebook
              </a>
              <a href="#" className="text-xs text-gray-400 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">
                Instagram
              </a>
              <a href="#" className="text-xs text-gray-400 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">
                TikTok
              </a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-light">
              © 2024 {organization.name}. Tous droits réservés.
            </p>
            <p className="text-xs text-gray-300 font-light">
              Propulsé par LAIA Connect
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
