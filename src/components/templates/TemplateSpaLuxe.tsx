'use client';

import Link from 'next/link';
import { Clock, Phone, MapPin, Calendar, Leaf, Sparkles, Heart } from 'lucide-react';
import MobileMenu from './shared/MobileMenu';
import FloatingCallButton from './shared/FloatingCallButton';
import FloatingWhatsAppButton from './shared/FloatingWhatsAppButton';
import ScrollToTopButton from './shared/ScrollToTopButton';
import TemplateFooter from './shared/TemplateFooter';
import HeroMedia from './shared/HeroMedia';

interface TemplateContent {
  hero: {
    badge?: string;
    title: string;
    subtitle?: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary?: string;
  };
  services: {
    title: string;
    description: string;
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
    description: string;
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
    secondaryButton?: string;
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

export default function TemplateSpaLuxe({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor;
  const secondaryColor = organization.secondaryColor;

  const defaultContent: TemplateContent = {
    hero: {
      title: 'Spa & Bien-Être',
      description: organization.description || 'Un havre de paix et de sérénité',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Rituels',
      description: 'Des soins sur mesure pour votre bien-être'
    },
    features: {
      title: 'L\'Expérience',
      items: [
        { title: 'Détente', description: 'Ambiance apaisante' },
        { title: 'Expertise', description: 'Professionnels qualifiés' },
        { title: 'Produits', description: 'Cosmétiques naturels' },
        { title: 'Bien-être', description: 'Approche holistique' }
      ]
    },
    team: {
      title: 'Notre Équipe',
      description: 'Des experts passionnés à votre service'
    },
    testimonials: {
      title: 'Ils nous font confiance',
      items: [
        { name: 'Marie L.', rating: 5, text: 'Un moment de pur bonheur, une équipe aux petits soins.' },
        { name: 'Sophie D.', rating: 5, text: 'Cadre magnifique, prestations exceptionnelles.' },
        { name: 'Laura M.', rating: 5, text: 'Je ressors ressourcée à chaque visite. Merci !' }
      ]
    },
    cta: {
      title: 'Offrez-vous un Moment',
      description: 'Réservez votre parenthèse bien-être',
      button: 'Réserver',
      secondaryButton: 'Nous contacter'
    },
    footer: {
      tagline: '',
      contact: {
        phone: '01 23 45 67 89',
        address: 'Paris'
      },
      hours: 'Lun-Sam 9h-20h'
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
    <div className="min-h-screen bg-black">
      {/* Header luxe avec transparence */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-7 h-7 text-white" style={{ color: primaryColor }} />
              <h1 className="text-2xl font-serif text-white tracking-wider">
                {organization.name}
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <a href="#soins" className="text-sm text-white/80 hover:text-white transition-colors tracking-wide">
                RITUELS
              </a>
              <a href="#experience" className="text-sm text-white/80 hover:text-white transition-colors tracking-wide">
                EXPÉRIENCE
              </a>
              <a href="#equipe" className="text-sm text-white/80 hover:text-white transition-colors tracking-wide">
                ÉQUIPE
              </a>
              <Link
                href="/booking"
                className="px-8 py-3 rounded-none text-white text-sm font-medium tracking-widest border-2 border-white/30 hover:bg-white hover:text-black transition-all duration-300"
              >
                {c.hero.ctaPrimary}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen Immersive */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background media with strong overlay */}
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

        {/* Gradient overlay for extra depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* Centered hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-12 border border-white/20 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" style={{ color: primaryColor }} />
            <span className="text-sm text-white/90 tracking-widest uppercase">Havre de Luxe & Sérénité</span>
          </div>

          <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif mb-8 text-white leading-none tracking-tight">
            {c.hero.title}
          </h2>

          <p className="text-xl md:text-2xl text-white/80 mb-16 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            {c.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/booking"
              className="px-12 py-5 text-white font-medium tracking-widest border-2 border-white/50 hover:bg-white hover:text-black transition-all duration-500 text-lg"
              style={{ borderColor: primaryColor }}
            >
              {c.hero.ctaPrimary}
            </Link>
            {c.hero.ctaSecondary && (
              <a
                href={`tel:${c.footer.contact.phone.replace(/\s/g, '')}`}
                className="px-12 py-5 bg-white/10 backdrop-blur-sm text-white font-medium tracking-widest hover:bg-white/20 transition-all duration-500 text-lg"
              >
                {c.hero.ctaSecondary}
              </a>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce">
          <span className="text-white/60 text-xs tracking-widest uppercase">Découvrir</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/60 to-transparent" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: primaryColor }} />
        <div className="absolute bottom-1/4 right-10 w-40 h-40 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: secondaryColor }} />
      </section>

      {/* Section Divider - Full Width Image */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-800 to-stone-900" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at center, ${primaryColor}, transparent)`
        }} />
      </section>

      {/* Services Section - Full Width with Alternating Layouts */}
      <section id="soins" className="bg-white">
        {/* Section Header */}
        <div className="py-32 px-8 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-8">
            <Heart className="w-12 h-12 mx-auto" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-6xl md:text-7xl font-serif mb-8 tracking-tight" style={{ color: secondaryColor }}>
            {c.services.title}
          </h3>
          <p className="text-xl text-stone-600 leading-relaxed font-light">
            {c.services.description}
          </p>
        </div>

        {/* Service Items - Full Width with Alternating Content */}
        {services.slice(0, 6).map((service, index) => (
          <div key={service.id} className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background gradient placeholder */}
            <div
              className="absolute inset-0"
              style={{
                background: index % 2 === 0
                  ? `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}25)`
                  : `linear-gradient(135deg, ${secondaryColor}15, ${primaryColor}25)`
              }}
            />

            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-8 py-32">
              <div className={`grid md:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                {/* Image Side */}
                <div className={`relative ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="relative aspect-[3/4] overflow-hidden shadow-2xl">
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`
                      }}
                    >
                      <Sparkles className="w-24 h-24 opacity-20" style={{ color: primaryColor }} />
                    </div>
                  </div>

                  {/* Floating decoration */}
                  <div
                    className="absolute -bottom-8 -right-8 w-64 h-64 opacity-20 blur-3xl"
                    style={{ backgroundColor: index % 2 === 0 ? primaryColor : secondaryColor }}
                  />
                </div>

                {/* Content Side */}
                <div className={`${index % 2 === 1 ? 'md:order-1' : ''} space-y-8`}>
                  <div className="inline-flex items-center gap-3 px-6 py-2 border" style={{ borderColor: `${primaryColor}30` }}>
                    <span className="text-sm tracking-widest uppercase text-stone-500">Rituel {index + 1}</span>
                  </div>

                  <h4 className="text-5xl md:text-6xl font-serif leading-tight tracking-tight" style={{ color: secondaryColor }}>
                    {service.name}
                  </h4>

                  <p className="text-xl text-stone-600 leading-relaxed font-light max-w-xl">
                    {service.description || "Une expérience de détente absolue conçue pour harmoniser corps et esprit dans un cadre luxueux."}
                  </p>

                  <div className="flex items-center gap-12 pt-8">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-stone-400" />
                      <div>
                        <div className="text-sm text-stone-500 uppercase tracking-wide">Durée</div>
                        <div className="text-2xl font-serif" style={{ color: primaryColor }}>{service.duration} min</div>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-stone-300" />
                    <div>
                      <div className="text-sm text-stone-500 uppercase tracking-wide">Tarif</div>
                      <div className="text-4xl font-serif" style={{ color: primaryColor }}>{service.price}€</div>
                    </div>
                  </div>

                  <Link
                    href={`/booking?service=${service.id}`}
                    className="inline-block px-12 py-5 text-white font-medium tracking-widest transition-all duration-500 hover:shadow-2xl hover:scale-105 mt-8"
                    style={{ backgroundColor: primaryColor }}
                  >
                    RÉSERVER CE RITUEL
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Section Divider */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-black" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at center, ${secondaryColor}, transparent)`
        }} />
      </section>

      {/* L'Expérience - Large Immersive Cards */}
      {c.features && (
        <section id="experience" className="bg-black py-32">
          <div className="max-w-7xl mx-auto px-8">
            {/* Section Header */}
            <div className="text-center mb-24">
              <h3 className="text-6xl md:text-7xl font-serif text-white mb-6 tracking-tight">
                {c.features.title}
              </h3>
              <p className="text-xl text-white/60 font-light">Une approche holistique du bien-être</p>
            </div>

            {/* Experience Cards - Large Format */}
            <div className="grid md:grid-cols-2 gap-8">
              {c.features.items.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden cursor-pointer"
                >
                  {/* Background with gradient */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                      style={{
                        background: idx % 2 === 0
                          ? `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)`
                          : `linear-gradient(135deg, ${secondaryColor}30, ${primaryColor}30)`
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Icon */}
                    <div className="absolute top-8 left-8">
                      <div className="w-20 h-20 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm transition-all duration-500 group-hover:border-white/60 group-hover:scale-110">
                        <Leaf className="w-10 h-10 text-white" style={{ color: primaryColor }} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h4 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-tight transition-transform duration-500 group-hover:translate-x-2">
                        {item.title}
                      </h4>
                      <p className="text-lg text-white/80 font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{
                      background: `radial-gradient(circle at top right, ${primaryColor}, transparent)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Divider */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white to-stone-100" />
      </section>

      {/* Équipe - Large Format with Immersive Layout */}
      {team && team.length > 0 && c.team && (
        <section id="equipe" className="bg-white py-32 px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-24">
              <h3 className="text-6xl md:text-7xl font-serif mb-8 tracking-tight" style={{ color: secondaryColor }}>
                {c.team.title}
              </h3>
              <p className="text-xl text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
                {c.team.description}
              </p>
            </div>

            {/* Team Grid - Large Cards */}
            <div className="grid md:grid-cols-3 gap-12">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="group">
                  <div className="relative overflow-hidden mb-8">
                    <div
                      className="aspect-[3/4] relative overflow-hidden transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#f5f5f4'
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-8xl font-serif text-stone-300">
                            {member.name.charAt(0)}
                          </div>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                      {/* Hover Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <p className="text-2xl font-serif text-white mb-2">{member.name}</p>
                        <p className="text-white/90 tracking-wide">{member.role}</p>
                      </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -bottom-4 -right-4 w-48 h-48 opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700" style={{ backgroundColor: primaryColor }} />
                  </div>

                  {/* Info Below */}
                  <div className="text-center space-y-2">
                    <h4 className="text-2xl font-serif tracking-tight" style={{ color: secondaryColor }}>
                      {member.name}
                    </h4>
                    <p className="text-stone-500 tracking-wide uppercase text-sm">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Divider */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 to-stone-800" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at center, ${primaryColor}, transparent)`
        }} />
      </section>

      {/* Témoignages - Luxury Magazine Style */}
      {c.testimonials && (
        <section className="bg-stone-900 py-32 px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-24">
              <h3 className="text-6xl md:text-7xl font-serif text-white mb-6 tracking-tight">
                {c.testimonials.title}
              </h3>
              <p className="text-xl text-white/60 font-light">Expériences vécues par nos clients</p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-3 gap-12">
              {c.testimonials.items.map((review, idx) => (
                <div key={idx} className="group relative">
                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-10 transition-all duration-500 hover:bg-white/10 hover:border-white/20">
                    {/* Quote mark */}
                    <div className="absolute top-6 left-6 text-6xl font-serif opacity-10" style={{ color: primaryColor }}>
                      "
                    </div>

                    {/* Stars */}
                    <div className="flex gap-2 mb-8 relative z-10">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Sparkles key={i} className="w-5 h-5" style={{ color: primaryColor }} />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-white/90 mb-8 leading-relaxed text-lg font-light italic relative z-10">
                      {review.text}
                    </p>

                    {/* Name */}
                    <div className="relative z-10">
                      <p className="text-white font-medium tracking-widest uppercase text-sm">
                        {review.name}
                      </p>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{
                      background: `radial-gradient(circle at bottom right, ${primaryColor}, transparent)`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final - Full Screen Immersive */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-stone-900 to-black" />
        <div className="absolute inset-0 opacity-20" style={{
          background: `radial-gradient(circle at center, ${primaryColor}, transparent)`
        }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center px-8 py-32">
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-12 border border-white/20 backdrop-blur-sm">
            <Heart className="w-5 h-5 text-white" style={{ color: primaryColor }} />
            <span className="text-sm text-white/90 tracking-widest uppercase">Votre Moment</span>
          </div>

          <h3 className="text-6xl md:text-8xl font-serif text-white mb-12 tracking-tight leading-none">
            {c.cta.title}
          </h3>

          <p className="text-2xl text-white/70 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            {c.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/booking"
              className="px-16 py-6 text-white text-lg font-medium tracking-widest border-2 hover:bg-white hover:text-black transition-all duration-500"
              style={{ borderColor: primaryColor }}
            >
              {c.cta.button}
            </Link>
            {c.cta.secondaryButton && (
              <a
                href={`tel:${c.footer.contact.phone.replace(/\s/g, '')}`}
                className="px-16 py-6 bg-white/10 backdrop-blur-sm text-white text-lg font-medium tracking-widest hover:bg-white/20 transition-all duration-500"
              >
                {c.cta.secondaryButton}
              </a>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: primaryColor }} />
        <div className="absolute top-20 right-20 w-56 h-56 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: secondaryColor }} />
      </section>
      {/* Founder Section - Luxury Magazine Layout */}
      {organization.founderName && (
        <section id="founder" className="relative min-h-screen flex items-center bg-white py-32 px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              {/* Image Side */}
              {organization.founderImage && (
                <div className="relative">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={organization.founderImage}
                      alt={organization.founderName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 opacity-10 blur-3xl" style={{ backgroundColor: primaryColor }} />
                  <div className="absolute -top-8 -left-8 w-48 h-48 opacity-10 blur-3xl" style={{ backgroundColor: secondaryColor }} />
                </div>
              )}

              {/* Content Side */}
              <div className={!organization.founderImage ? 'md:col-span-2 text-center max-w-4xl mx-auto' : 'space-y-8'}>
                <div className="inline-flex items-center gap-3 px-6 py-2 border" style={{ borderColor: `${primaryColor}30` }}>
                  <span className="text-sm tracking-widest uppercase text-stone-500">Fondatrice</span>
                </div>

                <h3 className="text-5xl md:text-6xl font-serif tracking-tight" style={{ color: secondaryColor }}>
                  {organization.founderName}
                </h3>

                {organization.founderTitle && (
                  <p className="text-2xl font-light tracking-wide" style={{ color: primaryColor }}>
                    {organization.founderTitle}
                  </p>
                )}

                {organization.founderQuote && (
                  <blockquote className="text-xl md:text-2xl text-stone-600 italic leading-relaxed font-light border-l-2 pl-8 py-4" style={{ borderColor: primaryColor }}>
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

      {/* Footer */}
      <TemplateFooter organization={organization} theme="dark" />
    </div>
  );
}
