'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { BaseTemplateContent } from '@/types/template-content';
import HeroMedia from './shared/HeroMedia';
import MobileMenu from './shared/MobileMenu';
import FloatingCallButton from './shared/FloatingCallButton';
import FloatingWhatsAppButton from './shared/FloatingWhatsAppButton';
import ScrollToTopButton from './shared/ScrollToTopButton';
import TemplateFooter from './shared/TemplateFooter';
import GallerySection from './shared/GallerySection';
import FAQSection from './shared/FAQSection';

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

    // Gallery & FAQs
    galleryImages?: Array<{
      id: string;
      beforeUrl: string;
      afterUrl: string;
      description?: string;
      treatment?: string;
    }>;
    faqs?: Array<{
      id: string;
      question: string;
      answer: string;
      category?: string;
    }>;
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

export default function TemplateLaia({ organization, services, team, content }: TemplateProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // LAIA rose gold color palette
  const roseGold = '#d4a574';
  const champagne = '#f5e6d3';
  const softPink = '#f7d7d7';
  const bgLight = '#fdfbf7';

  const defaultContent: BaseTemplateContent = {
    hero: {
      badge: 'Institut de Beauté Premium',
      title: 'L\'Excellence au Service de Votre Beauté',
      description: organization.description || 'Révélez votre éclat naturel dans un cadre raffiné et apaisant',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Soins Signature',
      description: 'Des prestations d\'exception pour sublimer votre beauté'
    },
    features: {
      title: 'Pourquoi choisir LAIA ?',
      items: [
        {
          title: 'Excellence & Savoir-Faire',
          description: 'Des professionnels certifiés pour des soins d\'exception',
          icon: 'sparkles'
        },
        {
          title: 'Produits Premium',
          description: 'Une sélection rigoureuse de marques de luxe',
          icon: 'heart'
        },
        {
          title: 'Hygiène Irréprochable',
          description: 'Protocoles stricts pour votre sécurité et votre confort',
          icon: 'shield'
        },
        {
          title: 'Expérience Unique',
          description: 'Un moment de détente dans un cadre raffiné',
          icon: 'star'
        }
      ]
    },
    team: {
      title: 'Notre Équipe',
      description: 'Des expertes passionnées à votre écoute'
    },
    cta: {
      title: 'Offrez-vous un moment d\'exception',
      description: 'Réservez dès maintenant votre expérience beauté',
      button: 'Prendre Rendez-vous',
      note: 'Réponse sous 24h'
    },
    footer: {
      tagline: 'L\'art de sublimer votre beauté naturelle'
    }
  };

  const c = content || defaultContent;

  // Icon mapping for features
  const getFeatureIcon = (iconName?: string) => {
    switch (iconName) {
      case 'sparkles':
        return '✨';
      case 'heart':
        return '💖';
      case 'shield':
        return '🛡️';
      case 'star':
        return '⭐';
      default:
        return '✨';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgLight }}>
      {/* Header - Elegant transparent fixed */}
      <header className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  width={140}
                  height={50}
                  className="h-12 w-auto object-contain"
                  priority
                />
              ) : (
                <h1 className="text-2xl font-serif font-bold tracking-wide" style={{ color: roseGold }}>
                  {organization.name}
                </h1>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#services"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wider transition-colors relative group"
              >
                Soins
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: roseGold }}
                />
              </a>
              {team && team.length > 0 && (
                <a
                  href="#team"
                  className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wider transition-colors relative group"
                >
                  Équipe
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: roseGold }}
                  />
                </a>
              )}
              {organization.founderName && (
                <a
                  href="#founder"
                  className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wider transition-colors relative group"
                >
                  À Propos
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: roseGold }}
                  />
                </a>
              )}
              <a
                href="#contact"
                className="text-gray-700 hover:text-gray-900 font-medium text-sm uppercase tracking-wider transition-colors relative group"
              >
                Contact
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: roseGold }}
                />
              </a>
              <Link
                href="/booking"
                className="px-6 py-3 rounded-full font-semibold text-white text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${roseGold}, ${champagne})`
                }}
              >
                {c.hero.ctaPrimary}
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-gray-700 rounded"></span>
                <span className="w-full h-0.5 bg-gray-700 rounded"></span>
                <span className="w-full h-0.5 bg-gray-700 rounded"></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        organization={organization}
        bookingLabel={c.hero.ctaPrimary}
      />

      {/* Hero Section - Full screen elegant */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Media */}
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

        {/* Elegant pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${roseGold} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          {/* Badge */}
          {c.hero.badge && (
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full backdrop-blur-sm bg-white/70 border border-gray-200/50 mb-8 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: roseGold }}>
                {c.hero.badge}
              </span>
            </div>
          )}

          {/* Title - Elegant serif font */}
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight tracking-tight text-gray-900">
            {c.hero.title}
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            {c.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/booking"
              className="group px-8 py-4 rounded-full font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-lg"
              style={{
                background: `linear-gradient(135deg, ${roseGold}, ${champagne})`
              }}
            >
              <span className="flex items-center gap-2">
                {c.hero.ctaPrimary}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>

            {c.hero.ctaSecondary && (
              <a
                href="#services"
                className="px-8 py-4 rounded-full font-semibold border-2 backdrop-blur-sm bg-white/70 hover:bg-white/90 transition-all text-lg"
                style={{
                  borderColor: roseGold,
                  color: roseGold
                }}
              >
                {c.hero.ctaSecondary}
              </a>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2" style={{ borderColor: roseGold }}>
              <div className="w-1 h-2 rounded-full animate-pulse" style={{ backgroundColor: roseGold }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Why Choose LAIA */}
      {c.features && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" style={{ color: roseGold }}>
                {c.features.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {c.features.items.map((feature, idx) => (
                <div
                  key={idx}
                  className="group text-center p-8 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  {/* Icon with rose gold background */}
                  <div
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${champagne}, ${softPink})`
                    }}
                  >
                    {getFeatureIcon(feature.icon)}
                  </div>

                  <h3 className="text-xl font-serif font-bold mb-3 text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </section>
      )}

      {/* Services Section - Elegant cards */}
      <section id="services" className="py-24 px-6" style={{ backgroundColor: bgLight }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" style={{ color: roseGold }}>
              {c.services.title}
            </h2>
            {c.services.description && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {c.services.description}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, idx) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-current"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                  borderColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = roseGold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Service Icon/Decoration */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${champagne}, ${softPink})`
                  }}
                >
                  <span className="text-2xl">💆‍♀️</span>
                </div>

                <h3 className="text-2xl font-serif font-bold mb-4 text-gray-900 group-hover:scale-105 transition-transform">
                  {service.name}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed min-h-[60px]">
                  {service.description || 'Offrez-vous un moment de détente et de bien-être absolu'}
                </p>

                {/* Price & Duration */}
                <div className="flex items-end justify-between mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <div className="text-3xl font-bold mb-1" style={{ color: roseGold }}>
                      {service.price}€
                    </div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider">
                      {service.duration} min
                    </div>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${roseGold}, ${champagne})`
                    }}
                  >
                    →
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/booking?service=${service.id}`}
                  className="block w-full py-4 rounded-full font-semibold text-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${roseGold}, ${champagne})`
                  }}
                >
                  Découvrir
                </Link>
              </div>
            ))}
          </div>

          {/* View All Services */}
          {services.length > 6 && (
            <div className="text-center mt-12">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold border-2 hover:bg-white transition-all"
                style={{
                  borderColor: roseGold,
                  color: roseGold
                }}
              >
                Voir tous nos soins
                <span>→</span>
              </Link>
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Founder Section - Elegant split layout */}
      {organization.founderName && (
        <section id="founder" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Photo */}
              {organization.founderImage && (
                <div className="relative group order-2 md:order-1">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <Image
                      src={organization.founderImage}
                      alt={organization.founderName}
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover"
                    />
                    {/* Rose gold border effect on hover */}
                    <div
                      className="absolute inset-0 border-4 border-transparent group-hover:border-current transition-all duration-500 rounded-3xl pointer-events-none"
                      style={{ borderColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = roseGold;
                      }}
                    />
                  </div>
                  {/* Decorative element */}
                  <div
                    className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-3xl opacity-30"
                    style={{ backgroundColor: roseGold }}
                  />
                </div>
              )}

              {/* Quote & Content */}
              <div className={`order-1 md:order-2 ${organization.founderImage ? '' : 'md:col-span-2 text-center max-w-4xl mx-auto'}`}>
                <div className="mb-6">
                  <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: roseGold }}>
                    {organization.founderTitle || 'Fondatrice'}
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-gray-900">
                  {organization.founderName}
                </h2>

                {organization.founderQuote && (
                  <blockquote className="relative">
                    {/* Large opening quote */}
                    <div
                      className="absolute -top-8 -left-4 text-8xl font-serif opacity-20 leading-none"
                      style={{ color: roseGold }}
                    >
                      "
                    </div>

                    <p className="text-2xl md:text-3xl font-serif italic text-gray-700 leading-relaxed mb-6 relative z-10">
                      {organization.founderQuote}
                    </p>

                    {/* Large closing quote */}
                    <div
                      className="absolute -bottom-4 right-0 text-8xl font-serif opacity-20 leading-none"
                      style={{ color: roseGold }}
                    >
                      "
                    </div>
                  </blockquote>
                )}

                {/* Decorative line */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div
                    className="w-20 h-1 rounded-full"
                    style={{ background: `linear-gradient(to right, ${roseGold}, ${champagne})` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Section - Elegant cards */}
      {team && team.length > 0 && (
        <section id="team" className="py-24 px-6" style={{ backgroundColor: bgLight }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" style={{ color: roseGold }}>
                {c.team?.title || 'Notre Équipe'}
              </h2>
              {c.team?.description && (
                <p className="text-xl text-gray-600">
                  {c.team.description}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.slice(0, 4).map((member, idx) => (
                <div
                  key={member.id}
                  className="group text-center"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  {/* Photo - Circular with rose gold border on hover */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <div
                      className="absolute inset-0 rounded-full transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${champagne}, ${softPink})`,
                        boxShadow: `0 0 0 4px transparent`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 4px ${roseGold}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 4px transparent`;
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-5xl font-serif font-bold opacity-40">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                      style={{ backgroundColor: roseGold }}
                    />
                  </div>

                  <h3 className="text-xl font-serif font-bold mb-2 text-gray-900">
                    {member.name}
                  </h3>

                  <div
                    className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-white mb-3"
                    style={{ backgroundColor: roseGold }}
                  >
                    {member.role}
                  </div>

                  <p className="text-gray-600 text-sm">
                    Experte certifiée avec passion pour votre bien-être
                  </p>
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </section>
      )}

      {/* Gallery Section */}
      {organization.galleryImages && organization.galleryImages.length > 0 && (
        <GallerySection
          title="Nos Réalisations"
          description="Découvrez les résultats exceptionnels de nos soins"
          images={organization.galleryImages}
          primaryColor={roseGold}
          secondaryColor={champagne}
        />
      )}

      {/* FAQ Section */}
      {organization.faqs && organization.faqs.length > 0 && (
        <FAQSection
          title="Questions Fréquentes"
          description="Tout ce que vous devez savoir sur nos soins et services"
          faqs={organization.faqs}
          primaryColor={roseGold}
        />
      )}

      {/* CTA Section - Elegant centered */}
      <section id="contact" className="py-32 px-6 relative overflow-hidden bg-white">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, ${roseGold}, ${champagne}, transparent)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-gray-900">
            {c.cta.title}
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            {c.cta.description}
          </p>

          <Link
            href="/booking"
            className="inline-flex items-center gap-3 px-12 py-5 rounded-full font-semibold text-white text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 mb-6"
            style={{
              background: `linear-gradient(135deg, ${roseGold}, ${champagne})`
            }}
          >
            {c.cta.button}
            <span className="text-2xl">→</span>
          </Link>

          {c.cta.note && (
            <p className="text-sm text-gray-500 mb-16">
              {c.cta.note}
            </p>
          )}

          {/* Contact Info Grid */}
          <div className="grid md:grid-cols-3 gap-12 pt-16 border-t border-gray-200">
            {/* Address */}
            {(organization.address || organization.city) && (
              <div>
                <div className="text-4xl mb-4">📍</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                  Adresse
                </div>
                <div className="text-gray-700">
                  {organization.address && <div>{organization.address}</div>}
                  {(organization.postalCode || organization.city) && (
                    <div>{organization.postalCode} {organization.city}</div>
                  )}
                  {organization.googleMapsUrl && (
                    <a
                      href={organization.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm mt-2 font-semibold hover:underline"
                      style={{ color: roseGold }}
                    >
                      Voir sur Maps →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Phone */}
            {organization.phone && (
              <div>
                <div className="text-4xl mb-4">📞</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                  Téléphone
                </div>
                <a
                  href={`tel:${organization.phone}`}
                  className="text-gray-700 font-semibold hover:underline"
                  style={{ color: roseGold }}
                >
                  {organization.phone}
                </a>
              </div>
            )}

            {/* Business Hours */}
            {organization.businessHours && (
              <div>
                <div className="text-4xl mb-4">⏰</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-semibold">
                  Horaires
                </div>
                <div className="text-gray-700 text-sm">
                  {Object.entries(organization.businessHours).slice(0, 2).map(([day, hours]) => (
                    <div key={day}>{hours as string}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <TemplateFooter
        organization={organization}
        theme="light"
        tagline={c.footer.tagline}
      />

      {/* Floating Buttons */}
      {organization.phone && (
        <FloatingCallButton phoneNumber={organization.phone} />
      )}
      {organization.whatsapp && (
        <FloatingWhatsAppButton phoneNumber={organization.whatsapp} />
      )}
      <ScrollToTopButton />
    </div>
  );
}
