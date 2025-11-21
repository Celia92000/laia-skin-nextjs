'use client';

import Link from 'next/link';
import { BaseTemplateContent } from '@/types/template-content';
import { Clock, CheckCircle, Award, Users } from 'lucide-react';

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

export default function TemplateProfessional({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Excellence Professionnelle',
      description: organization.description || 'Des soins professionnels de qualité supérieure',
      ctaPrimary: 'Prendre Rendez-vous',
      ctaSecondary: 'En savoir plus'
    },
    services: {
      title: 'Nos Services Professionnels',
      description: 'Une gamme complète de soins adaptés à vos besoins'
    },
    cta: {
      title: 'Réservez Votre Consultation',
      description: 'Contactez-nous dès aujourd\'hui',
      button: 'Prendre Rendez-vous'
    },
    footer: {}
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Corporate */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: organization.secondaryColor }}>
                {organization.name}
              </h1>
              <p className="text-sm text-gray-600">Institut de beauté professionnel</p>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-gray-700 hover:text-gray-900">Services</a>
              <a href="#equipe" className="text-sm font-medium text-gray-700 hover:text-gray-900">Équipe</a>
              <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-gray-900">Contact</a>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: organization.primaryColor }}
              >
                Réserver
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section Corporate */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-6">
                Excellence & Professionnalisme
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {c.hero.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {c.hero.description}
              </p>
              <div className="flex gap-4">
                <Link
                  href="/booking"
                  className="px-8 py-4 rounded-lg font-semibold text-white transition-all hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: organization.primaryColor }}
                >
                  {c.hero.ctaPrimary}
                </Link>
                <Link
                  href="#services"
                  className="px-8 py-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Nos services
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: CheckCircle, title: 'Qualité certifiée', desc: 'Standards professionnels' },
                { icon: Award, title: 'Équipe experte', desc: '10+ ans d\'expérience' },
                { icon: Users, title: '2000+ clients', desc: 'Satisfaits chaque année' },
                { icon: Clock, title: 'Flexibilité', desc: 'Horaires adaptés' }
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <item.icon className="w-10 h-10 mb-3" style={{ color: organization.primaryColor }} />
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{c.services.title}</h2>
            <p className="text-gray-600 text-lg">{c.services.description}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {service.duration}min
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description || "Prestation réalisée par nos experts"}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-3xl font-bold" style={{ color: organization.primaryColor }}>
                    {service.price}€
                  </span>
                  <span className="text-sm font-medium text-gray-500">TTC</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Notre équipe</h2>
              <p className="text-gray-600 text-lg">Des professionnels qualifiés à votre service</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="text-center">
                  <div
                    className="w-48 h-48 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center text-6xl font-bold text-gray-300"
                    style={{
                      background: member.imageUrl
                        ? `url(${member.imageUrl}) center/cover`
                        : `linear-gradient(135deg, ${organization.primaryColor}20, ${organization.secondaryColor}20)`
                    }}
                  >
                    {!member.imageUrl && member.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Prêt à prendre soin de vous ?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Réservez votre rendez-vous en ligne en quelques clics
          </p>
          <Link
            href="/booking"
            className="inline-block px-10 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90 shadow-xl"
            style={{ backgroundColor: organization.primaryColor }}
          >
            Réserver maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-xl font-bold text-gray-900">{organization.name}</div>
              <div className="text-sm text-gray-600">Institut de beauté professionnel</div>
            </div>
            <div className="text-gray-600 text-sm">
              © 2024 {organization.name}. Tous droits réservés.
            </div>
            <div className="text-gray-400 text-xs">
              Propulsé par LAIA Connect
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
