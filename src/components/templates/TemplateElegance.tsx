'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseTemplateContent } from '@/types/template-content';
import { Sparkles, Clock, ArrowRight, Heart, Zap, Star, Circle } from 'lucide-react';
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

export default function TemplateElegance({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Élégance Intemporelle',
      description: organization.description || 'Une beauté raffinée et sophistiquée',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'En savoir plus'
    },
    services: {
      title: 'Nos Soins Raffinés',
      description: 'L\'art de sublimer votre beauté naturelle'
    },
    cta: {
      title: 'Vivez l\'Élégance',
      description: 'Offrez-vous un moment d\'exception',
      button: 'Prendre Rendez-vous'
    },
    footer: {}
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* HEADER SOPHISTIQUÉ flottant - Optimized blur */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl shadow-purple-200/50 rounded-full px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {organization.logoUrl ? (
                <Image src={organization.logoUrl} alt={organization.name} width={120} height={48} className="h-12 w-auto" priority />
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-xl opacity-60 animate-pulse" />
                    <Sparkles className="w-8 h-8 relative z-10" style={{ color: organization.primaryColor }} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-serif font-bold" style={{ color: organization.secondaryColor }}>
                      {organization.name}
                    </h1>
                    <p className="text-xs text-gray-500">Élégance & Raffinement</p>
                  </div>
                </>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all relative group">
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: organization.primaryColor }} />
              </a>
              <a href="#signature" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all relative group">
                Signature
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: organization.primaryColor }} />
              </a>
              <a href="#equipe" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all relative group">
                Équipe
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: organization.primaryColor }} />
              </a>
              <Link
                href="/booking"
                className="px-6 py-3 rounded-full font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-110 relative overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                }}
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Réserver</span>
              </Link>
            </nav>

            {/* Mobile Menu */}
            <MobileMenu
              organization={organization}
              menuItems={[
                { label: 'Services', href: '#services' },
                { label: 'Signature', href: '#signature' },
                { label: 'Équipe', href: '#equipe' }
              ]}
              ctaLabel="Réserver"
              ctaHref="/booking"
              theme="light"
            />
          </div>
        </div>
      </header>

      {/* HERO avec particules flottantes */}
      <section className="pt-40 pb-32 px-6 relative overflow-hidden min-h-screen flex items-center">
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

        {/* Particules flottantes animées - Optimized to 8 particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float will-change-transform"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`,
                opacity: 0.2 + Math.random() * 0.3,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>

        {/* Cercles décoratifs en arrière-plan - Optimized blur */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 right-20 w-96 h-96 rounded-full blur-2xl opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${organization.primaryColor}40, transparent)`
            }}
          />
          <div
            className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-2xl opacity-20 animate-pulse delay-1000"
            style={{
              background: `radial-gradient(circle, ${organization.secondaryColor}40, transparent)`
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texte */}
            <div>
              {/* Badge premium */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg mb-8">
                <Heart className="w-5 h-5" style={{ color: organization.primaryColor }} />
                <span className="text-sm font-medium text-gray-700">Premium Beauty Experience</span>
                <Sparkles className="w-5 h-5" style={{ color: organization.secondaryColor }} />
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif mb-8 leading-[1.1]">
                <span className="block text-gray-900 mb-4">Sublimez</span>
                <span
                  className="block font-bold bg-gradient-to-r bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                  }}
                >
                  Votre Beauté
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-xl">
                {organization.description || "Un havre de paix où expertise et raffinement s'unissent pour révéler votre éclat naturel"}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/booking"
                  className="group px-10 py-5 rounded-full font-bold text-lg text-white shadow-2xl hover:shadow-3xl transition-transform hover:scale-105 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                  }}
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative flex items-center gap-2">
                    Prendre Rendez-vous
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="#services"
                  className="px-10 py-5 rounded-full font-semibold text-lg bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-xl transition-transform hover:scale-105"
                >
                  Découvrir
                </Link>
              </div>
            </div>

            {/* Image/Visuel décoratif */}
            <div className="relative">
              <div className="relative aspect-square">
                {/* Cercles concentriques animés - Optimized with will-change */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full border-2 border-dashed rounded-full animate-[spin_30s_linear_infinite] will-change-transform" style={{ borderColor: `${organization.primaryColor}30` }} />
                  <div className="absolute inset-0 w-[80%] h-[80%] m-auto border-2 border-dashed rounded-full animate-[spin_20s_linear_infinite_reverse] will-change-transform" style={{ borderColor: `${organization.secondaryColor}30` }} />
                  <div className="absolute inset-0 w-[60%] h-[60%] m-auto border-2 border-dashed rounded-full animate-[spin_15s_linear_infinite] will-change-transform" style={{ borderColor: `${organization.primaryColor}30` }} />
                </div>

                {/* Centre avec effet glassmorphism - Optimized blur */}
                <div className="absolute inset-0 w-[40%] h-[40%] m-auto bg-white/60 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center border border-white">
                  <Sparkles className="w-20 h-20" style={{ color: organization.primaryColor }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION SIGNATURE - Unique au template Élégance */}
      <section id="signature" className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent" style={{ color: organization.primaryColor }} />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 mb-6">
              <Star className="w-4 h-4" style={{ color: organization.primaryColor }} />
              <span className="text-sm font-medium text-gray-700">Notre Signature</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6">
              L'Art du Détail
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Ce qui nous rend uniques
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Approche Holistique',
                desc: 'Une vision complète de votre bien-être, corps et esprit en harmonie'
              },
              {
                icon: Zap,
                title: 'Innovation Continue',
                desc: 'Les dernières avancées technologiques au service de votre beauté'
              },
              {
                icon: Sparkles,
                title: 'Excellence Artisanale',
                desc: 'Un savoir-faire d\'exception transmis et perfectionné avec passion'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative p-10 bg-gradient-to-br from-gray-50 to-white rounded-3xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${organization.primaryColor}15, ${organization.secondaryColor}15)`
                  }}
                >
                  <item.icon className="w-8 h-8" style={{ color: organization.primaryColor }} />
                </div>
                <h3 className="text-2xl font-serif text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES avec effet 3D au hover */}
      <section id="services" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 mb-6">
              <span className="text-sm font-medium text-gray-700">Nos Prestations</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6">
              Carte de Soins Premium
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Une sélection raffinée de traitements exclusifs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group relative"
              >
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-3xl transition-transform duration-500 border border-gray-100 hover:border-gray-200 overflow-hidden hover:-translate-y-2 hover:scale-[1.02]">
                  {/* Effet de brillance au hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:via-white/40 transition-all duration-500" />

                  {/* Bordure animée */}
                  <div
                    className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{
                      background: `linear-gradient(90deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${organization.primaryColor}20, ${organization.secondaryColor}20)`
                        }}
                      >
                        <Sparkles className="w-7 h-7" style={{ color: organization.primaryColor }} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {service.duration}min
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                      {service.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-6 leading-relaxed min-h-[60px]">
                      {service.description || "Un soin d'exception pour sublimer votre beauté"}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <span className="text-4xl font-bold" style={{ color: organization.primaryColor }}>
                        {service.price}€
                      </span>
                      <ArrowRight
                        className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300"
                        style={{ color: organization.primaryColor }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ÉQUIPE avec effet parallax */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-32 px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 mb-6">
                <span className="text-sm font-medium text-gray-700">Notre Équipe</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6">
                Expertes Passionnées
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Des professionnelles dévouées à votre beauté
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="group">
                  <div className="relative mb-6 overflow-hidden rounded-3xl shadow-xl">
                    {/* Image avec effet zoom - Optimized */}
                    <div
                      className="aspect-[3/4] transition-transform duration-700 group-hover:scale-110 will-change-transform"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${organization.primaryColor}30, ${organization.secondaryColor}30)`
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-9xl font-serif text-gray-300">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overlay avec info au hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl font-serif text-white mb-2">{member.name}</h3>
                        <p className="text-sm font-medium" style={{ color: organization.primaryColor }}>
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info visible */}
                  <div className="text-center md:hidden">
                    <h3 className="text-xl font-serif text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-sm font-medium" style={{ color: organization.primaryColor }}>
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL sophistiqué */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div
            className="w-24 h-24 mx-auto mb-10 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
            }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-6xl md:text-7xl font-serif text-gray-900 mb-8">
            Votre Moment d'Exception
          </h2>
          <p className="text-2xl text-gray-600 mb-14 max-w-3xl mx-auto leading-relaxed">
            Offrez-vous l'expérience que vous méritez
          </p>

          <Link
            href="/booking"
            className="group inline-flex items-center gap-4 px-14 py-6 rounded-full font-bold text-xl text-white shadow-2xl hover:shadow-3xl transition-transform hover:scale-110 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
            }}
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Heart className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Réserver Mon Rendez-vous</span>
          </Link>
        </div>
      </section>

      {/* Founder Section */}
      {organization.founderName && (
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {organization.founderImage && (
                <div className="relative">
                  <div
                    className="absolute inset-0 blur-2xl opacity-20"
                    style={{
                      background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                    }}
                  />
                  <Image
                    src={organization.founderImage}
                    alt={organization.founderName}
                    width={600}
                    height={800}
                    className="rounded-3xl w-full h-auto object-cover relative z-10"
                  />
                </div>
              )}
              <div className={organization.founderImage ? '' : 'md:col-span-2 text-center'}>
                <h2 className="text-5xl md:text-6xl font-serif mb-6" style={{ color: organization.secondaryColor }}>
                  {organization.founderName}
                </h2>
                {organization.founderTitle && (
                  <p className="text-2xl mb-8 opacity-70" style={{ color: organization.secondaryColor }}>
                    {organization.founderTitle}
                  </p>
                )}
                {organization.founderQuote && (
                  <blockquote className="text-2xl italic leading-relaxed text-gray-700">
                    "{organization.founderQuote}"
                  </blockquote>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
