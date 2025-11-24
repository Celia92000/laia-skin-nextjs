'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseTemplateContent } from '@/types/template-content';
import MobileMenu from './shared/MobileMenu';
import FloatingCallButton from './shared/FloatingCallButton';
import FloatingWhatsAppButton from './shared/FloatingWhatsAppButton';
import ScrollToTopButton from './shared/ScrollToTopButton';
import TemplateFooter from './shared/TemplateFooter';
import HeroMedia from './shared/HeroMedia';

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
            {organization.logoUrl ? (
              <Image src={organization.logoUrl} alt={organization.name} width={120} height={40} className="h-10 w-auto" priority />
            ) : (
              <h1 className="text-lg font-light tracking-[0.3em] text-gray-900">
                {organization.name.toUpperCase()}
              </h1>
            )}
            <nav className="hidden md:flex gap-16 items-center">
              <a href="#services" className="text-xs text-gray-600 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">Services</a>
              <a href="#equipe" className="text-xs text-gray-600 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">Équipe</a>
              <a href="#contact" className="text-xs text-gray-600 hover:text-gray-900 tracking-[0.2em] uppercase font-light transition-colors">Contact</a>
            </nav>

            {/* Mobile Menu */}
            <MobileMenu
              organization={organization}
              menuItems={[
                { label: 'Services', href: '#services' },
                { label: 'Équipe', href: '#equipe' },
                { label: 'Contact', href: '#contact' }
              ]}
              ctaLabel="Réserver"
              ctaHref="/booking"
              theme="light"
            />
          </div>
        </div>
      </header>

      {/* Hero - Typographie géante éditorial */}
      <section className="pt-48 pb-40 px-8 relative overflow-hidden">
        {/* Background media (video or image) */}
        {(organization.heroVideo || organization.heroImage) && (
          <HeroMedia
            videoUrl={organization.heroVideo}
            imageUrl={organization.heroImage}
            alt={`${organization.name} hero`}
            priority
            overlay
            overlayOpacity={0.3}
          />
        )}

        <div className="max-w-5xl mx-auto relative z-10">
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

      {/* Founder Section */}
      {organization.founderName && (
        <section className="px-8 py-40">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              {organization.founderImage && (
                <div className="aspect-[3/4] relative overflow-hidden">
                  <Image
                    src={organization.founderImage}
                    alt={organization.founderName}
                    width={600}
                    height={800}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={organization.founderImage ? '' : 'md:col-span-2 text-center'}>
                <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-8">
                  Fondatrice
                </p>
                <h2 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
                  {organization.founderName}
                </h2>
                {organization.founderTitle && (
                  <p className="text-xl text-gray-600 mb-8 font-light">
                    {organization.founderTitle}
                  </p>
                )}
                {organization.founderQuote && (
                  <blockquote className="text-2xl italic text-gray-700 leading-relaxed font-light">
                    "{organization.founderQuote}"
                  </blockquote>
                )}
              </div>
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
                {organization.address && (
                  <div>
                    <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-light">
                      Adresse
                    </h4>
                    <p className="text-xl text-gray-900 font-light leading-relaxed">
                      {organization.address}<br />
                      {organization.postalCode} {organization.city}
                      {organization.country && `, ${organization.country}`}
                    </p>
                  </div>
                )}

                {organization.phone && (
                  <div>
                    <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-light">
                      Téléphone
                    </h4>
                    <p className="text-xl text-gray-900 font-light">
                      {organization.phone}
                    </p>
                  </div>
                )}

                {(organization.email || organization.contactEmail) && (
                  <div>
                    <h4 className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 font-light">
                      Email
                    </h4>
                    <p className="text-xl text-gray-900 font-light">
                      {organization.contactEmail || organization.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Horaires + CTA */}
            <div>
              {organization.businessHours && (
                <>
                  <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-12">
                    Horaires
                  </p>

                  <div className="space-y-6 mb-16">
                    {Object.entries(organization.businessHours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex justify-between items-baseline border-b border-gray-200 pb-4">
                        <span className="text-gray-600 font-light capitalize">{day}</span>
                        <span className="text-gray-900 font-light">
                          {hours.closed ? 'Fermé' : `${hours.open} – ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

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

      {/* Footer */}
      <TemplateFooter
        organization={organization}
        theme="light"
      />

      {/* Floating Action Buttons */}
      {organization.phone && (
        <FloatingCallButton
          phone={organization.phone}
          primaryColor={organization.primaryColor}
        />
      )}

      {organization.whatsapp && (
        <FloatingWhatsAppButton
          whatsapp={organization.whatsapp}
          message="Bonjour, je souhaite prendre rendez-vous"
        />
      )}

      <ScrollToTopButton
        primaryColor={organization.primaryColor}
      />
    </div>
  );
}
