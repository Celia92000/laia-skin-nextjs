'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
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

export default function TemplateClassic({ organization, services, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Une peau respectée, une beauté révélée',
      description: organization.description || 'Institut spécialisé dans les techniques esthétiques avancées',
      ctaPrimary: 'Réserver un Soin',
      ctaSecondary: 'Découvrir nos Soins'
    },
    services: {
      title: 'Mes Prestations',
      description: 'Des soins personnalisés pour sublimer votre beauté naturelle'
    },
    cta: {
      title: 'Prête à vous offrir un moment de détente ?',
      description: 'Réservez dès maintenant votre prochain soin',
      button: 'Prendre Rendez-vous'
    },
    footer: {
      tagline: 'Votre beauté, notre passion'
    }
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Header with Mobile Menu */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          {organization.logoUrl ? (
            <Image src={organization.logoUrl} alt={organization.name} width={120} height={48} className="h-12 w-auto" priority />
          ) : (
            <h1 className="text-2xl font-bold" style={{ color: organization.primaryColor }}>
              {organization.name}
            </h1>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="hover:opacity-70 transition-opacity" style={{ color: organization.secondaryColor }}>
              Services
            </a>
            <a href="#about" className="hover:opacity-70 transition-opacity" style={{ color: organization.secondaryColor }}>
              À propos
            </a>
            <a href="#contact" className="hover:opacity-70 transition-opacity" style={{ color: organization.secondaryColor }}>
              Contact
            </a>
            <Link
              href="/reservation"
              className="px-6 py-2 rounded-full text-white font-semibold hover:shadow-lg transition-all"
              style={{ background: `linear-gradient(to right, ${organization.primaryColor}, ${organization.secondaryColor})` }}
            >
              Réserver
            </Link>
          </nav>

          {/* Mobile Menu */}
          <MobileMenu
            organization={organization}
            menuItems={[
              { label: 'Services', href: '#services' },
              { label: 'À propos', href: '#about' },
              { label: 'Contact', href: '#contact' }
            ]}
            ctaLabel="Réserver"
            ctaHref="/reservation"
            theme="light"
          />
        </div>
      </header>

      {/* Hero Section - Side-by-side Asymmetric */}
      <section className="pt-20 sm:pt-24 min-h-screen relative overflow-hidden">
        {/* Background media (video or image) */}
        {(organization.heroVideo || organization.heroImage) && (
          <HeroMedia
            videoUrl={organization.heroVideo}
            imageUrl={organization.heroImage}
            alt={`${organization.name} hero`}
            priority
            overlay
            overlayOpacity={0.5}
          />
        )}

        {/* Vintage Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, ${organization.primaryColor}22 0px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, ${organization.primaryColor}22 0px, transparent 1px, transparent 20px)`,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center min-h-[calc(100vh-8rem)]">
            {/* Left Side - 60% - Title with decorative borders */}
            <div className="md:col-span-3 space-y-8">
              {/* Ornamental Top Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor }}></div>
              </div>

              {/* Large Title */}
              <div>
                <h1
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair leading-tight tracking-wide"
                  style={{ color: organization.secondaryColor }}
                >
                  {c.hero.title.includes(',') ? (
                    <>
                      <span className="block font-light mb-4" style={{ letterSpacing: '0.02em' }}>
                        {c.hero.title.split(',')[0]},
                      </span>
                      <span
                        className="block font-normal italic"
                        style={{ color: organization.primaryColor, letterSpacing: '0.03em' }}
                      >
                        {c.hero.title.split(',')[1]?.trim()}
                      </span>
                    </>
                  ) : (
                    <span className="block font-normal">{c.hero.title}</span>
                  )}
                </h1>
              </div>

              {/* Ornamental Bottom Divider with Center Ornament */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                </div>
                <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor }}></div>
              </div>

              {/* Description with Drop Cap */}
              <div className="max-w-2xl">
                <p
                  className="font-inter text-lg md:text-xl leading-relaxed tracking-wide"
                  style={{ color: organization.secondaryColor }}
                >
                  <span
                    className="float-left text-6xl md:text-7xl font-playfair leading-none pr-3 pt-1"
                    style={{ color: organization.primaryColor }}
                  >
                    {c.hero.description.charAt(0)}
                  </span>
                  {c.hero.description.slice(1)}
                </p>
              </div>
            </div>

            {/* Right Side - 40% - Feature Cards Stacked */}
            <div className="md:col-span-2 space-y-6">
              {/* Feature Card 1 - Vintage Badge Style */}
              <div
                className="relative p-8 backdrop-blur-sm border-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: organization.primaryColor,
                }}
              >
                {/* Corner Ornaments */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: organization.primaryColor }}></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: organization.primaryColor }}></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: organization.primaryColor }}></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: organization.primaryColor }}></div>

                <div className="text-center">
                  <div
                    className="text-xs uppercase tracking-[0.3em] font-semibold mb-3"
                    style={{ color: organization.primaryColor }}
                  >
                    Excellence
                  </div>
                  <div className="text-4xl font-playfair mb-2" style={{ color: organization.secondaryColor }}>
                    +10 Ans
                  </div>
                  <div className="text-sm opacity-70" style={{ color: organization.secondaryColor }}>
                    D'expertise certifiée
                  </div>
                </div>
              </div>

              {/* Feature Card 2 - Vintage Badge Style */}
              <div
                className="relative p-8 backdrop-blur-sm border-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: organization.primaryColor,
                }}
              >
                {/* Corner Ornaments */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: organization.primaryColor }}></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: organization.primaryColor }}></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: organization.primaryColor }}></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: organization.primaryColor }}></div>

                <div className="text-center">
                  <div
                    className="text-xs uppercase tracking-[0.3em] font-semibold mb-3"
                    style={{ color: organization.primaryColor }}
                  >
                    Innovation
                  </div>
                  <div className="text-4xl font-playfair mb-2" style={{ color: organization.secondaryColor }}>
                    Technologies
                  </div>
                  <div className="text-sm opacity-70" style={{ color: organization.secondaryColor }}>
                    De pointe sélectionnées
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4 pt-4">
                <Link
                  href="/reservation"
                  className="block w-full py-4 text-center text-white font-semibold text-lg tracking-wide border-2 border-transparent hover:shadow-xl transition-all duration-300"
                  style={{
                    backgroundColor: organization.primaryColor,
                    borderColor: organization.primaryColor,
                  }}
                >
                  {c.hero.ctaPrimary}
                </Link>
                {c.hero.ctaSecondary && (
                  <Link
                    href="/prestations"
                    className="block w-full py-4 text-center font-semibold text-lg tracking-wide bg-white border-2 hover:bg-opacity-90 transition-all duration-300"
                    style={{
                      color: organization.secondaryColor,
                      borderColor: organization.primaryColor,
                    }}
                  >
                    {c.hero.ctaSecondary}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - 2-Column Asymmetric Alternating Grid */}
      <section id="services" className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] relative overflow-hidden">
        {/* Vintage Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${organization.primaryColor}22 0px, transparent 1px, transparent 40px)`,
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Ornamental Dividers */}
          <div className="text-center mb-20">
            {/* Top Ornament */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-24" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
              </div>
              <div className="h-px w-24" style={{ backgroundColor: organization.primaryColor }}></div>
            </div>

            <h2
              className="text-5xl md:text-6xl lg:text-7xl font-playfair font-light mb-4 tracking-wide"
              style={{ color: organization.secondaryColor }}
            >
              {c.services.title}
            </h2>
            {c.services.description && (
              <p
                className="font-inter text-lg md:text-xl max-w-2xl mx-auto leading-relaxed tracking-wide opacity-70"
                style={{ color: organization.secondaryColor }}
              >
                {c.services.description}
              </p>
            )}

            {/* Bottom Ornament */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="h-px w-24" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="h-px w-24" style={{ backgroundColor: organization.primaryColor }}></div>
            </div>
          </div>

          {/* Asymmetric 2-Column Grid - Alternating Large/Small */}
          <div className="space-y-12">
            {services.slice(0, 8).map((service, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={service.id}
                  className={`grid md:grid-cols-3 gap-8 items-center ${
                    isEven ? '' : 'md:grid-flow-dense'
                  }`}
                >
                  {/* Large Card - Alternates between left and right */}
                  <Link
                    href={`/services/${service.id}`}
                    className={`group md:col-span-2 ${isEven ? '' : 'md:col-start-2'}`}
                  >
                    <div className="relative bg-white border-4 border-double p-8 md:p-12 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2" style={{ borderColor: organization.primaryColor }}>
                      {/* Corner Ornaments - Classic Style */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>

                      {/* Content */}
                      <div className="space-y-6">
                        {/* Service Name with Drop Cap */}
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-playfair leading-tight" style={{ color: organization.secondaryColor }}>
                          <span
                            className="float-left text-6xl md:text-7xl font-playfair leading-none pr-4 pt-1"
                            style={{ color: organization.primaryColor }}
                          >
                            {service.name.charAt(0)}
                          </span>
                          {service.name.slice(1)}
                        </h3>

                        {/* Decorative Divider */}
                        <div className="flex items-center gap-3 my-6">
                          <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor, opacity: 0.3 }}></div>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                          <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor, opacity: 0.3 }}></div>
                        </div>

                        {/* Description */}
                        <p
                          className="text-base md:text-lg leading-relaxed tracking-wide opacity-80"
                          style={{ color: organization.secondaryColor }}
                        >
                          {service.description}
                        </p>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em]" style={{ color: organization.primaryColor }}>
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} minutes</span>
                        </div>

                        {/* Price - Large Serif */}
                        <div className="flex items-baseline gap-4 pt-6 border-t-2" style={{ borderColor: organization.primaryColor, opacity: 0.3 }}>
                          <span className="text-6xl md:text-7xl font-playfair" style={{ color: organization.secondaryColor }}>
                            {service.price}
                          </span>
                          <span className="text-2xl font-playfair opacity-70" style={{ color: organization.secondaryColor }}>
                            euros
                          </span>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] font-semibold group-hover:translate-x-2 transition-transform" style={{ color: organization.primaryColor }}>
                          <span>Découvrir</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Small Card - Vintage Badge Style */}
                  <div
                    className={`${isEven ? 'md:col-start-3' : 'md:col-start-1'}`}
                  >
                    <div
                      className="relative bg-white border-2 p-8 text-center"
                      style={{
                        borderColor: organization.primaryColor,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      }}
                    >
                      {/* Corner Ornaments */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: organization.primaryColor }}></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: organization.primaryColor }}></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: organization.primaryColor }}></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: organization.primaryColor }}></div>

                      <div className="space-y-4">
                        {/* Icon/Decorative Element */}
                        <div className="flex justify-center">
                          <Sparkles className="w-16 h-16 opacity-30" style={{ color: organization.primaryColor }} />
                        </div>

                        {/* Label */}
                        <div
                          className="text-xs uppercase tracking-[0.3em] font-semibold"
                          style={{ color: organization.primaryColor }}
                        >
                          Soin Premium
                        </div>

                        {/* Decorative Divider */}
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-px w-8" style={{ backgroundColor: organization.primaryColor }}></div>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                          <div className="h-px w-8" style={{ backgroundColor: organization.primaryColor }}></div>
                        </div>

                        {/* Info */}
                        <div className="space-y-2">
                          <div className="text-2xl font-playfair" style={{ color: organization.secondaryColor }}>
                            {service.duration} min
                          </div>
                          <div className="text-sm opacity-70" style={{ color: organization.secondaryColor }}>
                            Durée du soin
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Section Divider */}
          <div className="flex items-center justify-center gap-4 mt-20">
            <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
            </div>
            <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
          </div>
        </div>
      </section>

      {/* Features Section - Vintage Magazine Style */}
      <section id="about" className="py-28 sm:py-32 md:py-40 relative overflow-hidden bg-white">
        {/* Vintage Dot Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${organization.primaryColor} 1.5px, transparent 1.5px)`,
              backgroundSize: '40px 40px'
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section with Ornamental Borders */}
          <div className="text-center mb-24">
            {/* Top Ornamental Border */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-3 h-3 rotate-45 border-2" style={{ borderColor: organization.primaryColor }}></div>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
              </div>
              <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
            </div>

            <div className="mb-4">
              <span
                className="font-inter text-xs md:text-sm tracking-[0.35em] uppercase font-bold"
                style={{ color: organization.primaryColor }}
              >
                Notre Philosophie
              </span>
            </div>
            <h2
              className="font-playfair text-5xl md:text-6xl lg:text-7xl mb-6 tracking-wide"
              style={{ color: organization.secondaryColor }}
            >
              <span className="font-light block">L'Excellence</span>
              <span
                className="block mt-2 font-normal italic"
                style={{ color: organization.primaryColor }}
              >
                à votre Service
              </span>
            </h2>

            {/* Ornamental Divider */}
            <div className="flex items-center justify-center gap-4 my-8">
              <div className="h-px w-24" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
              </div>
              <div className="h-px w-24" style={{ backgroundColor: organization.primaryColor }}></div>
            </div>

            <p
              className="font-inter text-lg md:text-xl max-w-3xl mx-auto leading-relaxed tracking-wide opacity-70"
              style={{ color: organization.secondaryColor }}
            >
              Un engagement authentique pour révéler votre beauté naturelle
            </p>

            {/* Bottom Ornamental Border */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {/* Expertise Card - Vintage Badge Style */}
            <div className="group">
              <div className="text-center">
                {/* Vintage Badge Container */}
                <div className="relative mb-10 mx-auto w-48 h-48 flex items-center justify-center">
                  {/* Outer Border Frame */}
                  <div className="absolute inset-0 border-4 border-double rotate-0 group-hover:rotate-6 transition-transform duration-500" style={{ borderColor: organization.primaryColor }}></div>
                  <div className="absolute inset-2 border-2" style={{ borderColor: organization.primaryColor, opacity: 0.5 }}></div>

                  {/* Inner Content */}
                  <div className="relative z-10">
                    <div className="text-6xl font-playfair mb-2" style={{ color: organization.primaryColor }}>10+</div>
                    <div className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: organization.secondaryColor }}>Années</div>
                  </div>

                  {/* Corner Ornaments */}
                  <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                </div>

                {/* Ornamental Divider */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                </div>

                <h3
                  className="font-playfair text-3xl md:text-4xl mb-2 tracking-wide"
                  style={{ color: organization.secondaryColor }}
                >
                  <span className="font-light">Expertise</span>
                </h3>
                <div
                  className="text-sm uppercase tracking-[0.3em] font-bold mb-6"
                  style={{ color: organization.primaryColor }}
                >
                  Certifiée
                </div>
                <p
                  className="font-inter leading-relaxed text-base px-6 tracking-wide opacity-70"
                  style={{ color: organization.secondaryColor }}
                >
                  Plus d'une décennie dédiée à l'art de sublimer votre peau avec des techniques d'exception
                </p>
              </div>
            </div>

            {/* Technology Card - Vintage Badge Style */}
            <div className="group">
              <div className="text-center">
                {/* Vintage Badge Container */}
                <div className="relative mb-10 mx-auto w-48 h-48 flex items-center justify-center">
                  {/* Outer Border Frame */}
                  <div className="absolute inset-0 border-4 border-double rotate-0 group-hover:rotate-6 transition-transform duration-500" style={{ borderColor: organization.primaryColor }}></div>
                  <div className="absolute inset-2 border-2" style={{ borderColor: organization.primaryColor, opacity: 0.5 }}></div>

                  {/* Inner Content with Icon */}
                  <div className="relative z-10">
                    <svg className="w-16 h-16 mx-auto mb-2" style={{ color: organization.primaryColor }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: organization.secondaryColor }}>Innovation</div>
                  </div>

                  {/* Corner Ornaments */}
                  <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                </div>

                {/* Ornamental Divider */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                </div>

                <h3
                  className="font-playfair text-3xl md:text-4xl mb-2 tracking-wide"
                  style={{ color: organization.secondaryColor }}
                >
                  <span className="font-light">Technologies</span>
                </h3>
                <div
                  className="text-sm uppercase tracking-[0.3em] font-bold mb-6"
                  style={{ color: organization.primaryColor }}
                >
                  Innovantes
                </div>
                <p
                  className="font-inter leading-relaxed text-base px-6 tracking-wide opacity-70"
                  style={{ color: organization.secondaryColor }}
                >
                  Équipements de pointe minutieusement sélectionnés pour leur efficacité cliniquement prouvée
                </p>
              </div>
            </div>

            {/* Personalized Card - Vintage Badge Style */}
            <div className="group">
              <div className="text-center">
                {/* Vintage Badge Container */}
                <div className="relative mb-10 mx-auto w-48 h-48 flex items-center justify-center">
                  {/* Outer Border Frame */}
                  <div className="absolute inset-0 border-4 border-double rotate-0 group-hover:rotate-6 transition-transform duration-500" style={{ borderColor: organization.primaryColor }}></div>
                  <div className="absolute inset-2 border-2" style={{ borderColor: organization.primaryColor, opacity: 0.5 }}></div>

                  {/* Inner Content with Icon */}
                  <div className="relative z-10">
                    <svg className="w-16 h-16 mx-auto mb-2" style={{ color: organization.primaryColor }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: organization.secondaryColor }}>Sur-Mesure</div>
                  </div>

                  {/* Corner Ornaments */}
                  <div className="absolute -top-2 -left-2 w-5 h-5 border-t-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 border-t-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 border-b-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                </div>

                {/* Ornamental Divider */}
                <div className="flex items-center justify-center gap-2 mb-5">
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                </div>

                <h3
                  className="font-playfair text-3xl md:text-4xl mb-2 tracking-wide"
                  style={{ color: organization.secondaryColor }}
                >
                  <span className="font-light">Approche</span>
                </h3>
                <div
                  className="text-sm uppercase tracking-[0.3em] font-bold mb-6"
                  style={{ color: organization.primaryColor }}
                >
                  Personnalisée
                </div>
                <p
                  className="font-inter leading-relaxed text-base px-6 tracking-wide opacity-70"
                  style={{ color: organization.secondaryColor }}
                >
                  Chaque protocole est méticuleusement conçu pour répondre à vos besoins uniques
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section - Vintage Style */}
      {organization.founderName && (
        <section className="py-20 px-6 bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
          <div className="max-w-6xl mx-auto">
            {/* Ornamental Top Border */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: organization.primaryColor }}></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
              </div>
              <div className="h-px flex-1 max-w-xs" style={{ backgroundColor: organization.primaryColor }}></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {organization.founderImage && (
                <div className="relative group">
                  {/* Decorative Frame Border */}
                  <div className="absolute -inset-4 border-4 border-double" style={{ borderColor: organization.primaryColor }}></div>
                  <div className="absolute -inset-1 border-2" style={{ borderColor: organization.primaryColor, opacity: 0.3 }}></div>

                  {/* Corner Ornaments */}
                  <div className="absolute -top-6 -left-6 w-6 h-6 border-t-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -top-6 -right-6 w-6 h-6 border-t-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-6 -left-6 w-6 h-6 border-b-4 border-l-4" style={{ borderColor: organization.secondaryColor }}></div>
                  <div className="absolute -bottom-6 -right-6 w-6 h-6 border-b-4 border-r-4" style={{ borderColor: organization.secondaryColor }}></div>

                  <Image
                    src={organization.founderImage}
                    alt={organization.founderName}
                    width={600}
                    height={800}
                    className="relative w-full h-auto object-cover sepia-[0.15]"
                  />
                </div>
              )}
              <div className={organization.founderImage ? '' : 'md:col-span-2 text-center'}>
                <div className="text-xs uppercase tracking-[0.3em] font-bold mb-4" style={{ color: organization.primaryColor }}>
                  Fondatrice
                </div>

                {/* Ornamental Divider */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor, opacity: 0.3 }}></div>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-light mb-4 tracking-wide" style={{ color: organization.secondaryColor }}>
                  {organization.founderName}
                </h2>
                {organization.founderTitle && (
                  <p className="text-xl mb-8 italic tracking-wide" style={{ color: organization.primaryColor }}>
                    {organization.founderTitle}
                  </p>
                )}
                {organization.founderQuote && (
                  <blockquote className="relative">
                    {/* Opening Quote Mark */}
                    <span className="absolute -top-4 -left-2 text-6xl font-playfair opacity-20" style={{ color: organization.primaryColor }}>"</span>
                    <p className="text-xl md:text-2xl font-playfair italic leading-relaxed tracking-wide pl-8" style={{ color: organization.secondaryColor }}>
                      {organization.founderQuote}
                    </p>
                    {/* Closing Quote Mark */}
                    <span className="absolute -bottom-8 right-0 text-6xl font-playfair opacity-20" style={{ color: organization.primaryColor }}>"</span>
                  </blockquote>
                )}

                {/* Bottom Ornamental Divider */}
                <div className="flex items-center gap-2 mt-8">
                  <div className="h-px flex-1" style={{ backgroundColor: organization.primaryColor, opacity: 0.3 }}></div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: organization.primaryColor }}></div>
                  <div className="h-px w-12" style={{ backgroundColor: organization.primaryColor }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Vintage Luxury Style */}
      <section
        id="contact"
        className="py-24 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
        }}
      >
        {/* Vintage Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, #ffffff22 0px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, #ffffff22 0px, transparent 1px, transparent 30px)`,
            }}
          ></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4">
          {/* Top Ornamental Border */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px flex-1 max-w-xs bg-white opacity-50"></div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-3 h-3 rotate-45 border-2 border-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div className="h-px flex-1 max-w-xs bg-white opacity-50"></div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-light mb-6 text-white tracking-wide">
            {c.cta.title}
          </h2>

          {/* Ornamental Divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-24 bg-white opacity-70"></div>
            <div className="w-2 h-2 rotate-45 bg-white"></div>
            <div className="h-px w-24 bg-white opacity-70"></div>
          </div>

          <p className="text-xl mb-12 text-white opacity-90 leading-relaxed tracking-wide">
            {c.cta.description}
          </p>

          {/* CTA Buttons - Vintage Style */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/reservation"
              className="relative group"
            >
              {/* Button Border Frame */}
              <div className="absolute -inset-1 border-2 border-white group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative px-12 py-4 bg-white font-semibold text-lg tracking-wide hover:shadow-2xl transition-all duration-300"
                style={{ color: organization.secondaryColor }}
              >
                {c.cta.button}
              </div>
            </Link>
            {c.cta.secondaryButton && (
              <Link
                href="/contact"
                className="relative group"
              >
                {/* Button Border Frame */}
                <div className="absolute -inset-1 border-2 border-white group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative px-12 py-4 bg-transparent border-2 border-white text-white font-semibold text-lg tracking-wide hover:bg-white transition-all duration-300"
                  style={{
                    ['--hover-color' as any]: organization.secondaryColor
                  }}
                >
                  {c.cta.secondaryButton}
                </div>
              </Link>
            )}
          </div>

          {/* Bottom Ornamental Border */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="h-px flex-1 max-w-xs bg-white opacity-50"></div>
            <div className="w-2 h-2 rotate-45 bg-white"></div>
            <div className="h-px flex-1 max-w-xs bg-white opacity-50"></div>
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
