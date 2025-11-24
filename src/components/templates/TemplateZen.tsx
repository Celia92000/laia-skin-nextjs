'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseTemplateContent } from '@/types/template-content';
import { Leaf, Clock, Circle } from 'lucide-react';
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

export default function TemplateZen({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor
  const secondaryColor = organization.secondaryColor

  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Sérénité & Harmonie',
      description: organization.description || 'Un havre de paix pour votre bien-être',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Soins Relaxants',
      description: 'Des moments de détente absolue'
    },
    cta: {
      title: 'Trouvez Votre Équilibre',
      description: 'Offrez-vous un moment de sérénité',
      button: 'Réserver un Soin'
    },
    footer: {}
  };

  const c = content || defaultContent;

  const menuItems = [
    { label: 'Soins', href: '#services' },
    { label: 'Équipe', href: '#equipe' },
    ...(organization.founderName ? [{ label: 'Fondatrice', href: '#founder' }] : []),
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

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

        @keyframes sway {
          0%, 100% {
            transform: rotate(0deg) translateY(0);
          }
          50% {
            transform: rotate(10deg) translateY(-5px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(5deg);
          }
          66% {
            transform: translateY(10px) rotate(-5deg);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100/20">
      {/* Header zen minimaliste */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                <>
                  <div className="relative">
                    <Leaf className="w-8 h-8" style={{ color: primaryColor }} />
                    <Circle className="w-12 h-12 absolute -inset-2 -z-10" style={{ color: `${primaryColor}40` }} strokeWidth={1} />
                  </div>
                  <h1 className="text-2xl font-light tracking-wide text-stone-800">
                    {organization.name}
                  </h1>
                </>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-10">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-light"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/booking"
                className="px-6 py-3 text-white rounded-full font-light hover:shadow-xl transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  boxShadow: `0 10px 40px ${primaryColor}30`
                }}
              >
                Réserver
              </Link>
            </nav>
            <div className="md:hidden">
              <MobileMenu menuItems={menuItems} primaryColor={primaryColor} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero zen vertical avec breathing space - COMPLETELY REDESIGNED */}
      <section className="py-48 px-6 relative overflow-hidden min-h-screen flex items-center justify-center">
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

        {/* Water ripples - concentric circles background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border animate-[breathe_10s_ease-in-out_infinite]"
              style={{
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                borderColor: `${primaryColor}${Math.max(5, 30 - i * 3)}`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Floating leaves */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {[...Array(6)].map((_, i) => (
            <Leaf
              key={i}
              className="absolute w-8 h-8 animate-[sway_6s_ease-in-out_infinite]"
              style={{
                color: i % 2 === 0 ? primaryColor : secondaryColor,
                top: `${10 + i * 15}%`,
                left: `${5 + i * 15}%`,
                animationDelay: `${i * 0.8}s`,
                opacity: 0.3
              }}
            />
          ))}
        </div>

        {/* Bamboo stalks background */}
        <div className="absolute left-0 top-0 bottom-0 w-24 opacity-10 pointer-events-none hidden md:block">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 bg-amber-700 rounded-full animate-[sway_8s_ease-in-out_infinite]"
              style={{
                left: `${i * 12}px`,
                top: `${i * 50}px`,
                bottom: 0,
                height: `${400 + i * 100}px`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-24 opacity-10 pointer-events-none hidden md:block">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 bg-amber-700 rounded-full animate-[sway_8s_ease-in-out_infinite]"
              style={{
                right: `${i * 12}px`,
                top: `${i * 60}px`,
                bottom: 0,
                height: `${450 + i * 80}px`,
                animationDelay: `${i * 0.6}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* LARGE CENTERED MEDITATION CIRCLE - Main focal point */}
          <div className="relative inline-block mb-24">
            <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
              {/* Multiple concentric breathing circles - meditation ripples */}
              <div className="absolute inset-0 rounded-full border-2 animate-[breathe_8s_ease-in-out_infinite]" style={{
                borderColor: `${primaryColor}40`,
                boxShadow: `0 0 80px ${primaryColor}20`
              }} />
              <div className="absolute inset-6 rounded-full border-2 animate-[breathe_7s_ease-in-out_infinite_0.5s]" style={{
                borderColor: `${primaryColor}35`
              }} />
              <div className="absolute inset-12 rounded-full border animate-[breathe_6s_ease-in-out_infinite_1s]" style={{
                borderColor: `${primaryColor}30`
              }} />
              <div className="absolute inset-16 rounded-full border animate-[breathe_5s_ease-in-out_infinite_1.5s]" style={{
                borderColor: `${primaryColor}25`
              }} />
              <div className="absolute inset-20 rounded-full border animate-[breathe_4s_ease-in-out_infinite_2s]" style={{
                borderColor: `${primaryColor}20`
              }} />

              {/* Stone/natural background gradient circle */}
              <div className="absolute inset-24 rounded-full animate-[breathe_8s_ease-in-out_infinite]" style={{
                background: `radial-gradient(circle, ${primaryColor}15, ${secondaryColor}10, transparent)`,
                filter: 'blur(30px)'
              }} />

              {/* Inner content circle - breathing meditation center */}
              <div className="absolute inset-16 rounded-full bg-white/70 backdrop-blur-2xl flex flex-col items-center justify-center border-2" style={{
                borderColor: `${primaryColor}20`,
                boxShadow: `0 0 100px ${primaryColor}25, inset 0 0 60px ${primaryColor}10`
              }}>
                <div className="relative">
                  <Leaf className="w-20 h-20 md:w-24 md:h-24 mb-6 animate-[breathe_4s_ease-in-out_infinite]" style={{ color: primaryColor }} />
                  {/* Pulsing circle around leaf */}
                  <div className="absolute inset-0 -m-8 rounded-full border animate-[breathe_3s_ease-in-out_infinite]" style={{
                    borderColor: `${primaryColor}30`
                  }} />
                </div>
                <div className="text-base md:text-lg font-light text-stone-700 tracking-[0.3em] mb-2">RESPIREZ</div>
                <div className="text-xs text-stone-500 tracking-widest">MÉDITEZ</div>

                {/* Meditation timer visual - circular progress */}
                <div className="mt-6 flex gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-[breathe_2s_ease-in-out_infinite]"
                      style={{
                        backgroundColor: primaryColor,
                        animationDelay: `${i * 0.25}s`,
                        opacity: 0.4
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bamboo stalks decorations around circle */}
              <div className="absolute -left-12 top-1/4 text-amber-600/30">
                <div className="w-1.5 h-32 bg-current rounded-full animate-[sway_6s_ease-in-out_infinite]" />
                <div className="absolute w-3 h-3 rounded-full bg-current -top-1 left-1/2 -translate-x-1/2" />
                <div className="absolute w-3 h-3 rounded-full bg-current top-12 left-1/2 -translate-x-1/2" />
              </div>
              <div className="absolute -right-12 top-1/3 text-amber-600/30">
                <div className="w-1.5 h-40 bg-current rounded-full animate-[sway_5s_ease-in-out_infinite_0.5s]" />
                <div className="absolute w-3 h-3 rounded-full bg-current -top-1 left-1/2 -translate-x-1/2" />
                <div className="absolute w-3 h-3 rounded-full bg-current top-16 left-1/2 -translate-x-1/2" />
              </div>
              <div className="absolute -left-16 bottom-1/4 text-amber-600/25 hidden md:block">
                <div className="w-1.5 h-28 bg-current rounded-full animate-[sway_7s_ease-in-out_infinite_1s]" />
                <div className="absolute w-3 h-3 rounded-full bg-current -top-1 left-1/2 -translate-x-1/2" />
              </div>
              <div className="absolute -right-16 bottom-1/3 text-amber-600/25 hidden md:block">
                <div className="w-1.5 h-36 bg-current rounded-full animate-[sway_6.5s_ease-in-out_infinite_1.5s]" />
                <div className="absolute w-3 h-3 rounded-full bg-current -top-1 left-1/2 -translate-x-1/2" />
              </div>

              {/* Floating stones/pebbles */}
              <div className="absolute -bottom-4 left-1/4 w-6 h-4 rounded-full bg-stone-400/30 animate-[breathe_5s_ease-in-out_infinite]" />
              <div className="absolute -bottom-6 right-1/3 w-8 h-5 rounded-full bg-stone-500/25 animate-[breathe_6s_ease-in-out_infinite_1s]" />
              <div className="absolute -top-4 left-1/3 w-5 h-3 rounded-full bg-stone-400/20 animate-[breathe_7s_ease-in-out_infinite_0.5s]" />
            </div>
          </div>

          {/* Minimal text overlay - very spacious */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight text-stone-800 mb-16 leading-loose tracking-widest">
            <span className="block mb-8 animate-[fadeInUp_1s_ease-out] text-stone-600">Trouvez Votre</span>
            <span className="block mb-8 text-5xl md:text-7xl lg:text-8xl font-light animate-[fadeInUp_1s_ease-out_0.3s] opacity-0 [animation-fill-mode:forwards]" style={{ color: primaryColor }}>
              Paix Intérieure
            </span>
            <span className="block text-3xl md:text-5xl animate-[fadeInUp_1s_ease-out_0.6s] opacity-0 [animation-fill-mode:forwards] text-stone-500">
              En Harmonie avec la Nature
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 mb-20 max-w-2xl mx-auto leading-loose font-light">
            {organization.description || "Reconnectez-vous à votre essence. Laissez le temps s'arrêter dans un havre de sérénité."}
          </p>

          <div className="flex flex-col gap-8 items-center">
            <Link
              href="/booking"
              className="group px-14 py-6 text-white rounded-full font-light text-lg hover:shadow-2xl transition-all duration-1000 hover:scale-105 flex items-center gap-4 animate-[breathe_5s_ease-in-out_infinite]"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                boxShadow: `0 30px 80px ${primaryColor}35`
              }}
            >
              <Circle className="w-6 h-6 animate-[breathe_3s_ease-in-out_infinite]" />
              <span className="tracking-wider">Commencer Votre Voyage Zen</span>
            </Link>
            <Link
              href="#services"
              className="text-stone-500 hover:text-stone-800 font-light flex items-center gap-3 group transition-all duration-500 text-sm tracking-widest"
            >
              <span>Découvrir nos rituels</span>
              <svg className="w-4 h-4 group-hover:translate-y-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </Link>
          </div>

          {/* Zen values - circular stones layout with more breathing space */}
          <div className="mt-40 flex justify-center gap-20 md:gap-32 flex-wrap">
            {[
              { icon: <Leaf className="w-12 h-12" />, label: '100% Naturel', color: primaryColor },
              { icon: <Circle className="w-12 h-12" />, label: 'Harmonie', color: '#d97706' },
              { icon: <Leaf className="w-12 h-12" />, label: 'Équilibre', color: secondaryColor }
            ].map((value, idx) => (
              <div key={idx} className="text-center group">
                <div
                  className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-1000 group-hover:scale-110 animate-[breathe_7s_ease-in-out_infinite]"
                  style={{
                    background: `radial-gradient(circle, ${value.color}25, ${value.color}10, transparent)`,
                    animationDelay: `${idx * 0.8}s`,
                    boxShadow: `0 15px 60px ${value.color}20`,
                    border: `1px solid ${value.color}20`
                  }}
                >
                  <div style={{ color: value.color }} className="relative">
                    {value.icon}
                    <div className="absolute inset-0 -m-4 rounded-full border animate-[breathe_4s_ease-in-out_infinite]" style={{
                      borderColor: `${value.color}20`
                    }} />
                  </div>
                </div>
                <p className="text-sm text-stone-600 font-light tracking-widest uppercase">{value.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator - zen style */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-stone-400 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-stone-400" />
        </div>
      </section>

      {/* Wave divider - Multiple layers for depth */}
      <div className="relative w-full h-32" style={{ color: primaryColor }}>
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,100 900,20 1200,80 L1200,120 L0,120 Z" fill="currentColor" opacity="0.08" />
          <path d="M0,20 C300,90 900,10 1200,60 L1200,120 L0,120 Z" fill="currentColor" opacity="0.06" />
          <path d="M0,40 C350,110 850,30 1200,85 L1200,120 L0,120 Z" fill="currentColor" opacity="0.04" />
        </svg>
        {/* Floating leaves on wave */}
        <div className="absolute inset-0 pointer-events-none">
          <Leaf className="absolute w-6 h-6 animate-[float_8s_ease-in-out_infinite] opacity-30" style={{ color: primaryColor, left: '20%', top: '30%' }} />
          <Leaf className="absolute w-5 h-5 animate-[float_10s_ease-in-out_infinite] opacity-25" style={{ color: secondaryColor, left: '70%', top: '50%' }} />
        </div>
      </div>

      {/* Services - Single column vertical zen stack */}
      <section id="services" className="py-32 px-6 bg-gradient-to-b from-stone-50 via-white to-stone-50 relative overflow-hidden">
        {/* Floating leaves background */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {[...Array(10)].map((_, i) => (
            <Leaf
              key={i}
              className="absolute animate-[float_15s_ease-in-out_infinite]"
              style={{
                color: i % 2 === 0 ? primaryColor : secondaryColor,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${20 + Math.random() * 20}px`,
                height: `${20 + Math.random() * 20}px`,
                animationDelay: `${i * 1.5}s`,
                opacity: 0.2
              }}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-32">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-24 h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}50, transparent)` }} />
              <div className="relative">
                <Circle className="w-8 h-8 animate-[breathe_6s_ease-in-out_infinite]" style={{ color: primaryColor }} strokeWidth={1} />
                <Circle className="w-12 h-12 absolute -inset-2" style={{ color: `${primaryColor}20` }} strokeWidth={1} />
              </div>
              <div className="w-24 h-px" style={{ background: `linear-gradient(to right, ${primaryColor}50, transparent)` }} />
            </div>
            <h2 className="text-5xl md:text-6xl font-light text-stone-800 mb-8 tracking-wide">
              Nos Rituels de Soin
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
              Chaque soin est un voyage vers l'harmonie intérieure
            </p>
          </div>

          <div className="space-y-32">
            {services.slice(0, 6).map((service, idx) => (
              <div
                key={service.id}
                className="relative opacity-0 translate-y-12 animate-[fadeInUp_1s_ease-out_forwards]"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                {/* Number badge - positioned left outside */}
                <div className="absolute -left-4 md:-left-20 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-light text-2xl md:text-3xl shadow-2xl animate-[breathe_6s_ease-in-out_infinite]" style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    boxShadow: `0 20px 60px ${primaryColor}30`,
                    animationDelay: `${idx * 0.2}s`
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  {/* Vertical connecting line */}
                  {idx < services.slice(0, 6).length - 1 && (
                    <div className="w-px h-32 bg-gradient-to-b from-current to-transparent opacity-20" style={{ color: primaryColor }} />
                  )}
                </div>

                {/* Leaf decorations - side elements */}
                <div className="absolute -right-6 top-8 opacity-20">
                  <Leaf className="w-12 h-12 rotate-45" style={{ color: primaryColor }} />
                </div>
                <div className="absolute -left-6 bottom-8 opacity-20 hidden md:block">
                  <Leaf className="w-10 h-10 -rotate-45" style={{ color: secondaryColor }} />
                </div>

                <Link
                  href={`/booking?service=${service.id}`}
                  className="group block relative"
                >
                  {/* Circular card container */}
                  <div className="relative bg-white rounded-[3rem] p-10 md:p-16 border-2 border-stone-200/50 hover:border-stone-300 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2" style={{
                    boxShadow: `0 10px 60px ${primaryColor}10`
                  }}>
                    {/* Breathing circle background effect */}
                    <div className="absolute -inset-1 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 animate-[breathe_4s_ease-in-out_infinite]" style={{
                      background: `radial-gradient(circle at 50% 50%, ${primaryColor}10, transparent 70%)`,
                      filter: 'blur(20px)'
                    }} />

                    <div className="text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6 gap-4">
                        <h3 className="text-3xl md:text-4xl font-light text-stone-800 group-hover:opacity-80 transition-opacity">
                          {service.name}
                        </h3>
                        <div className="flex items-center justify-center md:justify-start gap-3 text-stone-500 whitespace-nowrap">
                          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                          </div>
                          <span className="font-light text-lg">{service.duration} min</span>
                        </div>
                      </div>

                      <p className="text-stone-600 text-lg mb-8 leading-relaxed font-light max-w-2xl">
                        {service.description || "Un moment suspendu, hors du temps, pour retrouver votre équilibre naturel et votre paix intérieure."}
                      </p>

                      <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-stone-200/50 gap-6">
                        <div className="flex items-baseline gap-3">
                          <span className="text-5xl font-light" style={{ color: primaryColor }}>
                            {service.price}€
                          </span>
                          <span className="text-stone-400 font-light">/ session</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg font-light group-hover:gap-5 transition-all px-8 py-4 rounded-full group-hover:bg-stone-50" style={{ color: primaryColor }}>
                          <span>Réserver ce rituel</span>
                          <Circle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Stone/zen decorative elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-stone-300/50" />
              </div>
            ))}
          </div>

          {/* Bottom meditation circle */}
          <div className="mt-32 flex justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border animate-[breathe_8s_ease-in-out_infinite]" style={{ borderColor: `${primaryColor}20` }} />
              <div className="absolute inset-4 rounded-full border animate-[breathe_6s_ease-in-out_infinite_1s]" style={{ borderColor: `${primaryColor}30` }} />
              <div className="absolute inset-8 rounded-full" style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Wave divider - Zen natural flow */}
      <div className="relative w-full h-32 rotate-180">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,40 C300,80 900,0 1200,50 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}15` }} />
          <path d="M0,60 C300,100 900,20 1200,70 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}10` }} />
          <path d="M0,80 C350,110 850,30 1200,85 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}05` }} />
        </svg>
        {/* Stones/pebbles on wave */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-4 h-3 rounded-full bg-stone-400/30 animate-[breathe_6s_ease-in-out_infinite]" style={{ left: '15%', top: '40%' }} />
          <div className="absolute w-5 h-4 rounded-full bg-stone-500/25 animate-[breathe_7s_ease-in-out_infinite]" style={{ left: '60%', top: '30%' }} />
          <div className="absolute w-3 h-2 rounded-full bg-stone-400/20 animate-[breathe_5s_ease-in-out_infinite]" style={{ left: '85%', top: '50%' }} />
        </div>
      </div>

      {/* Équipe - Zen vertical layout */}
      {team && team.length > 0 && (
        <>
          {/* Wave divider - Incoming wave */}
          <div className="relative w-full h-32">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,10 C300,80 900,30 1200,70 L1200,120 L0,120 Z" style={{ fill: `${primaryColor}08` }} />
              <path d="M0,30 C350,90 850,40 1200,85 L1200,120 L0,120 Z" style={{ fill: `${primaryColor}05` }} />
            </svg>
            {/* Floating leaves */}
            <div className="absolute inset-0 pointer-events-none">
              <Leaf className="absolute w-6 h-6 animate-[float_9s_ease-in-out_infinite] opacity-25" style={{ color: primaryColor, left: '30%', top: '40%' }} />
              <Leaf className="absolute w-5 h-5 animate-[float_11s_ease-in-out_infinite] opacity-20" style={{ color: secondaryColor, left: '75%', top: '30%' }} />
            </div>
          </div>

          <section id="equipe" className="py-48 px-6 bg-gradient-to-b from-white via-stone-50/50 to-white relative overflow-hidden">
            {/* Zen garden elements floating */}
            <div className="absolute inset-0 pointer-events-none opacity-8">
              {[...Array(12)].map((_, i) => (
                <Leaf
                  key={i}
                  className="absolute animate-[float_16s_ease-in-out_infinite]"
                  style={{
                    color: i % 3 === 0 ? primaryColor : i % 3 === 1 ? secondaryColor : '#d97706',
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${12 + Math.random() * 18}px`,
                    height: `${12 + Math.random() * 18}px`,
                    animationDelay: `${i * 1.3}s`,
                    opacity: 0.15
                  }}
                />
              ))}
              {/* Zen pebbles scattered */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={`stone-${i}`}
                  className="absolute rounded-full animate-[breathe_9s_ease-in-out_infinite]"
                  style={{
                    width: `${8 + Math.random() * 12}px`,
                    height: `${6 + Math.random() * 8}px`,
                    backgroundColor: `rgba(120, 113, 108, ${0.15 + Math.random() * 0.1})`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 1.8}s`
                  }}
                />
              ))}
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
              <div className="text-center mb-32">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-24 h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}50, transparent)` }} />
                  <div className="relative">
                    <Circle className="w-8 h-8 animate-[breathe_6s_ease-in-out_infinite]" style={{ color: primaryColor }} strokeWidth={1} />
                    <Circle className="w-12 h-12 absolute -inset-2 animate-[breathe_8s_ease-in-out_infinite]" style={{ color: `${primaryColor}20` }} strokeWidth={1} />
                  </div>
                  <div className="w-24 h-px" style={{ background: `linear-gradient(to right, ${primaryColor}50, transparent)` }} />
                </div>
                <h2 className="text-5xl md:text-6xl font-light text-stone-800 mb-8 tracking-wide">
                  Gardiennes de Votre Bien-Être
                </h2>
                <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light leading-relaxed">
                  Une équipe dévouée à votre épanouissement
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-16 md:gap-20">
                {team.slice(0, 3).map((member, idx) => (
                  <div
                    key={member.id}
                    className="group text-center opacity-0 translate-y-12 animate-[fadeInUp_1s_ease-out_forwards]"
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    <div className="relative mb-8 mx-auto w-56 h-56">
                      {/* Breathing circle decorations */}
                      <div className="absolute -inset-6 rounded-full border animate-[breathe_6s_ease-in-out_infinite] transition-all" style={{
                        borderColor: `${primaryColor}20`,
                        animationDelay: `${idx * 0.3}s`
                      }} />
                      <div className="absolute -inset-4 rounded-full border animate-[breathe_8s_ease-in-out_infinite] transition-all" style={{
                        borderColor: `${primaryColor}30`,
                        animationDelay: `${idx * 0.3}s`
                      }} />
                      <div className="absolute -inset-2 rounded-full border animate-[breathe_4s_ease-in-out_infinite] transition-all" style={{
                        borderColor: `${primaryColor}15`,
                        animationDelay: `${idx * 0.3}s`
                      }} />

                      {/* Image circle */}
                      <div
                        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500"
                        style={{
                          background: member.imageUrl
                            ? `url(${member.imageUrl}) center/cover`
                            : `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`,
                          boxShadow: `0 20px 60px ${primaryColor}20`
                        }}
                      >
                        {!member.imageUrl && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-8xl font-light animate-[breathe_4s_ease-in-out_infinite]" style={{ color: `${primaryColor}60` }}>
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Leaf accent */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg" style={{
                        boxShadow: `0 10px 30px ${primaryColor}20`
                      }}>
                        <Leaf className="w-6 h-6 animate-[breathe_4s_ease-in-out_infinite]" style={{ color: primaryColor }} />
                      </div>
                    </div>

                    <h3 className="text-2xl font-light text-stone-800 mb-3 tracking-wide">{member.name}</h3>
                    <p className="text-lg font-light tracking-wide" style={{ color: primaryColor }}>{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Wave divider - Outgoing wave with bamboo */}
          <div className="relative w-full h-32 rotate-180">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,25 C300,85 900,15 1200,60 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}08` }} />
              <path d="M0,45 C350,100 850,25 1200,75 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}05` }} />
            </svg>
            {/* Bamboo leaves floating */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute w-1 h-20 rounded-full bg-amber-700/40 animate-[sway_7s_ease-in-out_infinite]" style={{ left: '25%', top: '20%' }} />
              <div className="absolute w-1 h-16 rounded-full bg-amber-700/30 animate-[sway_8s_ease-in-out_infinite]" style={{ left: '65%', top: '30%' }} />
            </div>
          </div>
        </>
      )}

      {/* Wave divider - Multiple layers approaching CTA */}
      <div className="relative w-full h-32">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,20 C400,70 800,10 1200,60 L1200,120 L0,120 Z" style={{ fill: `${primaryColor}08` }} />
          <path d="M0,40 C400,90 800,30 1200,80 L1200,120 L0,120 Z" style={{ fill: `${primaryColor}06` }} />
          <path d="M0,60 C450,100 750,40 1200,95 L1200,120 L0,120 Z" style={{ fill: `${primaryColor}04` }} />
        </svg>
        {/* Water ripples effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-8 h-8 rounded-full border animate-[ripple_3s_ease-out_infinite]" style={{ borderColor: `${primaryColor}30`, left: '20%', top: '40%' }} />
          <div className="absolute w-10 h-10 rounded-full border animate-[ripple_4s_ease-out_infinite]" style={{ borderColor: `${primaryColor}25`, left: '70%', top: '30%' }} />
          <Leaf className="absolute w-6 h-6 animate-[float_10s_ease-in-out_infinite] opacity-25" style={{ color: primaryColor, left: '50%', top: '50%' }} />
        </div>
      </div>

      {/* CTA zen vertical avec breathing circles */}
      <section className="py-48 px-6 relative overflow-hidden">
        {/* Floating leaves throughout CTA */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          {[...Array(8)].map((_, i) => (
            <Leaf
              key={i}
              className="absolute animate-[float_12s_ease-in-out_infinite]"
              style={{
                color: i % 2 === 0 ? primaryColor : secondaryColor,
                top: `${10 + Math.random() * 80}%`,
                left: `${5 + Math.random() * 90}%`,
                width: `${15 + Math.random() * 15}px`,
                height: `${15 + Math.random() * 15}px`,
                animationDelay: `${i * 1.2}s`
              }}
            />
          ))}
        </div>
        {/* Background breathing effect */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full animate-[breathe_10s_ease-in-out_infinite]" style={{
            background: `radial-gradient(circle, ${primaryColor}60, transparent 70%)`,
            filter: 'blur(80px)'
          }} />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Meditation circle visual */}
          <div className="relative inline-block mb-16">
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 animate-[breathe_8s_ease-in-out_infinite]" style={{ borderColor: `${primaryColor}30` }} />
              <div className="absolute inset-3 rounded-full border animate-[breathe_6s_ease-in-out_infinite_1s]" style={{ borderColor: `${primaryColor}20` }} />
              <div className="absolute inset-6 rounded-full border animate-[breathe_4s_ease-in-out_infinite_2s]" style={{ borderColor: `${primaryColor}10` }} />

              <div className="absolute inset-10 rounded-full flex items-center justify-center animate-[breathe_4s_ease-in-out_infinite]" style={{
                background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`
              }}>
                <Leaf className="w-12 h-12" style={{ color: primaryColor }} />
              </div>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-light text-stone-800 mb-8 leading-tight">
            <span className="block mb-4">Le Temps</span>
            <span className="block" style={{ color: primaryColor }}>d'une Pause</span>
          </h2>

          <p className="text-xl text-stone-600 mb-16 font-light leading-relaxed">
            Dans le silence de l'instant présent, retrouvez votre essence
          </p>

          <Link
            href="/booking"
            className="inline-flex items-center gap-4 px-14 py-6 text-white rounded-full font-light text-xl hover:shadow-2xl transition-all hover:scale-105 animate-[breathe_6s_ease-in-out_infinite]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              boxShadow: `0 30px 80px ${primaryColor}40`
            }}
          >
            <Circle className="w-6 h-6" />
            <span>Commencer Votre Rituel</span>
          </Link>

          {/* Bamboo leaves decoration */}
          <div className="mt-20 flex justify-center gap-6 opacity-30">
            <Leaf className="w-8 h-8 animate-[sway_4s_ease-in-out_infinite]" style={{ color: primaryColor }} />
            <Leaf className="w-8 h-8 animate-[sway_4s_ease-in-out_infinite_0.5s]" style={{ color: secondaryColor }} />
            <Leaf className="w-8 h-8 animate-[sway_4s_ease-in-out_infinite_1s]" style={{ color: primaryColor }} />
          </div>
        </div>
      </section>

      {/* Wave divider - Flowing into founder section */}
      <div className="relative w-full h-32 rotate-180">
        <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,30 C350,100 850,20 1200,70 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}08` }} />
          <path d="M0,50 C350,110 850,30 1200,85 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}06` }} />
          <path d="M0,70 C400,120 800,40 1200,100 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}04` }} />
        </svg>
        {/* Zen stones floating */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-6 h-4 rounded-full bg-stone-400/30 animate-[breathe_7s_ease-in-out_infinite]" style={{ left: '18%', top: '35%' }} />
          <div className="absolute w-8 h-5 rounded-full bg-stone-500/25 animate-[breathe_8s_ease-in-out_infinite]" style={{ left: '55%', top: '45%' }} />
          <div className="absolute w-5 h-3 rounded-full bg-stone-400/20 animate-[breathe_6s_ease-in-out_infinite]" style={{ left: '78%', top: '30%' }} />
        </div>
      </div>

      {/* Founder Section - Zen vertical */}
      {organization.founderName && (
        <>
          {/* Wave divider - Entering founder space */}
          <div className="relative w-full h-32">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,15 C350,75 850,25 1200,65 L1200,120 L0,120 Z" style={{ fill: `${primaryColor}08` }} />
              <path d="M0,35 C400,90 800,35 1200,80 L1200,120 L0,120 Z" style={{ fill: `${primaryColor}05` }} />
            </svg>
            {/* Meditation elements */}
            <div className="absolute inset-0 pointer-events-none">
              <Leaf className="absolute w-7 h-7 animate-[float_9s_ease-in-out_infinite] opacity-30" style={{ color: primaryColor, left: '35%', top: '35%' }} />
              <Circle className="absolute w-10 h-10 animate-[breathe_6s_ease-in-out_infinite] opacity-20" style={{ color: primaryColor, left: '65%', top: '45%' }} strokeWidth={1} />
            </div>
          </div>

          <section id="founder" className="py-48 px-6 bg-gradient-to-b from-stone-50 via-white to-stone-50 relative overflow-hidden">
            {/* Floating nature elements in founder section */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              {[...Array(6)].map((_, i) => (
                <Leaf
                  key={i}
                  className="absolute animate-[float_14s_ease-in-out_infinite]"
                  style={{
                    color: i % 2 === 0 ? primaryColor : secondaryColor,
                    top: `${15 + Math.random() * 70}%`,
                    left: `${10 + Math.random() * 80}%`,
                    width: `${18 + Math.random() * 16}px`,
                    height: `${18 + Math.random() * 16}px`,
                    animationDelay: `${i * 2}s`
                  }}
                />
              ))}
              {/* Zen circles */}
              <Circle className="absolute w-20 h-20 animate-[breathe_10s_ease-in-out_infinite] opacity-10" style={{ color: primaryColor, top: '10%', left: '15%' }} strokeWidth={1} />
              <Circle className="absolute w-16 h-16 animate-[breathe_12s_ease-in-out_infinite] opacity-10" style={{ color: secondaryColor, bottom: '15%', right: '20%' }} strokeWidth={1} />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
              <div className="text-center mb-20">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-24 h-px" style={{ background: `linear-gradient(to right, transparent, ${primaryColor}50, transparent)` }} />
                  <Leaf className="w-8 h-8 animate-[breathe_6s_ease-in-out_infinite]" style={{ color: primaryColor }} />
                  <div className="w-24 h-px" style={{ background: `linear-gradient(to right, ${primaryColor}50, transparent)` }} />
                </div>
                <h2 className="text-5xl md:text-6xl font-light text-stone-800 mb-6 tracking-wide">
                  L'Âme de Notre Espace
                </h2>
              </div>

              <div className="space-y-16">
                {organization.founderImage && (
                  <div className="relative mx-auto max-w-md">
                    {/* Breathing circles around image */}
                    <div className="absolute -inset-8 rounded-full border animate-[breathe_8s_ease-in-out_infinite]" style={{
                      borderColor: `${primaryColor}20`
                    }} />
                    <div className="absolute -inset-4 rounded-full border animate-[breathe_6s_ease-in-out_infinite_1s]" style={{
                      borderColor: `${primaryColor}30`
                    }} />

                    <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-2xl" style={{
                      boxShadow: `0 30px 80px ${primaryColor}30`
                    }}>
                      <Image
                        src={organization.founderImage}
                        alt={organization.founderName}
                        width={600}
                        height={600}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Bamboo accents */}
                    <div className="absolute -left-4 top-1/4 text-amber-600/30">
                      <div className="w-1 h-32 bg-current rounded-full" />
                    </div>
                    <div className="absolute -right-4 bottom-1/4 text-amber-600/30">
                      <div className="w-1 h-40 bg-current rounded-full" />
                    </div>
                  </div>
                )}

                <div className="text-center space-y-6">
                  <h3 className="text-4xl md:text-5xl font-light text-stone-800 tracking-wide">
                    {organization.founderName}
                  </h3>
                  {organization.founderTitle && (
                    <p className="text-2xl font-light tracking-wide" style={{ color: primaryColor }}>
                      {organization.founderTitle}
                    </p>
                  )}
                  {organization.founderQuote && (
                    <div className="max-w-2xl mx-auto pt-8">
                      <div className="relative">
                        <Circle className="w-16 h-16 mx-auto mb-6 opacity-20" style={{ color: primaryColor }} strokeWidth={1} />
                        <blockquote className="text-2xl text-stone-600 italic font-light leading-relaxed">
                          "{organization.founderQuote}"
                        </blockquote>
                        <Circle className="w-16 h-16 mx-auto mt-6 opacity-20" style={{ color: primaryColor }} strokeWidth={1} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Wave divider - Final wave to footer */}
          <div className="relative w-full h-32 rotate-180">
            <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,35 C350,95 850,25 1200,70 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}08` }} />
              <path d="M0,55 C400,105 800,35 1200,85 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}06` }} />
              <path d="M0,75 C450,115 750,45 1200,100 L1200,120 L0,120 Z" style={{ fill: `${secondaryColor}04` }} />
            </svg>
            {/* Final zen elements */}
            <div className="absolute inset-0 pointer-events-none">
              <Leaf className="absolute w-6 h-6 animate-[float_8s_ease-in-out_infinite] opacity-25" style={{ color: secondaryColor, left: '25%', top: '40%' }} />
              <Circle className="absolute w-8 h-8 animate-[breathe_7s_ease-in-out_infinite] opacity-15" style={{ color: primaryColor, left: '70%', top: '35%' }} strokeWidth={1} />
              <div className="absolute w-5 h-3 rounded-full bg-stone-400/25 animate-[breathe_6s_ease-in-out_infinite]" style={{ left: '50%', top: '50%' }} />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <TemplateFooter organization={organization} theme="light" />

      {/* Floating Buttons */}
      {organization.phone && (
        <FloatingCallButton phone={organization.phone} primaryColor={primaryColor} />
      )}
      {organization.whatsapp && (
        <FloatingWhatsAppButton whatsapp={organization.whatsapp} />
      )}
      <ScrollToTopButton primaryColor={primaryColor} />
      </div>
    </>
  );
}
