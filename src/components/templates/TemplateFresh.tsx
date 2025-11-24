'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseTemplateContent } from '@/types/template-content';
import { Clock, Triangle, Circle, Zap, Star, Sparkles } from 'lucide-react';
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

export default function TemplateFresh({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Fraîcheur & Dynamisme',
      description: organization.description || 'Une beauté éclatante et moderne',
      ctaPrimary: 'C\'est parti !',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Soins Énergisants',
      description: 'Des soins qui vous redonnent de l\'éclat'
    },
    cta: {
      title: 'On Se Lance ?',
      description: 'Prenez votre rendez-vous maintenant',
      button: 'Réserver Mon Soin'
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

  // Memphis design colors
  const memphisColors = {
    cyan: '#00D9FF',
    pink: '#FF006E',
    yellow: '#FFBE0B',
    purple: '#8338EC',
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header Memphis Style */}
      <header className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 shadow-lg sticky top-0 z-50 border-b-8 border-black">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {organization.logoUrl ? (
                <div className="bg-white p-2 rotate-3 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Image
                    src={organization.logoUrl}
                    alt={organization.name}
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                    priority
                  />
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-yellow-300 border-4 border-black flex items-center justify-center rotate-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <Star className="w-7 h-7 text-black" />
                  </div>
                  <div className="bg-white px-4 py-2 -rotate-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h1 className="text-2xl font-black text-black uppercase tracking-tight">
                      {organization.name}
                    </h1>
                  </div>
                </>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-4">
              {menuItems.map((item, idx) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 font-black text-black hover:text-white transition-all hover:scale-110 uppercase text-sm border-3 border-black bg-white hover:bg-black"
                  style={{
                    transform: `rotate(${idx % 2 === 0 ? '2deg' : '-2deg'})`
                  }}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/booking"
                className="px-8 py-3 font-black text-black bg-yellow-300 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 uppercase rotate-2"
              >
                RÉSERVER! 🎉
              </Link>
            </nav>
            <div className="md:hidden">
              <MobileMenu menuItems={menuItems} primaryColor={organization.primaryColor} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Memphis Design with Diagonal Stripes */}
      <section className="pt-20 pb-24 px-6 relative overflow-hidden bg-gradient-to-br from-cyan-100 via-pink-100 to-yellow-100">
        {/* Background media (video or image) */}
        {(organization.heroVideo || organization.heroImage) && (
          <HeroMedia
            videoUrl={organization.heroVideo}
            imageUrl={organization.heroImage}
            alt={`${organization.name} hero`}
            priority
            overlay
            overlayOpacity={0.7}
          />
        )}

        {/* Memphis geometric shapes and patterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Diagonal stripes background */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #00D9FF 0px, #00D9FF 20px, #FF006E 20px, #FF006E 40px, #FFBE0B 40px, #FFBE0B 60px, #8338EC 60px, #8338EC 80px)',
            backgroundSize: '200% 200%'
          }} />

          {/* Floating geometric shapes */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400 rounded-full border-8 border-black opacity-80 animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute top-40 right-20 w-24 h-24 bg-pink-400 rotate-45 border-8 border-black opacity-70" />
          <div className="absolute bottom-32 left-32 w-20 h-40 bg-yellow-300 border-8 border-black opacity-60 rotate-12" />
          <Triangle className="absolute top-20 right-40 w-28 h-28 text-purple-500 opacity-70 -rotate-45" strokeWidth={8} />
          <Circle className="absolute bottom-20 right-10 w-36 h-36 text-cyan-500 opacity-50" strokeWidth={10} />

          {/* Zigzag lines */}
          <svg className="absolute top-1/2 left-0 w-full opacity-30" height="100" viewBox="0 0 1200 100">
            <path d="M0,50 L50,10 L100,50 L150,10 L200,50 L250,10 L300,50 L350,10 L400,50 L450,10 L500,50 L550,10 L600,50 L650,10 L700,50 L750,10 L800,50 L850,10 L900,50 L950,10 L1000,50 L1050,10 L1100,50 L1150,10 L1200,50" stroke="#000" strokeWidth="6" fill="none"/>
          </svg>

          {/* Squiggly lines */}
          <svg className="absolute bottom-10 right-0 w-64 h-64 opacity-40" viewBox="0 0 200 200">
            <path d="M10,100 Q30,80 50,100 T90,100 T130,100 T170,100" stroke="#FF006E" strokeWidth="8" fill="none"/>
            <path d="M10,120 Q30,100 50,120 T90,120 T130,120 T170,120" stroke="#00D9FF" strokeWidth="8" fill="none"/>
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            {/* Memphis badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-300 border-6 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10 rotate-2">
              <Sparkles className="w-6 h-6 text-black" />
              <span className="text-lg font-black text-black uppercase">✨ BEAUTÉ & Fun! ✨</span>
            </div>

            {/* Main title with Memphis style */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-none">
              <span className="block text-black -rotate-2 inline-block bg-cyan-300 px-8 py-4 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-6 uppercase">
                RÉVÉLEZ
              </span>
              <br />
              <span className="block text-white rotate-1 inline-block bg-pink-500 px-8 py-4 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-6 uppercase">
                VOTRE
              </span>
              <br />
              <span className="block text-black rotate-2 inline-block bg-yellow-300 px-8 py-4 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] uppercase">
                ÉCLAT! 🌟
              </span>
            </h1>

            <div className="bg-white border-6 border-black px-8 py-6 max-w-2xl mx-auto rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
              <p className="text-2xl text-black font-black uppercase">
                {organization.description || "Un institut moderne et dynamique où beauté rime avec bonne humeur! 💅"}
              </p>
            </div>

            {/* Memphis CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/booking"
                className="px-12 py-5 font-black text-2xl text-black bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-300 border-6 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 uppercase -rotate-2"
              >
                JE RÉSERVE! 🎉
              </Link>
              <Link
                href="#services"
                className="px-12 py-5 font-black text-2xl text-white bg-purple-600 border-6 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 uppercase rotate-2"
              >
                DÉCOUVRIR! ✨
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom zigzag divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="w-full h-20" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,0 L60,100 L120,0 L180,100 L240,0 L300,100 L360,0 L420,100 L480,0 L540,100 L600,0 L660,100 L720,0 L780,100 L840,0 L900,100 L960,0 L1020,100 L1080,0 L1140,100 L1200,0 L1200,100 L0,100 Z" fill="#fff" stroke="#000" strokeWidth="6"/>
          </svg>
        </div>
      </section>

      {/* Services Memphis Style - 4 Column Grid */}
      <section id="services" className="py-20 px-6 bg-white relative">
        {/* Floating shapes decoration */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-purple-400 rounded-full border-6 border-black opacity-30" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-cyan-300 rotate-45 border-6 border-black opacity-20" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-3 bg-pink-400 border-5 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 -rotate-2">
              <span className="text-lg font-black text-white uppercase">⚡ NOS SOINS ⚡</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black mb-6 text-black uppercase">
              <span className="inline-block bg-yellow-300 px-6 py-3 border-6 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rotate-1">
                C'EST PARTI!
              </span>
            </h2>
            <p className="text-2xl text-black font-black uppercase">Choisissez votre moment de bonheur! 💖</p>
          </div>

          {/* 4-column grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {services.slice(0, 8).map((service, idx) => {
              // Rotate through Memphis colors
              const colors = [
                { bg: 'bg-cyan-300', text: 'text-black', border: 'border-black' },
                { bg: 'bg-pink-400', text: 'text-white', border: 'border-black' },
                { bg: 'bg-yellow-300', text: 'text-black', border: 'border-black' },
                { bg: 'bg-purple-500', text: 'text-white', border: 'border-black' },
              ];
              const colorScheme = colors[idx % 4];

              // Alternate rotation
              const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
              const rotation = rotations[idx % 4];

              return (
                <Link
                  key={service.id}
                  href={`/booking?service=${service.id}`}
                  className={`group relative ${colorScheme.bg} ${colorScheme.text} border-5 ${colorScheme.border} p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 ${rotation}`}
                >
                  {/* Diagonal line decoration */}
                  <div className="absolute top-0 right-0 w-full h-1 bg-black transform rotate-45 origin-top-right" />

                  {/* Number badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-black text-white border-4 border-white flex items-center justify-center font-black text-xl rotate-12 shadow-lg">
                    {idx + 1}
                  </div>

                  <div className="mb-4 min-h-[120px]">
                    <h3 className={`text-xl font-black mb-3 uppercase leading-tight ${colorScheme.text}`}>
                      {service.name}
                    </h3>
                    <p className={`text-sm font-bold ${colorScheme.text} opacity-90`}>
                      {service.description || "Un soin parfait pour vous! ✨"}
                    </p>
                  </div>

                  <div className={`pt-4 border-t-4 ${colorScheme.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-black text-sm">{service.duration}min</span>
                    </div>
                    <div className="text-3xl font-black">
                      {service.price}€
                    </div>
                  </div>

                  {/* Emoji decoration */}
                  <div className="absolute bottom-2 left-2 text-2xl opacity-70">
                    {['✨', '💅', '🌟', '💖'][idx % 4]}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View all button */}
          {services.length > 8 && (
            <div className="text-center mt-12">
              <Link
                href="/booking"
                className="inline-block px-10 py-4 bg-black text-white border-5 border-black shadow-[8px_8px_0px_0px_#00D9FF] hover:shadow-[10px_10px_0px_0px_#00D9FF] transition-all font-black text-xl uppercase rotate-1"
              >
                VOIR TOUT! 🎉
              </Link>
            </div>
          )}
        </div>

        {/* Bottom zigzag */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="w-full h-12 opacity-20" viewBox="0 0 1200 50" preserveAspectRatio="none">
            <path d="M0,25 L30,5 L60,25 L90,5 L120,25 L150,5 L180,25 L210,5 L240,25 L270,5 L300,25 L330,5 L360,25 L390,5 L420,25 L450,5 L480,25 L510,5 L540,25 L570,5 L600,25 L630,5 L660,25 L690,5 L720,25 L750,5 L780,25 L810,5 L840,25 L870,5 L900,25 L930,5 L960,25 L990,5 L1020,25 L1050,5 L1080,25 L1110,5 L1140,25 L1170,5 L1200,25" stroke="#000" strokeWidth="4" fill="none"/>
          </svg>
        </div>
      </section>

      {/* Team Section Memphis Style */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-20 px-6 bg-gradient-to-br from-yellow-100 via-pink-100 to-cyan-100 relative overflow-hidden">
          {/* Memphis decorations */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-purple-400 rounded-full border-8 border-black opacity-20" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-400 rotate-45 border-8 border-black opacity-20" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-6 py-3 bg-cyan-400 border-5 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 rotate-2">
                <span className="text-lg font-black text-black uppercase">👥 NOTRE TEAM 👥</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black mb-6 text-black uppercase">
                <span className="inline-block bg-pink-400 text-white px-6 py-3 border-6 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                  AU TOP!
                </span>
              </h2>
              <p className="text-2xl text-black font-black uppercase">Des pros sympas et à l'écoute! ✨</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {team.slice(0, 3).map((member, idx) => {
                const bgColors = ['bg-cyan-300', 'bg-pink-400', 'bg-yellow-300'];
                const rotations = ['rotate-2', '-rotate-1', 'rotate-1'];

                return (
                  <div key={member.id} className={`group text-center ${rotations[idx]}`}>
                    <div className="relative mb-6">
                      {/* Memphis frame */}
                      <div className={`absolute -inset-4 ${bgColors[idx]} border-8 border-black opacity-30 blur-sm`} />
                      <div
                        className="relative w-56 h-56 mx-auto overflow-hidden border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:-translate-y-2"
                        style={{
                          background: member.imageUrl
                            ? `url(${member.imageUrl}) center/cover`
                            : bgColors[idx]
                        }}
                      >
                        {!member.imageUrl && (
                          <div className="flex items-center justify-center h-full text-8xl font-black text-black">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Memphis badge */}
                      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-black text-white border-4 border-white flex items-center justify-center font-black text-2xl rotate-12 shadow-lg">
                        {idx + 1}
                      </div>
                    </div>
                    <div className={`bg-white border-5 border-black p-4 ${bgColors[idx]} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}>
                      <h3 className="text-2xl font-black text-black mb-2 uppercase">{member.name}</h3>
                      <p className="font-black text-black text-lg">
                        {member.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Squiggly lines */}
          <svg className="absolute top-1/2 left-0 w-full opacity-20" height="100" viewBox="0 0 1200 100">
            <path d="M0,50 Q30,20 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T420,50 T480,50 T540,50 T600,50 T660,50 T720,50 T780,50 T840,50 T900,50 T960,50 T1020,50 T1080,50 T1140,50 T1200,50" stroke="#000" strokeWidth="6" fill="none"/>
          </svg>
        </section>
      )}

      {/* CTA Memphis Style */}
      <section className="py-24 px-6 relative overflow-hidden bg-white">
        {/* Memphis pattern background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, #000 10px, #000 11px)'
        }} />

        {/* Floating shapes */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-cyan-400 rounded-full border-8 border-black opacity-40 animate-pulse" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-300 rotate-45 border-8 border-black opacity-40" />
        <div className="absolute bottom-10 left-1/4 w-24 h-48 bg-pink-400 border-8 border-black opacity-30 rotate-12" />
        <Triangle className="absolute bottom-20 right-1/3 w-32 h-32 text-purple-500 opacity-40 rotate-45" strokeWidth={8} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Starburst icon */}
          <div className="inline-block mb-8 relative">
            <div className="w-32 h-32 bg-yellow-300 border-8 border-black flex items-center justify-center rotate-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-20 h-20 text-black" />
            </div>
          </div>

          {/* Main CTA text */}
          <h2 className="text-7xl md:text-8xl font-black mb-8 leading-none">
            <span className="inline-block bg-gradient-to-r from-cyan-300 via-pink-400 to-yellow-300 text-black px-8 py-4 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] uppercase rotate-1 mb-4">
              C'EST PARTI!
            </span>
          </h2>

          <div className="bg-black text-white px-8 py-6 border-8 border-black shadow-[10px_10px_0px_0px_#00D9FF] max-w-3xl mx-auto -rotate-1 mb-12">
            <p className="text-3xl font-black uppercase">
              Réservez en 2 minutes chrono! ⚡
            </p>
          </div>

          {/* Mega CTA button */}
          <Link
            href="/booking"
            className="inline-flex items-center gap-4 px-16 py-6 font-black text-3xl text-black bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 border-8 border-black shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] hover:shadow-[18px_18px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 uppercase rotate-2"
          >
            <Sparkles className="w-10 h-10" />
            JE FONCE RÉSERVER! 🎉
            <Star className="w-10 h-10" />
          </Link>

          {/* Decorative emojis */}
          <div className="mt-12 text-6xl space-x-8">
            <span className="inline-block animate-bounce" style={{ animationDelay: '0s' }}>💅</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>💖</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</span>
          </div>
        </div>

        {/* Bottom zigzag divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="w-full h-16" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M0,0 L60,100 L120,0 L180,100 L240,0 L300,100 L360,0 L420,100 L480,0 L540,100 L600,0 L660,100 L720,0 L780,100 L840,0 L900,100 L960,0 L1020,100 L1080,0 L1140,100 L1200,0 L1200,100 L0,100 Z" fill="#000" opacity="0.1"/>
          </svg>
        </div>
      </section>

      {/* Founder Section Memphis Style */}
      {organization.founderName && (
        <section id="founder" className="py-20 px-6 bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-100 relative overflow-hidden">
          {/* Memphis decorations */}
          <Circle className="absolute top-10 right-10 w-40 h-40 text-cyan-400 opacity-20" strokeWidth={8} />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-pink-400 rotate-45 border-8 border-black opacity-20" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {organization.founderImage && (
                <div className="relative">
                  {/* Memphis frame */}
                  <div className="absolute -inset-6 bg-yellow-300 border-8 border-black opacity-30 rotate-3" />
                  <div className="relative border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <Image
                      src={organization.founderImage}
                      alt={organization.founderName}
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  {/* Star decoration */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-pink-400 border-6 border-black flex items-center justify-center rotate-12 shadow-lg">
                    <Star className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
              <div className={!organization.founderImage ? 'md:col-span-2 text-center' : ''}>
                <div className="inline-block px-6 py-3 bg-purple-500 text-white border-5 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8 -rotate-2">
                  <span className="text-lg font-black uppercase">⭐ FONDATRICE ⭐</span>
                </div>
                <h3 className="text-5xl md:text-6xl font-black text-black mb-6 uppercase">
                  <span className="inline-block bg-cyan-300 px-6 py-3 border-6 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rotate-1">
                    {organization.founderName}
                  </span>
                </h3>
                {organization.founderTitle && (
                  <div className="bg-pink-400 text-white px-6 py-3 border-5 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block mb-8 -rotate-1">
                    <p className="text-2xl font-black uppercase">
                      {organization.founderTitle}
                    </p>
                  </div>
                )}
                {organization.founderQuote && (
                  <div className="bg-white border-6 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1">
                    <blockquote className="text-2xl text-black font-black leading-relaxed">
                      "{organization.founderQuote}"
                    </blockquote>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Squiggly lines decoration */}
          <svg className="absolute bottom-0 left-0 w-full opacity-20" height="100" viewBox="0 0 1200 100">
            <path d="M0,50 Q30,20 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T420,50 T480,50 T540,50 T600,50 T660,50 T720,50 T780,50 T840,50 T900,50 T960,50 T1020,50 T1080,50 T1140,50 T1200,50" stroke="#000" strokeWidth="6" fill="none"/>
          </svg>
        </section>
      )}

      {/* Footer */}
      <TemplateFooter organization={organization} theme="light" />

      {/* Floating Buttons */}
      {organization.phone && (
        <FloatingCallButton phone={organization.phone} primaryColor={organization.primaryColor} />
      )}
      {organization.whatsapp && (
        <FloatingWhatsAppButton whatsapp={organization.whatsapp} />
      )}
      <ScrollToTopButton primaryColor={organization.primaryColor} />
    </div>
  );
}
