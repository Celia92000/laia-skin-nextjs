'use client';

import Link from 'next/link';
import { Clock, Phone, MapPin, Calendar } from 'lucide-react';
import MobileMenu from './shared/MobileMenu';
import FloatingCallButton from './shared/FloatingCallButton';
import FloatingWhatsAppButton from './shared/FloatingWhatsAppButton';
import ScrollToTopButton from './shared/ScrollToTopButton';
import TemplateFooter from './shared/TemplateFooter';
import HeroMedia from './shared/HeroMedia';

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
    description?: string;
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
    description?: string;
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
    accentColor?: string;

    // Images
    logoUrl?: string;
    heroImage?: string;
    heroVideo?: string;
    faviconUrl?: string;

    // Contact
    email?: string;
    contactEmail?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    googleMapsUrl?: string;

    // Social Media
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
    linkedin?: string;
    youtube?: string;

    // Business Hours
    businessHours?: any;

    // Founder
    founderName?: string;
    founderTitle?: string;
    founderQuote?: string;
    founderImage?: string;

    // Legal
    siret?: string;
    termsAndConditions?: string;
    privacyPolicy?: string;
    legalNotice?: string;

    // SEO
    metaTitle?: string;
    metaDescription?: string;
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

  const defaultContent: TemplateContent = {
    hero: {
      title: 'Excellence Médicale',
      description: organization.description || 'Expertise et rigueur au service de votre beauté',
      ctaPrimary: 'Consultation',
      ctaSecondary: 'Contact'
    },
    services: {
      title: 'Actes Médicaux',
      description: 'Protocoles sur mesure'
    },
    features: {
      title: 'Expertise',
      items: [
        { title: 'Médical', description: 'Praticiens diplômés' },
        { title: 'Protocoles', description: 'Approche personnalisée' },
        { title: 'Sécurité', description: 'Normes strictes' },
        { title: 'Suivi', description: 'Accompagnement rigoureux' }
      ]
    },
    team: {
      title: 'Praticiens',
      description: 'Corps médical qualifié'
    },
    testimonials: {
      title: 'Témoignages',
      items: [
        { name: 'M.L.', rating: 5, text: 'Approche médicale irréprochable.' },
        { name: 'S.R.', rating: 5, text: 'Professionnalisme exemplaire.' },
        { name: 'L.D.', rating: 5, text: 'Résultats conformes aux attentes.' }
      ]
    },
    cta: {
      title: 'Consultation Médicale',
      description: 'Réservez votre rendez-vous',
      button: 'Réserver',
    },
    footer: {
      tagline: '',
      contact: {
        phone: '01 23 45 67 89',
        address: 'Paris'
      },
      hours: 'Lun-Ven 9h-19h'
    }
  };

  const c = content || defaultContent;

  const menuItems = [
    { label: 'Services', href: '#services' },
    { label: 'Équipe', href: '#equipe' },
    ...(organization.founderName ? [{ label: 'Fondatrice', href: '#founder' }] : []),
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header ultra épuré - SUBTILITÉ: plus d'espace vertical */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-light tracking-[0.3em] uppercase" style={{ color: secondaryColor }}>
              {organization.name}
            </h1>
            <nav className="hidden md:flex items-center gap-16">
              <a href="#actes" className="text-xs font-light tracking-[0.2em] uppercase text-gray-600 hover:text-gray-900 transition">
                Actes
              </a>
              <a href="#equipe" className="text-xs font-light tracking-[0.2em] uppercase text-gray-600 hover:text-gray-900 transition">
                Équipe
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
      </header>

      {/* Hero - SUBTILITÉ: espacement vertical très généreux */}
      <section className="pt-40 pb-32 px-8 relative overflow-hidden">
        {/* Background media (video or image) */}
        {(organization.heroVideo || organization.heroImage) && (
          <HeroMedia
            videoUrl={organization.heroVideo}
            imageUrl={organization.heroImage}
            alt={`${organization.name} hero`}
            priority
            overlay
            overlayOpacity={0.4}
          />
        )}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-light mb-12 tracking-tight" style={{ color: secondaryColor }}>
            {c.hero.title}
          </h2>
          <p className="text-lg font-light mb-16 text-gray-600 max-w-2xl mx-auto">
            {c.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-12 py-4 text-white text-xs font-light tracking-[0.2em] uppercase transition-all hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {c.hero.ctaPrimary}
            </Link>
            {c.hero.ctaSecondary && (
              <a
                href={`tel:${c.footer.contact.phone.replace(/\s/g, '')}`}
                className="px-12 py-4 border text-xs font-light tracking-[0.2em] uppercase transition-all hover:bg-gray-50"
                style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
              >
                {c.hero.ctaSecondary}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Actes - SUBTILITÉ: liste verticale aérée */}
      <section id="actes" className="py-32 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-4xl font-light mb-4 tracking-tight" style={{ color: secondaryColor }}>
              {c.services.title}
            </h3>
            <p className="text-sm font-light text-gray-600">
              {c.services.description}
            </p>
          </div>

          <div className="space-y-1 bg-gray-200">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="bg-white p-8 hover:bg-gray-50 transition-colors group flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="text-base font-light mb-1 tracking-wide" style={{ color: secondaryColor }}>
                    {service.name}
                  </h4>
                  <p className="text-xs font-light text-gray-500">
                    {service.description || ""}
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-xs font-light text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.duration}min
                  </div>
                  <div className="text-xl font-light" style={{ color: primaryColor }}>
                    {service.price}€
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise - SUBTILITÉ: grille large avec beaucoup d'espace */}
      {c.features && (
        <section className="py-32 px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-4xl font-light text-center mb-24 tracking-tight" style={{ color: secondaryColor }}>
              {c.features.title}
            </h3>

            <div className="grid md:grid-cols-4 gap-16">
              {c.features.items.map((item, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className="w-px h-16 mx-auto mb-8"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  />
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

      {/* Équipe */}
      {team && team.length > 0 && c.team && (
        <section id="equipe" className="py-32 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <h3 className="text-4xl font-light mb-4 tracking-tight" style={{ color: secondaryColor }}>
                {c.team.title}
              </h3>
              <p className="text-sm font-light text-gray-600">
                {c.team.description}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="bg-white">
                  <div
                    className="aspect-[3/4] relative bg-gray-100"
                    style={{
                      backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!member.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl font-light text-gray-300">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-sm font-light mb-1 tracking-wide" style={{ color: secondaryColor }}>
                      {member.name}
                    </h4>
                    <p className="text-xs font-light" style={{ color: `${primaryColor}B0` }}>
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Témoignages */}
      {c.testimonials && (
        <section className="py-32 px-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-4xl font-light text-center mb-24 tracking-tight" style={{ color: secondaryColor }}>
              {c.testimonials.title}
            </h3>

            <div className="space-y-8">
              {c.testimonials.items.map((review, idx) => (
                <div key={idx} className="border-l-2 pl-8 py-4" style={{ borderColor: `${primaryColor}20` }}>
                  <p className="text-sm font-light mb-4 text-gray-700 leading-relaxed">
                    {review.text}
                  </p>
                  <p className="text-xs font-light text-gray-500 tracking-wider">
                    {review.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-32 px-8 border-t border-gray-100">
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
        </div>
      </section>
      {/* Founder Section */}
      {organization.founderName && (
        <section id="founder" className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {organization.founderImage && (
                <div className="relative">
                  <img
                    src={organization.founderImage}
                    alt={organization.founderName}
                    className="rounded-3xl w-full h-auto object-cover shadow-2xl"
                  />
                </div>
              )}
              <div className={!organization.founderImage ? 'md:col-span-2 text-center' : ''}>
                <h3 className="text-3xl md:text-4xl font-light tracking-tight text-gray-800 mb-4">
                  {organization.founderName}
                </h3>
                {organization.founderTitle && (
                  <p className="text-lg mb-6" style={{ color: primaryColor }}>
                    {organization.founderTitle}
                  </p>
                )}
                {organization.founderQuote && (
                  <blockquote className="text-xl text-gray-600 italic leading-relaxed">
                    "{organization.founderQuote}"
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </section>
      )}



      {/* Floating Buttons */}
      {organization.phone && (
        <FloatingCallButton phone={organization.phone} primaryColor={primaryColor} />
      )}
      {organization.whatsapp && (
        <FloatingWhatsAppButton whatsapp={organization.whatsapp} />
      )}
      <ScrollToTopButton primaryColor={primaryColor} />

      {/* Footer minimal */}
      <TemplateFooter organization={organization} theme="light" />
    </div>
  );
}
