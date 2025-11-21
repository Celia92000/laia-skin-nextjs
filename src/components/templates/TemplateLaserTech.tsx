'use client';

import Link from 'next/link';
import { Clock, Phone, MapPin } from 'lucide-react';

interface TemplateContent {
  hero: {
    title: string;
    subtitle?: string;
    description: string;
    ctaPrimary: string;
  };
  pricing: {
    title: string;
    note?: string;
  };
  features?: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  faq?: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    button: string;
    note?: string;
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

export default function TemplateLaserTech({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor;
  const secondaryColor = organization.secondaryColor;

  const defaultContent: TemplateContent = {
    hero: {
      title: 'Épilation Laser',
      description: organization.description || 'Technologie avancée pour des résultats durables',
      ctaPrimary: 'Découvrir'
    },
    pricing: {
      title: 'Tarifs',
      note: 'Protocoles personnalisés'
    },
    features: {
      title: 'Technologie',
      items: [
        { title: 'Laser Diode', description: 'Technologie de pointe' },
        { title: 'Tous Phototypes', description: 'Adapté à tous' },
        { title: 'Résultats', description: 'Effet durable' },
        { title: 'Praticiens', description: 'Équipe formée' }
      ]
    },
    faq: {
      title: 'Informations',
      items: [
        { question: 'Nombre de séances', answer: 'Protocole personnalisé de 6 à 8 séances espacées de 4 à 6 semaines.' },
        { question: 'Confort', answer: 'Système de refroidissement intégré pour un traitement confortable.' },
        { question: 'Tarifs', answer: 'Tarifs selon les zones. Protocoles sur mesure disponibles.' },
        { question: 'Éligibilité', answer: 'Consultation préalable pour évaluation personnalisée.' }
      ]
    },
    cta: {
      title: 'Consultation',
      description: 'Réservez votre rendez-vous',
      button: 'Réserver',
      note: 'Première consultation'
    },
    footer: {
      tagline: '',
      contact: {
        phone: '01 23 45 67 89',
        address: 'Paris'
      },
      hours: 'Lun-Sam 9h-19h'
    }
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-white">
      {/* Header - SUBTILITÉ: ligne horizontale très fine */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-light tracking-[0.3em] uppercase" style={{ color: secondaryColor }}>
              {organization.name}
            </h1>
            <nav className="hidden md:flex items-center gap-12">
              <a href="#tarifs" className="text-xs font-light tracking-[0.2em] uppercase text-gray-600 hover:text-gray-900 transition">
                Tarifs
              </a>
              <a href="#technologie" className="text-xs font-light tracking-[0.2em] uppercase text-gray-600 hover:text-gray-900 transition">
                Technologie
              </a>
              <a href="#contact" className="text-xs font-light tracking-[0.2em] uppercase text-gray-600 hover:text-gray-900 transition">
                Contact
              </a>
              <Link
                href="/booking"
                className="px-8 py-3 border text-xs font-light tracking-[0.2em] uppercase transition-all hover:bg-gray-50"
                style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
              >
                {c.hero.ctaPrimary}
              </Link>
            </nav>
          </div>
        </div>
        <div className="h-px" style={{ backgroundColor: `${primaryColor}20` }} />
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-light mb-8 tracking-tight" style={{ color: secondaryColor }}>
            {c.hero.title}
          </h2>
          <p className="text-lg font-light mb-12 text-gray-600 max-w-2xl mx-auto">
            {c.hero.description}
          </p>
          <Link
            href="/booking"
            className="inline-block px-12 py-4 text-white text-xs font-light tracking-[0.2em] uppercase transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {c.hero.ctaPrimary}
          </Link>
        </div>
      </section>

      {/* Ligne de séparation horizontale */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px" style={{ backgroundColor: `${primaryColor}20` }} />
      </div>

      {/* Tarifs - SUBTILITÉ: séparations horizontales entre chaque service */}
      <section id="tarifs" className="py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-light mb-4 tracking-tight" style={{ color: secondaryColor }}>
              {c.pricing.title}
            </h3>
            <p className="text-sm font-light text-gray-600">
              {c.pricing.note}
            </p>
          </div>

          <div className="bg-white">
            {services.slice(0, 8).map((service, idx) => (
              <div key={service.id}>
                <Link
                  href={`/booking?service=${service.id}`}
                  className="py-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1">
                    <h4 className="text-base font-light mb-1 tracking-wide" style={{ color: secondaryColor }}>
                      {service.name}
                    </h4>
                    <p className="text-xs font-light text-gray-500">
                      {service.description || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-xs font-light text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration}min
                    </div>
                    <div className="text-xl font-light" style={{ color: primaryColor }}>
                      {service.price}€
                    </div>
                  </div>
                </Link>
                {idx < services.slice(0, 8).length - 1 && (
                  <div className="h-px" style={{ backgroundColor: `${primaryColor}10` }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ligne de séparation horizontale */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px" style={{ backgroundColor: `${primaryColor}20` }} />
      </div>

      {/* Technologie - SUBTILITÉ: grille avec séparations horizontales */}
      {c.features && (
        <section id="technologie" className="py-24 px-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl font-light text-center mb-20 tracking-tight" style={{ color: secondaryColor }}>
              {c.features.title}
            </h3>

            <div className="grid md:grid-cols-4 gap-12">
              {c.features.items.map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="h-px w-12 mx-auto mb-6" style={{ backgroundColor: `${primaryColor}40` }} />
                  <h4 className="text-sm font-light mb-2 tracking-wide" style={{ color: secondaryColor }}>
                    {item.title}
                  </h4>
                  <p className="text-xs font-light text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ligne de séparation horizontale */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px" style={{ backgroundColor: `${primaryColor}20` }} />
      </div>

      {/* FAQ - SUBTILITÉ: séparations horizontales entre questions */}
      {c.faq && (
        <section className="py-24 px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-light text-center mb-20 tracking-tight" style={{ color: secondaryColor }}>
              {c.faq.title}
            </h3>

            <div>
              {c.faq.items.map((faq, idx) => (
                <div key={idx}>
                  <div className="py-8">
                    <h4 className="text-sm font-light mb-3 tracking-wide" style={{ color: secondaryColor }}>
                      {faq.question}
                    </h4>
                    <p className="text-xs font-light text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                  {idx < c.faq.items.length - 1 && (
                    <div className="h-px" style={{ backgroundColor: `${primaryColor}10` }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ligne de séparation horizontale */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px" style={{ backgroundColor: `${primaryColor}20` }} />
      </div>

      {/* CTA Final */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-light mb-6 tracking-tight" style={{ color: secondaryColor }}>
            {c.cta.title}
          </h3>
          <p className="text-sm font-light text-gray-600 mb-12">
            {c.cta.description}
          </p>
          <Link
            href="/booking"
            className="inline-block px-12 py-4 text-white text-xs font-light tracking-[0.2em] uppercase transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {c.cta.button}
          </Link>
          {c.cta.note && (
            <p className="mt-6 text-xs font-light text-gray-500">{c.cta.note}</p>
          )}
        </div>
      </section>

      {/* Footer avec ligne horizontale au-dessus */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="h-px" style={{ backgroundColor: `${primaryColor}20` }} />
      </div>

      <footer className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-light tracking-[0.3em] uppercase mb-4" style={{ color: secondaryColor }}>
                {organization.name}
              </h4>
              {c.footer.tagline && (
                <p className="text-xs font-light text-gray-500">
                  {c.footer.tagline}
                </p>
              )}
            </div>
            <div>
              <h4 className="text-xs font-light tracking-[0.2em] uppercase mb-4 text-gray-600">Contact</h4>
              <p className="text-xs font-light text-gray-500 mb-2 flex items-center gap-2">
                <Phone className="w-3 h-3" />
                {c.footer.contact.phone}
              </p>
              {c.footer.contact.address && (
                <p className="text-xs font-light text-gray-500 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {c.footer.contact.address}
                </p>
              )}
            </div>
            {c.footer.hours && (
              <div>
                <h4 className="text-xs font-light tracking-[0.2em] uppercase mb-4 text-gray-600">Horaires</h4>
                <p className="text-xs font-light text-gray-500">{c.footer.hours}</p>
              </div>
            )}
          </div>
          <div className="h-px mb-8" style={{ backgroundColor: `${primaryColor}10` }} />
          <div className="text-center">
            <p className="text-xs font-light text-gray-400">
              © 2024 {organization.name}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
