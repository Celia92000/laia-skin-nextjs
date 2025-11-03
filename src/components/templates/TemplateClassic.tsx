'use client';

import Link from 'next/link';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-96 h-96 -top-48 -right-48 rounded-full blur-3xl animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${organization.primaryColor}33, ${organization.secondaryColor}33)`
            }}
          ></div>
          <div
            className="absolute w-96 h-96 -bottom-48 -left-48 rounded-full blur-3xl animate-pulse delay-700"
            style={{
              background: `linear-gradient(135deg, ${organization.primaryColor}33, ${organization.secondaryColor}33)`
            }}
          ></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair mb-8 animate-fade-in-up leading-tight tracking-normal"
            style={{ color: organization.secondaryColor }}
          >
            {c.hero.title.includes(',') ? (
              <>
                <span className="block font-normal">{c.hero.title.split(',')[0]},</span>
                <span
                  className="block font-semibold mt-1"
                  style={{ color: organization.primaryColor }}
                >
                  {c.hero.title.split(',')[1]?.trim()}
                </span>
              </>
            ) : (
              <span className="block font-semibold">{c.hero.title}</span>
            )}
          </h1>
          <p
            className="font-inter text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 tracking-normal opacity-60"
            style={{ color: organization.secondaryColor }}
          >
            {c.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link
              href="/reservation"
              className="px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-white"
              style={{
                background: `linear-gradient(to right, ${organization.primaryColor}, ${organization.secondaryColor})`
              }}
            >
              {c.hero.ctaPrimary}
            </Link>
            {c.hero.ctaSecondary && (
              <Link
                href="/prestations"
                className="bg-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ color: organization.secondaryColor }}
              >
                {c.hero.ctaSecondary}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-playfair font-normal mb-4 tracking-normal"
              style={{ color: organization.secondaryColor }}
            >
              {c.services.title}
            </h2>
            {c.services.description && (
              <p
                className="font-inter text-base md:text-lg max-w-2xl mx-auto tracking-normal opacity-60"
                style={{ color: organization.secondaryColor }}
              >
                {c.services.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {services.slice(0, 8).map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group block h-full"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 h-full flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[550px]">
                  {/* Image/Header */}
                  <div
                    className="h-48 relative overflow-hidden flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${organization.primaryColor}4D, ${organization.secondaryColor}4D)`
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-20 h-20 opacity-40" style={{ color: organization.primaryColor }} />
                    </div>

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6 text-white w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Découvrir ce soin</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3
                      className="text-2xl font-bold mb-3 group-hover:opacity-80 transition-colors"
                      style={{ color: organization.secondaryColor }}
                    >
                      {service.name}
                    </h3>

                    <p
                      className="mb-4 line-clamp-2 opacity-70"
                      style={{ color: organization.secondaryColor }}
                    >
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="flex items-center gap-2 text-sm opacity-60"
                        style={{ color: organization.secondaryColor }}
                      >
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="border-t pt-4 mt-auto">
                      <div className="flex items-baseline gap-3">
                        <span
                          className="text-3xl font-bold"
                          style={{ color: organization.secondaryColor }}
                        >
                          {service.price}€
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center justify-between">
                      <span
                        className="font-medium group-hover:translate-x-2 transition-transform inline-flex items-center gap-2"
                        style={{ color: organization.primaryColor }}
                      >
                        Voir les détails
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 sm:py-32 md:py-40 relative overflow-hidden">
        {/* Sophisticated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7] via-white to-[#f8f6f0]">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${organization.primaryColor} 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="text-center mb-24">
            <div className="mb-2">
              <span
                className="font-inter text-xs md:text-sm tracking-[0.3em] uppercase font-medium"
                style={{ color: organization.primaryColor }}
              >
                Notre philosophie
              </span>
            </div>
            <h2
              className="font-playfair text-4xl md:text-5xl lg:text-6xl mb-6"
              style={{ color: organization.secondaryColor }}
            >
              <span className="font-light">L'Excellence</span>
              <span
                className="block mt-2 font-normal italic"
                style={{ color: organization.primaryColor }}
              >
                à votre Service
              </span>
            </h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div
                className="w-20 h-[0.5px]"
                style={{ background: `linear-gradient(to right, transparent, ${organization.primaryColor})` }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: organization.primaryColor }}
              ></div>
              <div
                className="w-20 h-[0.5px]"
                style={{ background: `linear-gradient(to left, transparent, ${organization.primaryColor})` }}
              ></div>
            </div>
            <p
              className="font-inter text-lg md:text-xl max-w-3xl mx-auto font-light leading-relaxed tracking-wide opacity-50"
              style={{ color: organization.secondaryColor }}
            >
              Un engagement authentique pour révéler votre beauté naturelle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 lg:gap-20">
            {/* Expertise Card */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700 opacity-10"
                    style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, transparent)` }}
                  ></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div
                      className="absolute inset-0 rounded-full animate-pulse opacity-20"
                      style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                    ></div>
                    <div
                      className="relative w-full h-full rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500"
                      style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                    >
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3
                  className="font-playfair text-2xl md:text-3xl mb-5"
                  style={{ color: organization.secondaryColor }}
                >
                  <span className="font-light">Expertise</span>
                  <span
                    className="block text-lg md:text-xl font-normal italic mt-1"
                    style={{ color: organization.primaryColor }}
                  >
                    Certifiée
                  </span>
                </h3>
                <p
                  className="font-inter leading-relaxed text-sm md:text-base px-6 font-light tracking-wide opacity-60"
                  style={{ color: organization.secondaryColor }}
                >
                  Plus d'une décennie dédiée à l'art de sublimer votre peau avec des techniques d'exception
                </p>
              </div>
            </div>

            {/* Technology Card */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700 opacity-10"
                    style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, transparent)` }}
                  ></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div
                      className="absolute inset-0 rounded-full animate-pulse animation-delay-200 opacity-20"
                      style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                    ></div>
                    <div
                      className="relative w-full h-full rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500"
                      style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                    >
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3
                  className="font-playfair text-2xl md:text-3xl mb-5"
                  style={{ color: organization.secondaryColor }}
                >
                  <span className="font-light">Technologies</span>
                  <span
                    className="block text-lg md:text-xl font-normal italic mt-1"
                    style={{ color: organization.primaryColor }}
                  >
                    Innovantes
                  </span>
                </h3>
                <p
                  className="font-inter leading-relaxed text-sm md:text-base px-6 font-light tracking-wide opacity-60"
                  style={{ color: organization.secondaryColor }}
                >
                  Équipements de pointe minutieusement sélectionnés pour leur efficacité cliniquement prouvée
                </p>
              </div>
            </div>

            {/* Personalized Card */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700 opacity-10"
                    style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, transparent)` }}
                  ></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div
                      className="absolute inset-0 rounded-full animate-pulse animation-delay-400 opacity-20"
                      style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                    ></div>
                    <div
                      className="relative w-full h-full rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500"
                      style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                    >
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3
                  className="font-playfair text-2xl md:text-3xl mb-5"
                  style={{ color: organization.secondaryColor }}
                >
                  <span className="font-light">Approche</span>
                  <span
                    className="block text-lg md:text-xl font-normal italic mt-1"
                    style={{ color: organization.primaryColor }}
                  >
                    Sur-Mesure
                  </span>
                </h3>
                <p
                  className="font-inter leading-relaxed text-sm md:text-base px-6 font-light tracking-wide opacity-60"
                  style={{ color: organization.secondaryColor }}
                >
                  Chaque protocole est méticuleusement conçu pour répondre à vos besoins uniques
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-24 text-white"
        style={{
          background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            {c.cta.title}
          </h2>
          <p className="text-xl mb-12 opacity-95">
            {c.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white"
              style={{ color: organization.secondaryColor }}
            >
              {c.cta.button}
            </Link>
            {c.cta.secondaryButton && (
              <Link
                href="/contact"
                className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white transition-all duration-300"
                style={{
                  ['--hover-color' as any]: organization.secondaryColor
                }}
              >
                {c.cta.secondaryButton}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
