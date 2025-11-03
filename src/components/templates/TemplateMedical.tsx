'use client';

import Link from 'next/link';
import { Clock, Phone, MapPin, Calendar, Check, Star, Award } from 'lucide-react';

interface TemplateContent {
  hero: {
    title: string;
    subtitle?: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary?: string;
  };
  services: {
    title: string;
  };
  features?: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  team?: {
    title: string;
  };
  cta: {
    title: string;
    description: string;
    button: string;
  };
  footer: {
    tagline?: string;
  };
}

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
  content?: TemplateContent;
}

export default function TemplateMedical({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor;
  const secondaryColor = organization.secondaryColor;

  // Default content
  const defaultContent: TemplateContent = {
    hero: {
      title: 'Médecine Esthétique de Pointe',
      description: organization.description || 'Des traitements esthétiques avancés réalisés par des professionnels qualifiés',
      ctaPrimary: 'Consultation Gratuite',
      ctaSecondary: '01 23 45 67 89'
    },
    services: {
      title: 'Nos Traitements'
    },
    features: {
      title: 'Pourquoi Nous Choisir',
      items: [
        { title: 'Expertise', description: 'Médecins qualifiés' },
        { title: 'Excellence', description: 'Standards élevés' },
        { title: 'Sécurité', description: 'Protocoles stricts' },
        { title: 'Suivi', description: 'Accompagnement complet' }
      ]
    },
    team: {
      title: 'Notre Équipe'
    },
    cta: {
      title: 'Prêt à Commencer ?',
      description: 'Réservez votre consultation gratuite',
      button: 'Consultation Gratuite'
    },
    footer: {
      tagline: undefined
    }
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-white">
      {/* Header minimaliste noir */}
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold uppercase tracking-wider">{organization.name}</h1>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#traitements" className="text-sm uppercase hover:opacity-70 transition">Traitements</a>
              <a href="#tarifs" className="text-sm uppercase hover:opacity-70 transition">Tarifs</a>
              <a href="#equipe" className="text-sm uppercase hover:opacity-70 transition">Équipe</a>
              <Link
                href="/booking"
                className="px-6 py-2 text-black font-bold uppercase text-sm transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                {c.hero.ctaPrimary}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero simple et efficace */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            {c.hero.title.split(' ')[0]} {c.hero.title.split(' ')[1]}
            <br />
            <span style={{ color: primaryColor }}>{c.hero.title.split(' ').slice(2).join(' ')}</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            {c.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-10 py-4 text-white font-bold uppercase text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {c.hero.ctaPrimary}
            </Link>
            {c.hero.ctaSecondary && (
              <a
                href={`tel:${c.hero.ctaSecondary.replace(/\s/g, '')}`}
                className="px-10 py-4 bg-black text-white font-bold uppercase text-sm transition-all hover:bg-gray-800"
              >
                {c.hero.ctaSecondary}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Traitements - Grid simple */}
      <section id="traitements" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16 uppercase tracking-wider">{c.services.title}</h3>

          <div className="grid md:grid-cols-3 gap-px bg-gray-200">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="bg-white p-8 hover:bg-gray-50 transition-colors group"
              >
                <h4 className="text-xl font-bold mb-3 uppercase tracking-wide">{service.name}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description || "Traitement médical esthétique"}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {service.price}€
                  </div>
                  <div className="text-sm text-gray-500">
                    {service.duration}min
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      {c.features && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-16 uppercase tracking-wider">{c.features.title}</h3>

            <div className="grid md:grid-cols-4 gap-8">
              {c.features.items.map((item, idx) => {
                const icons = [Award, Star, Check, Phone];
                const Icon = icons[idx % icons.length];
                return (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-black flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-lg mb-2 uppercase">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Équipe */}
      {team && team.length > 0 && c.team && (
        <section id="equipe" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-16 uppercase tracking-wider">{c.team.title}</h3>

            <div className="grid md:grid-cols-3 gap-px bg-gray-200">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="bg-white">
                  <div className="aspect-square relative bg-gray-100" style={{
                    backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    {!member.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-300">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="text-lg font-bold mb-1 uppercase">{member.name}</h4>
                    <p className="text-sm" style={{ color: primaryColor }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6 uppercase">{c.cta.title}</h3>
          <p className="text-xl mb-10 text-gray-300">
            {c.cta.description}
          </p>
          <Link
            href="/booking"
            className="inline-block px-12 py-5 font-bold uppercase text-black transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {c.cta.button}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm mb-2 uppercase tracking-wider">{c.footer.tagline || organization.name}</p>
          <p className="text-xs text-gray-400">
            © 2024 {organization.name} • Propulsé par LAIA Connect
          </p>
        </div>
      </footer>
    </div>
  );
}
