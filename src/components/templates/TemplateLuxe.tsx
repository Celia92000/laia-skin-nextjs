'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseTemplateContent } from '@/types/template-content';
import { Crown, Clock, Star, Sparkles, Award, Shield } from 'lucide-react';
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

export default function TemplateLuxe({ organization, services, team, content }: TemplateProps) {
  // Utilisation des couleurs personnalisables de l'organisation
  const primaryColor = organization.primaryColor
  const secondaryColor = organization.secondaryColor

  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Luxe & Prestige',
      description: organization.description || 'L\'excellence à votre service',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Soins d\'Exception',
      description: 'Une expérience luxueuse et raffinée'
    },
    cta: {
      title: 'Offrez-vous le Luxe',
      description: 'Réservez votre moment privilégié',
      button: 'Réserver Maintenant'
    },
    footer: {}
  };

  const c = content || defaultContent;

  const menuItems = [
    { label: 'Services', href: '#services' },
    { label: 'Équipe', href: '#equipe' },
    ...(organization.founderName ? [{ label: 'Fondatrice', href: '#founder' }] : []),
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* NAVBAR LUXE avec effet glass morphism premium */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-gradient-to-b from-black/80 to-black/40 border-b" style={{ borderColor: `${primaryColor}20` }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Crown className="w-10 h-10" style={{ color: primaryColor }} />
                <div className="absolute inset-0 blur-lg opacity-30" style={{ backgroundColor: primaryColor }} />
              </div>
              <div>
                {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  width={120}
                  height={48}
                  className="h-12 w-auto object-contain"
                  priority
                />
              ) : (
                <h1 className="text-3xl font-serif tracking-wider" style={{ color: primaryColor }}>{organization.name}</h1>
              )}
                <p className="text-xs tracking-widest uppercase opacity-60" style={{ color: primaryColor }}>Luxury Experience</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-12">
              <a href="#services" className="text-sm tracking-widest uppercase text-white/70 hover:text-white transition-all relative group">
                Prestations
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: primaryColor }} />
              </a>
              <a href="#experience" className="text-sm tracking-widest uppercase text-white/70 hover:text-white transition-all relative group">
                Expérience
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: primaryColor }} />
              </a>
              <a href="#equipe" className="text-sm tracking-widest uppercase text-white/70 hover:text-white transition-all relative group">
                Équipe
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: primaryColor }} />
              </a>
              <Link
                href="/booking"
                className="relative px-8 py-4 text-black font-bold rounded-none uppercase tracking-wider shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
              >
                <Crown className="w-5 h-5" />
                Réserver
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - Ultra Premium avec parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background media (video or image) */}
        {(organization.heroVideo || organization.heroImage) && (
          <HeroMedia
            videoUrl={organization.heroVideo}
            imageUrl={organization.heroImage}
            alt={`${organization.name} hero`}
            priority
            overlay
            overlayOpacity={0.6}
          />
        )}

        {/* Background animé complexe */}
        <div className="absolute inset-0">
          {/* Grille dorée animée */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(${primaryColor}10 1px, transparent 1px),
              linear-gradient(90deg, ${primaryColor}10 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
          }} />

          {/* Cercles dorés concentriques animés - Optimisé */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[600px] h-[600px] border rounded-full animate-[spin_30s_linear_infinite]" style={{ borderColor: `${primaryColor}20` }} />
            <div className="absolute inset-0 w-[400px] h-[400px] m-auto border rounded-full animate-[spin_20s_linear_infinite_reverse]" style={{ borderColor: `${primaryColor}25` }} />
          </div>

          {/* Rayons lumineux subtils */}
          <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(to top right, ${secondaryColor}, transparent)` }} />
          <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(to bottom left, ${secondaryColor}, transparent)` }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
          {/* Badge Premium */}
          <div className="inline-flex items-center gap-3 px-8 py-3 backdrop-blur-md border rounded-full mb-8 shadow-2xl" style={{
            backgroundColor: `${primaryColor}10`,
            borderColor: `${primaryColor}30`
          }}>
            <Star className="w-5 h-5" style={{ color: primaryColor }} />
            <span className="text-sm tracking-[0.3em] uppercase font-light" style={{ color: primaryColor }}>Excellence • Prestige • Raffinement</span>
            <Star className="w-5 h-5" style={{ color: primaryColor }} />
          </div>

          {/* Titre majestueux */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-serif mb-10 leading-none">
            <span className="block mb-6" style={{ color: primaryColor }}>
              L'Art du
            </span>
            <span className="block" style={{ color: primaryColor }}>
              Luxe Absolu
            </span>
          </h1>

          <p className="text-2xl mb-16 max-w-4xl mx-auto leading-relaxed font-light" style={{ color: `${primaryColor}cc` }}>
            {organization.description || "Une expérience sensorielle d'exception où chaque détail sublime votre beauté naturelle"}
          </p>

          {/* CTA Premium */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link
              href="/booking"
              className="group relative px-12 py-6 text-black font-bold text-xl rounded-none uppercase tracking-widest shadow-2xl transition-all overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor})` }}
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex items-center gap-3">
                <Crown className="w-6 h-6" />
                Réserver l'Excellence
              </div>
            </Link>
            <Link
              href="#services"
              className="px-12 py-6 border-2 rounded-none text-xl font-semibold uppercase tracking-widest transition-all backdrop-blur-sm hover:bg-white/5"
              style={{
                borderColor: `${primaryColor}50`,
                color: primaryColor
              }}
            >
              Découvrir
            </Link>
          </div>

          {/* Stats Premium */}
          <div className="grid grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              { icon: Award, number: '20+', label: 'Années d\'Excellence' },
              { icon: Crown, number: '10K+', label: 'Clients Privilégiés' },
              { icon: Star, number: '100%', label: 'Satisfaction' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative inline-block mb-4">
                  <stat.icon className="w-12 h-12 relative z-10" style={{ color: primaryColor }} />
                  <div className="absolute inset-0 blur-lg opacity-20" style={{ backgroundColor: primaryColor }} />
                </div>
                <div className="text-5xl font-bold mb-2" style={{ color: primaryColor }}>{stat.number}</div>
                <div className="text-sm tracking-widest uppercase text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator premium */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-12 border-2 rounded-full flex items-start justify-center pt-3" style={{ borderColor: `${primaryColor}50` }}>
              <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
            <span className="text-xs tracking-widest uppercase opacity-50" style={{ color: primaryColor }}>Scroll</span>
          </div>
        </div>
      </section>

      {/* SECTION EXPERIENCE - Unique au template Luxe */}
      <section id="experience" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(to bottom, transparent, ${secondaryColor}, transparent)` }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-2 border rounded-full mb-6" style={{
              backgroundColor: `${primaryColor}10`,
              borderColor: `${primaryColor}20`
            }}>
              <Shield className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-sm tracking-widest uppercase" style={{ color: primaryColor }}>Notre Engagement</span>
            </div>
            <h2 className="text-6xl font-serif mb-6" style={{ color: primaryColor }}>
              L'Expérience Luxe
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: Crown,
                title: 'Prestations Exclusives',
                desc: 'Des soins sur-mesure utilisant les technologies et produits les plus raffinés'
              },
              {
                icon: Star,
                title: 'Service Premium',
                desc: 'Un accompagnement personnalisé dans un écrin de luxe et de sérénité'
              },
              {
                icon: Award,
                title: 'Expertise Reconnue',
                desc: 'Une équipe d\'expertes formées aux meilleures techniques internationales'
              },
              {
                icon: Sparkles,
                title: 'Produits d\'Exception',
                desc: 'Une sélection pointue des marques les plus prestigieuses et efficaces'
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative p-10 border transition-all duration-500" style={{
                background: `linear-gradient(to bottom right, ${primaryColor}05, transparent)`,
                borderColor: `${primaryColor}20`
              }}>
                <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-all" style={{
                  background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`
                }} />
                <item.icon className="w-16 h-16 mb-6" style={{ color: primaryColor }} />
                <h3 className="text-3xl font-serif mb-4" style={{ color: primaryColor }}>{item.title}</h3>
                <p className="leading-relaxed" style={{ color: `${primaryColor}99` }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES - Grid premium avec animations */}
      <section id="services" className="py-32 px-6 relative">
        <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(to bottom, transparent, ${secondaryColor}, transparent)` }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 px-6 py-2 border rounded-full mb-6" style={{
              backgroundColor: `${primaryColor}10`,
              borderColor: `${primaryColor}20`
            }}>
              <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-sm tracking-widest uppercase" style={{ color: primaryColor }}>Nos Prestations</span>
            </div>
            <h2 className="text-6xl font-serif mb-6" style={{ color: primaryColor }}>
              Carte de Soins Premium
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: `${primaryColor}99` }}>
              Une sélection exclusive de traitements d'exception
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, idx) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group relative overflow-hidden"
              >
                {/* Carte avec effet glassmorphism premium */}
                <div className="relative p-8 backdrop-blur-md border transition-all duration-500 h-full" style={{
                  background: `linear-gradient(to bottom right, ${primaryColor}10, ${primaryColor}05)`,
                  borderColor: `${primaryColor}20`
                }}>
                  {/* Badge numéro luxe */}
                  <div className="absolute -top-3 -right-3 w-14 h-14 flex items-center justify-center text-black font-bold text-xl shadow-2xl" style={{
                    background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor})`
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Effet hover lumineux */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500" style={{
                    background: `linear-gradient(to bottom right, ${primaryColor}10, ${primaryColor}05)`
                  }} />

                  <div className="relative">
                    <h3 className="text-2xl font-serif mb-4 transition-colors" style={{ color: primaryColor }}>
                      {service.name}
                    </h3>
                    <p className="text-sm mb-6 leading-relaxed min-h-[60px]" style={{ color: `${primaryColor}99` }}>
                      {service.description || "Une expérience sensorielle unique et personnalisée"}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: `${primaryColor}20` }}>
                      <div className="flex items-center gap-2" style={{ color: `${primaryColor}cc` }}>
                        <Clock className="w-5 h-5" />
                        <span className="text-sm">{service.duration} min</span>
                      </div>
                      <div className="text-4xl font-bold" style={{ color: primaryColor }}>
                        {service.price}€
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre lumineuse au hover */}
                <div className="absolute bottom-0 left-0 w-0 h-1 group-hover:w-full transition-all duration-500" style={{
                  backgroundColor: primaryColor
                }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ÉQUIPE - Style ultra premium */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(to bottom, transparent, ${secondaryColor}, transparent)` }} />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-3 px-6 py-2 border rounded-full mb-6" style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}20`
              }}>
                <Crown className="w-5 h-5" style={{ color: primaryColor }} />
                <span className="text-sm tracking-widest uppercase" style={{ color: primaryColor }}>Notre Équipe</span>
              </div>
              <h2 className="text-6xl font-serif" style={{ color: primaryColor }}>
                Expertes d'Exception
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="group relative">
                  {/* Cadre doré décoratif */}
                  <div className="absolute -inset-4 border-2 transition-all duration-500" style={{ borderColor: `${primaryColor}20` }} />
                  <div className="absolute -inset-2 border transition-all duration-500" style={{ borderColor: `${primaryColor}30` }} />

                  {/* Photo avec effet */}
                  <div className="relative aspect-[3/4] overflow-hidden mb-6">
                    <div
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${primaryColor}20, rgba(0, 0, 0, 0.8))`
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-9xl font-serif opacity-20" style={{ color: primaryColor }}>
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Overlay doré au hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-all" />
                  </div>

                  {/* Info */}
                  <div className="text-center relative">
                    <h3 className="text-2xl font-serif mb-2" style={{ color: primaryColor }}>{member.name}</h3>
                    <p className="text-sm tracking-widest uppercase" style={{ color: primaryColor }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL - Ultra Premium */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(to bottom, transparent, ${secondaryColor}, transparent)` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-xl opacity-10" style={{ backgroundColor: primaryColor }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Crown className="w-20 h-20 mx-auto mb-8" style={{ color: primaryColor }} />
          <h2 className="text-7xl font-serif mb-8" style={{ color: primaryColor }}>
            Rejoignez l'Excellence
          </h2>
          <p className="text-2xl mb-16 max-w-3xl mx-auto leading-relaxed" style={{ color: `${primaryColor}b3` }}>
            Offrez-vous une expérience beauté d'exception dans un écrin de luxe
          </p>
          <Link
            href="/booking"
            className="group relative inline-flex items-center gap-4 px-16 py-8 text-black font-bold text-2xl rounded-none uppercase tracking-widest shadow-2xl transition-all overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor})` }}
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Crown className="w-8 h-8 relative z-10" />
            <span className="relative z-10">Réserver Maintenant</span>
          </Link>
        </div>
      </section>

      {/* Founder Section */}
      {organization.founderName && (
        <section id="founder" className="py-20 px-6 relative overflow-hidden bg-black/20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {organization.founderImage && (
                <div className="relative">
                  <div className="absolute -inset-4 border-2 transition-all duration-500" style={{ borderColor: `${primaryColor}20` }} />
                  <Image
                    src={organization.founderImage}
                    alt={organization.founderName}
                    width={600}
                    height={800}
                    className="relative rounded-none w-full h-auto object-cover shadow-2xl"
                  />
                </div>
              )}
              <div className={!organization.founderImage ? 'md:col-span-2 text-center' : ''}>
                <div className="inline-flex items-center gap-3 px-6 py-2 border rounded-full mb-6" style={{
                  backgroundColor: `${primaryColor}10`,
                  borderColor: `${primaryColor}20`
                }}>
                  <Crown className="w-5 h-5" style={{ color: primaryColor }} />
                  <span className="text-sm tracking-widest uppercase" style={{ color: primaryColor }}>Fondatrice</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif mb-4 text-white">
                  {organization.founderName}
                </h3>
                {organization.founderTitle && (
                  <p className="text-lg mb-6" style={{ color: primaryColor }}>
                    {organization.founderTitle}
                  </p>
                )}
                {organization.founderQuote && (
                  <blockquote className="text-xl text-white/80 italic leading-relaxed">
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

      {/* FOOTER Premium */}
      <TemplateFooter organization={organization} theme="dark" />
    </div>
  );
}
