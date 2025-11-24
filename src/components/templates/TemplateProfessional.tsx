'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BaseTemplateContent } from '@/types/template-content';
import { Clock, CheckCircle, Award, Users, Briefcase, Shield, Target, TrendingUp, ChevronRight, Star, Calendar } from 'lucide-react';
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

export default function TemplateProfessional({ organization, services, team, content }: TemplateProps) {
  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Excellence Professionnelle',
      description: organization.description || 'Des soins professionnels de qualité supérieure',
      ctaPrimary: 'Prendre Rendez-vous',
      ctaSecondary: 'En savoir plus'
    },
    services: {
      title: 'Nos Services Professionnels',
      description: 'Une gamme complète de soins adaptés à vos besoins'
    },
    cta: {
      title: 'Réservez Votre Consultation',
      description: 'Contactez-nous dès aujourd\'hui',
      button: 'Prendre Rendez-vous'
    },
    footer: {}
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Clean Business Style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {organization.logoUrl ? (
                <Image src={organization.logoUrl} alt={organization.name} width={100} height={40} className="h-8 w-auto" priority />
              ) : (
                <h1 className="text-lg font-semibold text-gray-900">
                  {organization.name}
                </h1>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Services</a>
              <a href="#process" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Processus</a>
              <a href="#certifications" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Certifications</a>
              <a href="#contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              <Link
                href="/booking"
                className="px-5 py-2 rounded-md text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: organization.primaryColor }}
              >
                Consultation
              </Link>
            </nav>

            {/* Mobile Menu */}
            <MobileMenu
              organization={organization}
              menuItems={[
                { label: 'Services', href: '#services' },
                { label: 'Processus', href: '#process' },
                { label: 'Certifications', href: '#certifications' },
                { label: 'Contact', href: '#contact' }
              ]}
              ctaLabel="Consultation"
              ctaHref="/booking"
              theme="light"
            />
          </div>
        </div>
      </header>

      {/* Hero Section - Business Dashboard Style */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 border-b border-gray-200">
        {/* Breadcrumb-style navigation bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Accueil</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-900 font-medium">Services Professionnels</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* Main Split Layout: Text Left, Stats Grid Right */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Main Content */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium mb-4 w-fit">
                <Briefcase className="w-3.5 h-3.5" />
                Solutions Professionnelles
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {c.hero.title}
              </h1>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                {c.hero.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="px-6 py-2.5 rounded-md text-sm font-medium text-white transition-colors hover:opacity-90 inline-flex items-center gap-2"
                  style={{ backgroundColor: organization.primaryColor }}
                >
                  <Calendar className="w-4 h-4" />
                  {c.hero.ctaPrimary}
                </Link>
                <Link
                  href="#services"
                  className="px-6 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Découvrir nos services
                </Link>
              </div>
            </div>

            {/* Right: 2x2 Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, value: '100%', label: 'Certification', sublabel: 'Standards ISO' },
                { icon: Users, value: '2500+', label: 'Clients', sublabel: 'Clients actifs' },
                { icon: Award, value: '15 ans', label: 'Expérience', sublabel: 'Sur le marché' },
                { icon: TrendingUp, value: '98%', label: 'Satisfaction', sublabel: 'Taux de retour' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <stat.icon className="w-6 h-6 mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs font-medium text-gray-700">{stat.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Full-width Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-gray-200 rounded-lg p-4">
            {[
              { icon: Target, label: 'Prestations réalisées', value: '15,000+' },
              { icon: Clock, label: 'Disponibilité', value: '6j/7' },
              { icon: CheckCircle, label: 'Qualité garantie', value: '100%' },
              { icon: Star, label: 'Note moyenne', value: '4.9/5' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-md">
                  <item.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Table-like Vertical List */}
      <section id="services" className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{c.services.title}</h2>
            <p className="text-sm text-gray-600">{c.services.description}</p>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-y border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-5">Service</div>
            <div className="col-span-2">Durée</div>
            <div className="col-span-2">Prix</div>
            <div className="col-span-2"></div>
          </div>

          {/* Service Rows */}
          <div className="bg-white border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
            {services.slice(0, 8).map((service, idx) => (
              <div
                key={service.id}
                className={`grid md:grid-cols-12 gap-4 px-4 py-4 items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {/* Icon Column */}
                <div className="col-span-12 md:col-span-1">
                  <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* Service Name Column */}
                <div className="col-span-12 md:col-span-5">
                  <h3 className="text-sm font-semibold text-gray-900">{service.name}</h3>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{service.description}</p>
                  )}
                </div>

                {/* Duration Column */}
                <div className="col-span-6 md:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">{service.duration} min</span>
                  </div>
                </div>

                {/* Price Column */}
                <div className="col-span-6 md:col-span-2">
                  <div className="text-base font-bold text-gray-900">{service.price}€</div>
                  <div className="text-xs text-gray-500">TTC</div>
                </div>

                {/* Action Button Column */}
                <div className="col-span-12 md:col-span-2">
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-md text-xs font-medium text-white transition-colors hover:opacity-90 w-full md:w-auto"
                    style={{ backgroundColor: organization.primaryColor }}
                  >
                    Réserver
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Link */}
          {services.length > 8 && (
            <div className="mt-6 text-center">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: organization.primaryColor }}
              >
                Voir tous nos services ({services.length})
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Process Section - Timeline Style */}
      <section id="process" className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Notre Processus</h2>
            <p className="text-sm text-gray-600">Une approche méthodique pour des résultats optimaux</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Consultation',
                description: 'Analyse personnalisée de vos besoins et objectifs',
                icon: Target
              },
              {
                step: '02',
                title: 'Planification',
                description: 'Élaboration d\'un plan de traitement sur mesure',
                icon: Calendar
              },
              {
                step: '03',
                title: 'Réalisation',
                description: 'Prestations effectuées par nos experts certifiés',
                icon: Briefcase
              },
              {
                step: '04',
                title: 'Suivi',
                description: 'Accompagnement continu et ajustements si nécessaire',
                icon: TrendingUp
              }
            ].map((process, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl font-bold text-blue-100">{process.step}</div>
                    <div className="p-2 bg-blue-50 rounded-md">
                      <process.icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{process.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{process.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Certifications & Garanties</h2>
            <p className="text-sm text-gray-600">Des standards de qualité reconnus et certifiés</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Certification Professionnelle',
                description: 'Tous nos praticiens sont certifiés et régulièrement formés aux dernières techniques',
                badge: 'ISO 9001'
              },
              {
                icon: Award,
                title: 'Labels Qualité',
                description: 'Respect des normes d\'hygiène et de sécurité les plus strictes',
                badge: 'Excellence'
              },
              {
                icon: CheckCircle,
                title: 'Garantie Satisfaction',
                description: 'Engagement qualité avec garantie de satisfaction sur toutes nos prestations',
                badge: '100%'
              }
            ].map((cert, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <cert.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {cert.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{cert.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Professional Cards */}
      {team && team.length > 0 && (
        <section id="equipe" className="py-16 px-4 sm:px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Notre Équipe</h2>
              <p className="text-sm text-gray-600">Des professionnels expérimentés à votre service</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 flex-shrink-0"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, #3B82F6, #1E40AF)`
                      }}
                    >
                      {!member.imageUrl && member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-xs text-gray-600 mb-3">{member.role}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Award className="w-3.5 h-3.5" />
                        <span>Expert certifié</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Founder Section - Business Card Style */}
      {organization.founderName && (
        <section className="py-16 px-4 sm:px-6 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {organization.founderImage && (
                  <div className="relative">
                    <Image
                      src={organization.founderImage}
                      alt={organization.founderName}
                      width={400}
                      height={500}
                      className="rounded-lg w-full h-auto object-cover border border-gray-200"
                    />
                  </div>
                )}
                <div className={organization.founderImage ? '' : 'md:col-span-2'}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium mb-4">
                    <Users className="w-3.5 h-3.5" />
                    Direction
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {organization.founderName}
                  </h3>
                  {organization.founderTitle && (
                    <p className="text-sm text-gray-600 mb-6">
                      {organization.founderTitle}
                    </p>
                  )}
                  {organization.founderQuote && (
                    <blockquote className="text-base leading-relaxed text-gray-700 border-l-4 border-blue-600 pl-4">
                      "{organization.founderQuote}"
                    </blockquote>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Business Style */}
      <section id="contact" className="py-16 px-4 sm:px-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-md text-xs font-medium mb-4">
                <Calendar className="w-3.5 h-3.5" />
                Réservation en ligne
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                Planifiez votre consultation
              </h2>
              <p className="text-sm text-gray-300 mb-6">
                Réservez votre rendez-vous en ligne en quelques clics. Notre équipe vous accompagne pour des résultats optimaux.
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: organization.primaryColor }}
              >
                Prendre rendez-vous
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Informations de contact</h3>
              <div className="space-y-3 text-sm text-gray-300">
                {organization.phone && (
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>Téléphone: {organization.phone}</span>
                  </div>
                )}
                {organization.email && (
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>Email: {organization.email}</span>
                  </div>
                )}
                {organization.address && (
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <span>{organization.address}, {organization.city}</span>
                  </div>
                )}
              </div>
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
