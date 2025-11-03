'use client';

import Link from 'next/link';
import { Clock, Star, Award, Calendar, MapPin, Phone } from 'lucide-react';

interface TemplateContent {
  hero: {
    badge?: string;
    title: string;
    subtitle?: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary?: string;
  };
  services: {
    title: string;
    description: string;
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
    description: string;
  };
  testimonials?: {
    title: string;
    items: Array<{
      name: string;
      rating: number;
      text: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    button: string;
    secondaryButton?: string;
  };
  footer: {
    tagline?: string;
    contact: {
      phone: string;
      address?: string;
    };
    hours?: string;
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

export default function TemplateSpaLuxe({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor;
  const secondaryColor = organization.secondaryColor;

  // Default content
  const defaultContent: TemplateContent = {
    hero: {
      badge: 'Institut de Beauté Premium',
      title: 'Beauté Haute Technologie',
      description: organization.description || 'Un institut à la pointe de la technologie où expertise médicale et soins esthétiques se rencontrent',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'Nous Appeler'
    },
    services: {
      title: 'Nos Soins',
      description: 'Des traitements sur-mesure adaptés à vos besoins'
    },
    features: {
      title: 'Technologies de Pointe',
      items: [
        { title: 'Laser', description: 'Dernière génération' },
        { title: 'LED', description: 'Photothérapie' },
        { title: 'Radiofréquence', description: 'Raffermissement' },
        { title: 'Cryolipolyse', description: 'Minceur ciblée' }
      ]
    },
    team: {
      title: 'Notre Équipe',
      description: 'Des professionnels experts à votre service'
    },
    testimonials: {
      title: 'Témoignages Clients',
      items: [
        { name: 'Marie L.', rating: 5, text: 'Un institut exceptionnel ! Des résultats visibles dès les premières séances.' },
        { name: 'Sophie D.', rating: 5, text: 'Équipe très professionnelle et à l\'écoute. Je recommande vivement.' },
        { name: 'Laura M.', rating: 5, text: 'Technologies de pointe et soins personnalisés. Exactement ce que je cherchais.' }
      ]
    },
    cta: {
      title: 'Découvrez l\'Excellence',
      description: 'Réservez votre consultation personnalisée',
      button: 'Prendre Rendez-Vous',
      secondaryButton: '01 23 45 67 89'
    },
    footer: {
      tagline: 'Institut de beauté haute technologie',
      contact: {
        phone: '01 23 45 67 89',
        address: 'Paris, France'
      },
      hours: 'Lun-Sam : 9h-19h'
    }
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-white">
      {/* Header élégant */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#soins" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                Soins
              </a>
              <a href="#equipe" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                Équipe
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
                Contact
              </a>
              <Link
                href="/booking"
                className="px-6 py-2 rounded-full text-white font-semibold uppercase text-xs tracking-wider transition-all hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {c.hero.ctaPrimary}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {c.hero.badge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-8">
              <Star className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-sm font-semibold text-gray-700">{c.hero.badge}</span>
            </div>
          )}

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {c.hero.title}
          </h2>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {c.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-10 py-4 rounded-full text-white font-bold uppercase text-sm tracking-wider transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Calendar className="w-5 h-5" />
              {c.hero.ctaPrimary}
            </Link>
            {c.hero.ctaSecondary && (
              <a
                href={`tel:${c.footer.contact.phone.replace(/\s/g, '')}`}
                className="px-10 py-4 rounded-full border-2 font-bold uppercase text-sm tracking-wider transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Phone className="w-5 h-5" />
                {c.hero.ctaSecondary}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Catégories de soins */}
      <section id="soins" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4">{c.services.title}</h3>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            {c.services.description}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] relative overflow-hidden" style={{
                  background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`
                }}>
                  <div className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-gray-200">
                    {service.name.charAt(0)}
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white rounded-full text-xs font-bold" style={{ color: primaryColor }}>
                    {service.duration}min
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-xl font-bold mb-3 group-hover:text-gray-700 transition">{service.name}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {service.description || "Un soin expert pour sublimer votre beauté"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {service.price}€
                    </div>
                    <span className="text-sm font-semibold group-hover:translate-x-1 transition-transform" style={{ color: primaryColor }}>
                      Réserver →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies */}
      {c.features && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-16">{c.features.title}</h3>

            <div className="grid md:grid-cols-4 gap-6">
              {c.features.items.map((feature, idx) => (
                <div key={idx} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                    background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`
                  }}>
                    <Award className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                  <h4 className="font-bold mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Équipe */}
      {team && team.length > 0 && c.team && (
        <section id="equipe" className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-4">{c.team.title}</h3>
            <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
              {c.team.description}
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition">
                  <div className="aspect-square relative" style={{
                    backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    background: member.imageUrl ? undefined : `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`
                  }}>
                    {!member.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-gray-300">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="text-xl font-bold mb-2">{member.name}</h4>
                    <p className="text-sm font-semibold" style={{ color: primaryColor }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Témoignages */}
      {c.testimonials && (
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl font-bold text-center mb-16">{c.testimonials.title}</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {c.testimonials.items.map((review, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" style={{ color: primaryColor }} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 italic">"{review.text}"</p>
                  <p className="text-sm font-semibold">{review.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 px-6 relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
      }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-4xl font-bold text-white mb-6">
            {c.cta.title}
          </h3>
          <p className="text-xl text-white/90 mb-10">
            {c.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-12 py-5 bg-white rounded-full font-bold uppercase text-sm tracking-wider transition-all hover:bg-gray-100"
              style={{ color: primaryColor }}
            >
              {c.cta.button}
            </Link>
            {c.cta.secondaryButton && (
              <a
                href={`tel:${c.footer.contact.phone.replace(/\s/g, '')}`}
                className="px-12 py-5 border-2 border-white rounded-full text-white font-bold uppercase text-sm tracking-wider transition-all hover:bg-white/10"
              >
                {c.cta.secondaryButton}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">{organization.name}</h4>
              {c.footer.tagline && (
                <p className="text-sm text-gray-400">{c.footer.tagline}</p>
              )}
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-sm text-gray-400 mb-2">📞 {c.footer.contact.phone}</p>
              {c.footer.contact.address && (
                <p className="text-sm text-gray-400">📍 {c.footer.contact.address}</p>
              )}
            </div>
            {c.footer.hours && (
              <div>
                <h4 className="font-bold mb-4">Horaires</h4>
                <p className="text-sm text-gray-400">{c.footer.hours}</p>
              </div>
            )}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-400">
              © 2024 {organization.name} • Propulsé par LAIA Connect
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
