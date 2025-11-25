'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseTemplateContent } from '@/types/template-content';
import { Clock, Star, Heart, ShoppingBag, Gift, Sparkles, Tag } from 'lucide-react';
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

export default function TemplateBoutique({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Beauté Chic & Raffinée',
      description: organization.description || 'Votre boutique beauté de luxe',
      ctaPrimary: 'Découvrir',
      ctaSecondary: 'Réserver'
    },
    services: {
      title: 'Nos Soins',
      description: 'Une sélection raffinée de soins beauté'
    },
    cta: {
      title: 'Venez Nous Rencontrer',
      description: 'Réservez votre moment privilégié',
      button: 'Prendre Rendez-vous'
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header Boutique - Shop Style */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-pink-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" style={{ color: organization.primaryColor }} />
              {organization.logoUrl ? (
                <Image
                  src={organization.logoUrl}
                  alt={organization.name}
                  width={100}
                  height={40}
                  className="h-10 w-auto object-contain"
                  priority
                />
              ) : (
                <h1 className="text-2xl font-serif italic" style={{ color: organization.secondaryColor }}>
                  {organization.name}
                </h1>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
              <Link
                href="/booking"
                className="px-8 py-2.5 rounded-full font-medium text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                style={{ backgroundColor: organization.primaryColor }}
              >
                <Heart className="w-4 h-4" />
                Réserver
              </Link>
            </nav>
            <div className="md:hidden">
              <MobileMenu organization={organization} menuItems={menuItems} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Product Showcase Split Layout */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 relative z-10">
              {/* New Arrivals Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-lg border border-pink-200">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-semibold text-pink-600">Nouvelles Créations</span>
              </div>

              {/* Script Font Title */}
              <h1 className="text-6xl md:text-7xl font-serif italic leading-tight" style={{ color: organization.secondaryColor }}>
                Découvrez notre
                <br />
                <span className="text-7xl md:text-8xl font-bold not-italic bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Collection
                </span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                {organization.description || "Une sélection raffinée de soins et produits beauté, pensée avec amour pour sublimer votre beauté naturelle"}
              </p>

              <div className="flex items-center gap-4 pt-4">
                <Link
                  href="/booking"
                  className="px-10 py-4 rounded-full font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Explorer la boutique
                </Link>
                <button className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-pink-200">
                  <Heart className="w-6 h-6" style={{ color: organization.primaryColor }} />
                </button>
              </div>

              {/* Hearts decoration */}
              <div className="flex items-center gap-6 pt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Heart
                    key={i}
                    className="w-5 h-5 animate-pulse"
                    style={{
                      color: organization.primaryColor,
                      fill: i <= 3 ? organization.primaryColor : 'transparent',
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
                <span className="text-sm text-gray-500 italic">Aimé par nos clientes</span>
              </div>
            </div>

            {/* Right: Product Grid 2x2 */}
            <div className="grid grid-cols-2 gap-4 relative">
              {services.slice(0, 4).map((service, idx) => (
                <Link
                  key={service.id}
                  href={`/booking?service=${service.id}`}
                  className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-pink-100"
                  style={{ height: idx === 1 || idx === 2 ? '280px' : '240px' }}
                >
                  {/* Best Seller Badge */}
                  {idx === 0 && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-10">
                      ⭐ Best Seller
                    </div>
                  )}

                  {/* Heart Icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-6 h-6 text-pink-500 hover:fill-pink-500 cursor-pointer" />
                  </div>

                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center" style={{
                        background: `linear-gradient(135deg, ${organization.primaryColor}20, ${organization.secondaryColor}20)`
                      }}>
                        <Sparkles className="w-8 h-8" style={{ color: organization.primaryColor }} />
                      </div>
                      <h3 className="text-lg font-serif font-semibold mb-2 line-clamp-2" style={{ color: organization.secondaryColor }}>
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {service.description || "Un soin d'exception"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <div className="text-2xl font-bold" style={{ color: organization.primaryColor }}>
                        {service.price}€
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration}min
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section - Pinterest Masonry Grid */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-md border border-pink-200 mb-6">
              <Tag className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-semibold text-pink-600">Collections</span>
            </div>
            <h2 className="text-5xl font-serif italic mb-4" style={{ color: organization.secondaryColor }}>
              Nos Trésors Beauté
            </h2>
            <p className="text-gray-600 text-lg">Découvrez notre sélection Pinterest-style</p>
          </div>

          {/* Pinterest Masonry Layout */}
          <div className="md:columns-2 lg:columns-3 gap-6 space-y-6">
            {services.map((service, idx) => {
              // Variable heights for Pinterest effect
              const heights = ['h-64', 'h-80', 'h-72', 'h-96', 'h-64', 'h-88', 'h-72', 'h-80'];
              const cardHeight = heights[idx % heights.length];

              return (
                <div
                  key={service.id}
                  className="break-inside-avoid mb-6"
                >
                  <Link
                    href={`/booking?service=${service.id}`}
                    className={`group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-pink-100 block ${cardHeight} overflow-hidden`}
                  >
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {idx % 3 === 0 && (
                        <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Best Seller
                        </span>
                      )}
                      {idx % 4 === 0 && (
                        <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          🎁 Nouveau
                        </span>
                      )}
                    </div>

                    {/* Heart Icon */}
                    <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110">
                      <Heart className="w-5 h-5 text-pink-500 hover:fill-pink-500" />
                    </button>

                    {/* Decorative gradient background */}
                    <div
                      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex-1">
                        {/* Icon */}
                        <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center shadow-lg" style={{
                          background: `linear-gradient(135deg, ${organization.primaryColor}30, ${organization.secondaryColor}30)`
                        }}>
                          <Sparkles className="w-10 h-10" style={{ color: organization.primaryColor }} />
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-serif font-bold mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors" style={{ color: organization.secondaryColor }}>
                          {service.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {service.description || "Un moment unique de détente et de beauté, spécialement conçu pour vous"}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-pink-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration}min</span>
                        </div>
                        <div className="text-3xl font-bold" style={{ color: organization.primaryColor }}>
                          {service.price}€
                        </div>
                      </div>

                      {/* Add to Cart Style Button */}
                      <button
                        className="mt-4 w-full py-3 rounded-full font-semibold text-white shadow-md group-hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Réserver ce soin
                      </button>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gift Cards Promotional Banner */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-3xl p-12 overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

            <div className="relative z-10 text-center text-white">
              <Gift className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-serif italic mb-4">
                Cartes Cadeaux Disponibles
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Offrez un moment de beauté et de bien-être à vos proches
              </p>
              <Link
                href="/booking"
                className="inline-block px-10 py-4 bg-white text-pink-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Découvrir nos coffrets
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Boutique Style */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-20 px-6 bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-md border border-pink-200 mb-6">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-semibold text-pink-600">Notre Équipe</span>
              </div>
              <h2 className="text-5xl font-serif italic mb-4" style={{ color: organization.secondaryColor }}>
                Les Artistes de votre Beauté
              </h2>
              <p className="text-gray-600 text-lg">Des expertes passionnées à votre service</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.slice(0, 3).map((member, idx) => (
                <div key={member.id} className="group relative">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-pink-100">
                    {/* Profile Image */}
                    <div className="relative mb-6 mx-auto w-40 h-40">
                      <div
                        className="w-full h-full rounded-full overflow-hidden border-4 border-pink-100 shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: member.imageUrl
                            ? `url(${member.imageUrl}) center/cover`
                            : `linear-gradient(135deg, ${organization.primaryColor}30, ${organization.secondaryColor}30)`
                        }}
                      >
                        {!member.imageUrl && (
                          <div className="flex items-center justify-center h-full text-5xl font-serif text-gray-300">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Decorative heart badge */}
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Heart className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="text-center">
                      <h3 className="text-2xl font-serif font-bold mb-2" style={{ color: organization.secondaryColor }}>
                        {member.name}
                      </h3>
                      <p className="text-pink-600 font-medium mb-4 italic">{member.role}</p>

                      {/* Rating stars */}
                      <div className="flex justify-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-sm text-gray-600 italic">
                        "Votre beauté est ma passion"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Shop Style */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white rounded-3xl p-16 shadow-2xl overflow-hidden border-2 border-pink-100">
            {/* Decorative hearts background */}
            <div className="absolute top-10 right-10 opacity-10">
              <Heart className="w-32 h-32 text-pink-500 fill-pink-500" />
            </div>
            <div className="absolute bottom-10 left-10 opacity-10">
              <Heart className="w-24 h-24 text-purple-500 fill-purple-500" />
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-semibold text-pink-600">Réservation en Ligne</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-serif italic mb-6" style={{ color: organization.secondaryColor }}>
                Offrez-vous un moment
                <br />
                <span className="text-6xl md:text-7xl font-bold not-italic bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Rien que pour Vous
                </span>
              </h2>

              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Réservez votre rendez-vous beauté en quelques clics et laissez nos expertes prendre soin de vous
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/booking"
                  className="px-12 py-5 rounded-full font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-3 text-lg"
                  style={{ background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})` }}
                >
                  <ShoppingBag className="w-6 h-6" />
                  Prendre Rendez-vous
                </Link>
                <button className="px-12 py-5 rounded-full font-bold bg-white border-2 border-pink-200 text-pink-600 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3 text-lg">
                  <Heart className="w-6 h-6" />
                  Carte Cadeau
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-2 mt-10">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${organization.primaryColor}${60 + i * 10}, ${organization.secondaryColor}${60 + i * 10})`
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 ml-4">
                  <span className="font-bold text-pink-600">500+</span> clientes satisfaites
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section - Boutique Style */}
      {organization.founderName && (
        <section id="founder" className="py-20 px-6 bg-gradient-to-br from-pink-50 via-white to-purple-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {organization.founderImage && (
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-pink-200 rounded-full opacity-50 blur-2xl"></div>
                  <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-purple-200 rounded-full opacity-50 blur-2xl"></div>
                  <div className="relative">
                    <Image
                      src={organization.founderImage}
                      alt={organization.founderName}
                      width={600}
                      height={800}
                      className="rounded-3xl w-full h-auto object-cover shadow-2xl border-4 border-white"
                    />
                    {/* Heart decoration */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                      <Heart className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                </div>
              )}
              <div className={!organization.founderImage ? 'md:col-span-2 text-center' : ''}>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border-2 border-pink-200 mb-8 shadow-md">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-bold text-pink-600">Fondatrice</span>
                </div>

                <h3 className="text-4xl md:text-5xl font-serif italic mb-4" style={{ color: organization.secondaryColor }}>
                  {organization.founderName}
                </h3>

                {organization.founderTitle && (
                  <p className="text-xl font-semibold mb-8 text-pink-600">
                    {organization.founderTitle}
                  </p>
                )}

                {organization.founderQuote && (
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 text-6xl text-pink-200 font-serif">"</div>
                    <blockquote className="text-2xl text-gray-700 italic leading-relaxed pl-8 pr-4 py-6 border-l-4 border-pink-300 bg-white/50 rounded-r-2xl shadow-md">
                      {organization.founderQuote}
                    </blockquote>
                  </div>
                )}

                {/* Decorative hearts */}
                <div className="flex items-center gap-3 mt-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Heart
                      key={i}
                      className="w-6 h-6 text-pink-400 fill-pink-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
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
